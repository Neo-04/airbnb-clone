"use client";

// Small star + rating label. Shows "New" when there are no reviews.
export function Rating({ rating, count }: { rating: number; count?: number }) {
  if (!rating) return <span className="rating muted">New</span>;
  return (
    <span className="rating">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--star)" aria-hidden="true">
        <path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7L12 2z" />
      </svg>
      {rating.toFixed(2)}
      {typeof count === "number" && count > 0 && (
        <span className="muted">&nbsp;({count})</span>
      )}
    </span>
  );
}

// Wishlist heart. Stops the parent card link when clicked.
export function HeartButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`heart${active ? " active" : ""}`}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21s-7.5-4.6-10-9.3C.4 8.4 2 5 5.3 5c2 0 3.4 1.1 4.7 2.6C11.3 6.1 12.7 5 14.7 5 18 5 19.6 8.4 22 11.7 19.5 16.4 12 21 12 21z" />
      </svg>
    </button>
  );
}

// Coloured pill for booking / trip status.
export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  return <span className={`badge badge-${key}`}>{status}</span>;
}
