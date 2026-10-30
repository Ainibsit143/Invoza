// Dates are stored at UTC midnight, so we show them in UTC too.
// That way the calendar day is the same in every time zone.
const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function toValidDate(value) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// "2026-10-30T00:00:00.000Z" -> "30 Oct 2026"
export function formatDate(value) {
  const date = toValidDate(value);
  return date ? dateFormatter.format(date) : "—";
}

// "2026-10-30T00:00:00.000Z" -> "2026-10-30" (for <input type="date">)
export function toDateInputValue(value) {
  const date = toValidDate(value);
  return date ? date.toISOString().slice(0, 10) : "";
}