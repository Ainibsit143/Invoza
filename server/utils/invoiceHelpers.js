const STATUS_TRANSITIONS = {
  draft: ["sent", "cancelled"],
  sent: ["paid", "cancelled"],
  paid: [],
  cancelled: [],
};

const canTransition = (from, to) =>
  (STATUS_TRANSITIONS[from] || []).includes(to);

// Round to 2 decimals
const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const calculateTotals = (items, taxRate = 0) => {
  const lineItems = items.map((item) => ({
    ...item,
    lineTotal: roundMoney(item.quantity * item.unitPrice),
  }));

  const subtotal = roundMoney(
    lineItems.reduce((sum, item) => sum + item.lineTotal, 0)
  );
  const taxAmount = roundMoney((subtotal * taxRate) / 100);
  const total = roundMoney(subtotal + taxAmount);

  return { items: lineItems, subtotal, taxAmount, total };
};

module.exports = {
  STATUS_TRANSITIONS,
  canTransition,
  roundMoney,
  calculateTotals,
};