// Format a whole-rupee amount as INR currency.
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format an ISO date (YYYY-MM-DD) as a readable label.
export function formatDate(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// Short date range label used on cards.
export function formatRange(checkIn: string, checkOut: string): string {
  return `${formatDate(checkIn)} – ${formatDate(checkOut)}`;
}

// Today as YYYY-MM-DD, used as the minimum for date inputs.
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// Whole nights between two ISO dates.
export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn + "T00:00:00").getTime();
  const b = new Date(checkOut + "T00:00:00").getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

// True when [checkIn, checkOut) overlaps any confirmed unavailable range.
export function overlapsUnavailable(
  checkIn: string,
  checkOut: string,
  ranges: { check_in: string; check_out: string }[]
): boolean {
  if (!checkIn || !checkOut) return false;
  return ranges.some((r) => r.check_in < checkOut && r.check_out > checkIn);
}
