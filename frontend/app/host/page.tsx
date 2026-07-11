"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { formatMoney, formatRange } from "@/lib/format";
import { useUser } from "@/lib/user-context";
import type { HostBookingItem, HostListing, HostStats } from "@/types";
import { HostOnly } from "@/components/HostOnly";
import { ConfirmModal } from "@/components/ConfirmModal";
import { StatusBadge } from "@/components/Badges";
import { Loading, ErrorState } from "@/components/States";

function Dashboard() {
  const { ready, userId } = useUser();
  const [stats, setStats] = useState<HostStats | null>(null);
  const [listings, setListings] = useState<HostListing[]>([]);
  const [bookings, setBookings] = useState<HostBookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load stats, owned listings, and received bookings together.
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, l, b] = await Promise.all([api.hostStats(), api.hostListings(), api.hostBookings()]);
      setStats(s);
      setListings(l);
      setBookings(b.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready) load();
  }, [ready, userId, load]);

  // Delete an owned listing, then refresh the dashboard.
  const confirmDelete = async () => {
    if (deleteId == null) return;
    setDeleting(true);
    try {
      await api.deleteListing(deleteId);
      toast.success("Listing deleted");
      setDeleteId(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete listing");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loading label="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <div className="row-between" style={{ marginBottom: 20 }}>
        <h1 className="page-title" style={{ margin: 0 }}>
          Host dashboard
        </h1>
        <Link href="/host/listings/new" className="btn btn-primary">
          + Add listing
        </Link>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat">
            <div className="stat-value">{stats.total_listings}</div>
            <div className="stat-label">Total listings</div>
          </div>
          <div className="stat">
            <div className="stat-value">{stats.total_bookings}</div>
            <div className="stat-label">Total bookings</div>
          </div>
          <div className="stat">
            <div className="stat-value">{stats.upcoming_bookings}</div>
            <div className="stat-label">Upcoming bookings</div>
          </div>
          <div className="stat">
            <div className="stat-value">{formatMoney(stats.total_confirmed_revenue)}</div>
            <div className="stat-label">Confirmed revenue</div>
          </div>
        </div>
      )}

      <h2 className="section-title">Your listings</h2>
      {listings.length === 0 ? (
        <p className="muted">You have no listings yet.</p>
      ) : (
        <div className="panel" style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Location</th>
                <th>Type</th>
                <th>Price</th>
                <th>Guests</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id}>
                  <td>
                    <Link href={`/listings/${l.id}`}>{l.title}</Link>
                  </td>
                  <td>
                    {l.city}, {l.country}
                  </td>
                  <td>{l.property_type}</td>
                  <td>{formatMoney(l.price_per_night)}</td>
                  <td>{l.max_guests}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <Link href={`/host/listings/${l.id}/edit`} className="btn btn-outline btn-sm">
                      Edit
                    </Link>{" "}
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(l.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="section-title">Received bookings</h2>
      {bookings.length === 0 ? (
        <p className="muted">No bookings on your listings yet.</p>
      ) : (
        <div className="panel" style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Listing</th>
                <th>Guest</th>
                <th>Dates</th>
                <th>Guests</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.listing.title}</td>
                  <td>{b.guest.name}</td>
                  <td>{formatRange(b.check_in, b.check_out)}</td>
                  <td>{b.guest_count}</td>
                  <td>{formatMoney(b.total_price)}</td>
                  <td>
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteId != null && (
        <ConfirmModal
          title="Delete this listing?"
          message="This will permanently remove the listing and its bookings. This cannot be undone."
          confirmLabel="Delete listing"
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}

export default function HostPage() {
  return (
    <HostOnly>
      <Dashboard />
    </HostOnly>
  );
}
