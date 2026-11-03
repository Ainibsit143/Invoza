// Today as YYYY-MM-DD in the user's own time zone
export function getToday() {
  return new Date().toLocaleDateString("en-CA");
}

// Unique currencies used by the invoices, sorted A to Z
export function getInvoiceCurrencies(invoices) {
  return [...new Set(invoices.map((invoice) => invoice.currency))].sort();
}

const roundMoney = (amount) => Math.round(amount * 100) / 100;

// Stats for ONE currency (different currencies are never added together)
export function calculateInvoiceStats(invoices, currency, today = getToday()) {
  const stats = {
    invoiced: { amount: 0, count: 0 },
    paid: { amount: 0, count: 0 },
    pending: { amount: 0, count: 0 },
    overdue: { amount: 0, count: 0 },
  };

  for (const invoice of invoices) {
    if (invoice.currency !== currency) continue;

    // Drafts and cancelled invoices are not counted
    if (invoice.status !== "sent" && invoice.status !== "paid") continue;

    stats.invoiced.amount += invoice.total;
    stats.invoiced.count += 1;

    if (invoice.status === "paid") {
      stats.paid.amount += invoice.total;
      stats.paid.count += 1;
      continue;
    }

    // Sent but not paid: overdue if the due date has passed
    const dueDate = String(invoice.dueDate).slice(0, 10);
    const bucket = dueDate < today ? stats.overdue : stats.pending;

    bucket.amount += invoice.total;
    bucket.count += 1;
  }

  for (const key of Object.keys(stats)) {
    stats[key].amount = roundMoney(stats[key].amount);
  }

  return stats;
}

// True when an invoice is sent (unpaid) and its due date has passed
export function isInvoiceOverdue(invoice, today = getToday()) {
  if (invoice.status !== "sent") return false;

  return String(invoice.dueDate).slice(0, 10) < today;
}
