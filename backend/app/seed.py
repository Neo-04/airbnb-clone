from __future__ import annotations

from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.enums import BookingStatus, UserRole
from app.models import (
    Amenity,
    Booking,
    Favourite,
    Listing,
    ListingImage,
    Review,
    User,
)

# Service fee used only when generating seed booking snapshots (authoritative logic lands in Phase 4).
SEED_SERVICE_FEE_RATE = 0.14


# Convert rupees to integer paise for storage.
def to_paise(rupees: float) -> int:
    return int(round(rupees * 100))


# Entry point: seed the database only when it is empty.
def seed_database() -> None:
    db = SessionLocal()
    try:
        # Skip seeding if any users already exist so restarts don't duplicate data.
        if db.scalar(select(func.count()).select_from(User)) > 0:
            return
        _seed_all(db)
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def _seed_all(db: Session) -> None:
    users = _seed_users(db)
    amenities = _seed_amenities(db)
    listings = _seed_listings(db, users, amenities)
    _seed_reviews(db, users, listings)
    _seed_bookings(db, users, listings)
    _seed_favourites(db, users, listings)


def _seed_users(db: Session) -> dict[str, User]:
    people = [
        ("Priya Sharma", "priya.sharma@example.com", UserRole.host, 12),
        ("Rahul Mehta", "rahul.mehta@example.com", UserRole.host, 15),
        ("Neha Kapoor", "neha.kapoor@example.com", UserRole.host, 32),
        ("Aditya Balaji", "aditya.balaji@example.com", UserRole.guest, 5),
        ("Rohan Verma", "rohan.verma@example.com", UserRole.guest, 8),
    ]
    users: dict[str, User] = {}
    for name, email, role, avatar in people:
        user = User(
            name=name,
            email=email,
            role=role,
            avatar_url=f"https://i.pravatar.cc/150?img={avatar}",
        )
        db.add(user)
        users[email] = user
    db.flush()
    return users


def _seed_amenities(db: Session) -> dict[str, Amenity]:
    items = [
        ("Wi-Fi", "wifi"),
        ("Air conditioning", "air-vent"),
        ("Kitchen", "utensils"),
        ("Free parking", "square-parking"),
        ("Swimming pool", "waves"),
        ("Washing machine", "washing-machine"),
        ("TV", "tv"),
        ("Workspace", "laptop"),
        ("Balcony", "door-open"),
        ("Mountain view", "mountain"),
        ("Sea view", "sailboat"),
        ("Breakfast", "coffee"),
        ("Heating", "thermometer-sun"),
        ("Pet friendly", "paw-print"),
        ("Garden", "trees"),
    ]
    amenities: dict[str, Amenity] = {}
    for name, icon in items:
        amenity = Amenity(name=name, icon=icon)
        db.add(amenity)
        amenities[name] = amenity
    db.flush()
    return amenities


def _images_for(slug: str, count: int) -> list[ListingImage]:
    # Deterministic dev image URLs; swap for real photos later.
    return [
        ListingImage(image_url=f"https://picsum.photos/seed/{slug}-{i}/1200/800", display_order=i)
        for i in range(count)
    ]


def _seed_listings(
    db: Session, users: dict[str, User], amenities: dict[str, Amenity]
) -> list[Listing]:
    priya = users["priya.sharma@example.com"]
    rahul = users["rahul.mehta@example.com"]
    neha = users["neha.kapoor@example.com"]

    # (host, title, description, city, country, address, lat, lng, price, cleaning,
    #  type, guests, bedrooms, beds, baths, [amenity names], slug, image_count)
    data = [
        (priya, "Sea-view villa near Baga Beach",
         "Private villa a short walk from Baga Beach with a pool and sunset views.",
         "Goa", "India", "Baga, North Goa", 15.5553, 73.7517,
         12000, 1500, "Villa", 8, 4, 5, 3,
         ["Wi-Fi", "Air conditioning", "Kitchen", "Swimming pool", "Sea view", "Free parking"],
         "goa-villa-baga", 5),
        (rahul, "Cozy mountain cabin in Old Manali",
         "Wooden cabin tucked in Old Manali with a balcony overlooking the valley.",
         "Manali", "India", "Old Manali, Himachal Pradesh", 32.2540, 77.1750,
         4500, 700, "Cabin", 3, 1, 2, 1,
         ["Wi-Fi", "Kitchen", "Mountain view", "Heating", "Balcony"],
         "manali-cabin-old", 4),
        (neha, "Heritage haveli stay in Jaipur",
         "Restored haveli with courtyards, hand-painted walls and rooftop breakfast.",
         "Jaipur", "India", "Pink City, Jaipur", 26.9124, 75.7873,
         7800, 1000, "Villa", 6, 3, 4, 3,
         ["Wi-Fi", "Air conditioning", "Breakfast", "Free parking", "Workspace"],
         "jaipur-haveli", 5),
        (priya, "Modern apartment in Bandra",
         "Bright 2BHK in Bandra West, close to cafes, the sea link and nightlife.",
         "Mumbai", "India", "Bandra West, Mumbai", 19.0596, 72.8295,
         6500, 900, "Apartment", 4, 2, 2, 2,
         ["Wi-Fi", "Air conditioning", "Kitchen", "TV", "Washing machine", "Workspace"],
         "mumbai-bandra-apt", 4),
        (rahul, "Chic studio in South Delhi",
         "Compact designer studio in a quiet South Delhi lane, great for solo trips.",
         "Delhi", "India", "Hauz Khas, New Delhi", 28.5245, 77.1855,
         3800, 600, "Apartment", 2, 0, 1, 1,
         ["Wi-Fi", "Air conditioning", "Kitchen", "TV", "Workspace"],
         "delhi-studio-hauzkhas", 3),
        (neha, "Bright loft near Indiranagar",
         "Sunlit loft steps from Indiranagar's cafes, breweries and metro.",
         "Bengaluru", "India", "Indiranagar, Bengaluru", 12.9719, 77.6412,
         4200, 600, "Apartment", 3, 1, 2, 1,
         ["Wi-Fi", "Kitchen", "TV", "Workspace", "Balcony"],
         "bengaluru-loft-indiranagar", 4),
        (priya, "Lakeside cottage in Udaipur",
         "Charming cottage by Fateh Sagar Lake with a garden and evening breeze.",
         "Udaipur", "India", "Fateh Sagar, Udaipur", 24.5854, 73.7125,
         5600, 800, "Cottage", 5, 2, 3, 2,
         ["Wi-Fi", "Air conditioning", "Kitchen", "Garden", "Breakfast"],
         "udaipur-cottage-lake", 4),
        (rahul, "Riverside cabin in Rishikesh",
         "Calm cabin near the Ganga, perfect after a day of rafting and yoga.",
         "Rishikesh", "India", "Tapovan, Rishikesh", 30.0869, 78.2676,
         3500, 500, "Cabin", 4, 2, 2, 1,
         ["Wi-Fi", "Kitchen", "Mountain view", "Garden", "Breakfast"],
         "rishikesh-cabin-river", 4),
        (neha, "Beach house on Anjuna cliff",
         "Airy beach house on the Anjuna cliff with a pool and sweeping sea views.",
         "Goa", "India", "Anjuna, North Goa", 15.5735, 73.7400,
         15000, 1800, "Beach House", 10, 5, 6, 4,
         ["Wi-Fi", "Air conditioning", "Kitchen", "Swimming pool", "Sea view", "Free parking", "Pet friendly"],
         "goa-beachhouse-anjuna", 5),
        (priya, "Apple-orchard farm stay near Manali",
         "Farm stay set in an apple orchard with home-cooked meals and mountain air.",
         "Manali", "India", "Naggar, Himachal Pradesh", 32.1000, 77.1667,
         5200, 700, "Farm Stay", 6, 3, 4, 2,
         ["Wi-Fi", "Kitchen", "Mountain view", "Breakfast", "Garden", "Pet friendly"],
         "manali-farmstay-orchard", 4),
        (rahul, "Palace-view villa in Udaipur",
         "Luxury villa facing the City Palace with a private pool and terrace.",
         "Udaipur", "India", "Lake Pichola, Udaipur", 24.5760, 73.6800,
         16500, 2000, "Villa", 12, 6, 7, 5,
         ["Wi-Fi", "Air conditioning", "Kitchen", "Swimming pool", "Free parking", "Breakfast", "Workspace"],
         "udaipur-villa-palace", 5),
        (neha, "Garden cottage on Jaipur outskirts",
         "Quiet cottage with a large garden, ideal for a relaxed family weekend.",
         "Jaipur", "India", "Amer Road, Jaipur", 26.9855, 75.8513,
         4800, 700, "Cottage", 4, 2, 2, 2,
         ["Wi-Fi", "Air conditioning", "Kitchen", "Garden", "Free parking"],
         "jaipur-cottage-garden", 3),
    ]

    listings: list[Listing] = []
    for row in data:
        (host, title, desc, city, country, address, lat, lng, price, cleaning,
         ptype, guests, bedrooms, beds, baths, amenity_names, slug, img_count) = row
        listing = Listing(
            host=host,
            title=title,
            description=desc,
            city=city,
            country=country,
            address=address,
            latitude=lat,
            longitude=lng,
            price_per_night=to_paise(price),
            cleaning_fee=to_paise(cleaning),
            property_type=ptype,
            max_guests=guests,
            bedrooms=bedrooms,
            beds=beds,
            bathrooms=baths,
            amenities=[amenities[name] for name in amenity_names],
            images=_images_for(slug, img_count),
        )
        db.add(listing)
        listings.append(listing)
    db.flush()
    return listings


def _seed_reviews(db: Session, users: dict[str, User], listings: list[Listing]) -> None:
    aditya = users["aditya.balaji@example.com"]
    rohan = users["rohan.verma@example.com"]

    # (listing index, reviewer, rating, comment)
    entries = [
        (0, aditya, 5, "Stunning villa, the pool and sunset views were unreal."),
        (0, rohan, 4, "Great location near Baga, a little noisy at night."),
        (1, rohan, 5, "Perfect cozy cabin, woke up to amazing valley views."),
        (2, aditya, 5, "The haveli felt like a palace, rooftop breakfast was lovely."),
        (2, rohan, 4, "Beautiful heritage stay, staff were very helpful."),
        (3, aditya, 4, "Comfortable and central, walkable to everything in Bandra."),
        (5, rohan, 4, "Bright loft, super close to all the Indiranagar cafes."),
        (6, aditya, 5, "Loved the lakeside garden, so peaceful in the evenings."),
        (7, rohan, 4, "Calm spot by the river, great after rafting."),
        (8, aditya, 5, "Best beach house we've stayed in, views from every room."),
        (8, rohan, 5, "Spacious and clean, the pool was a highlight."),
        (10, aditya, 5, "Incredible palace views, felt like a luxury resort."),
    ]
    for idx, reviewer, rating, comment in entries:
        db.add(
            Review(
                listing=listings[idx],
                user=reviewer,
                rating=rating,
                comment=comment,
            )
        )
    db.flush()

    # Set each listing's displayed rating to the average of its seeded reviews.
    for listing in listings:
        if listing.reviews:
            avg = sum(r.rating for r in listing.reviews) / len(listing.reviews)
            listing.rating = round(avg, 2)
    db.flush()


def _seed_bookings(db: Session, users: dict[str, User], listings: list[Listing]) -> None:
    aditya = users["aditya.balaji@example.com"]
    rohan = users["rohan.verma@example.com"]
    today = date.today()

    # (listing index, guest, check_in, nights, guest_count) — dates are relative to today.
    plans = [
        (0, aditya, today + timedelta(days=10), 4, 4),
        (2, rohan, today + timedelta(days=30), 3, 2),
        (1, aditya, today - timedelta(days=15), 5, 2),
        (6, rohan, today + timedelta(days=20), 2, 3),
        (8, aditya, today - timedelta(days=45), 3, 6),
        (4, rohan, today + timedelta(days=55), 5, 2),
    ]
    for idx, guest, check_in, nights, guest_count in plans:
        listing = listings[idx]
        check_out = check_in + timedelta(days=nights)
        subtotal = listing.price_per_night * nights
        service_fee = int(round(subtotal * SEED_SERVICE_FEE_RATE))
        total = subtotal + listing.cleaning_fee + service_fee
        db.add(
            Booking(
                listing=listing,
                guest=guest,
                check_in=check_in,
                check_out=check_out,
                guest_count=guest_count,
                nightly_rate=listing.price_per_night,
                number_of_nights=nights,
                subtotal=subtotal,
                cleaning_fee=listing.cleaning_fee,
                service_fee=service_fee,
                total_price=total,
                status=BookingStatus.confirmed,
            )
        )
    db.flush()


def _seed_favourites(db: Session, users: dict[str, User], listings: list[Listing]) -> None:
    aditya = users["aditya.balaji@example.com"]
    rohan = users["rohan.verma@example.com"]

    pairs = [
        (aditya, 2),
        (aditya, 8),
        (aditya, 10),
        (rohan, 0),
        (rohan, 6),
    ]
    for user, idx in pairs:
        db.add(Favourite(user=user, listing=listings[idx]))
    db.flush()
