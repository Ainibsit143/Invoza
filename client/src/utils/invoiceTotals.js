const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

// For showing totals while the user types.
// The server calculates the real totals when the invoice is saved.
export function calculateInvoiceTotals(items, taxRate) {
  const lineTotals = items.map((item) =>
    roundMoney((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0))
  );

  const subtotal = roundMoney(lineTotals.reduce((sum, total) => sum + total, 0));
  const taxAmount = roundMoney((subtotal * (Number(taxRate) || 0)) / 100);

  return {
    lineTotals,
    subtotal,
    taxAmount,
    total: roundMoney(subtotal + taxAmount),
  };
}