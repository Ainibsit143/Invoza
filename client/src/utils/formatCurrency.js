export function formatCurrency(amount, currency = "USD") {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return "—";
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    // Unknown currency code: still show something readable
    return `${currency} ${value.toFixed(2)}`;
  }
}