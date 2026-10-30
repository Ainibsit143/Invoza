export const INVOICE_STATUSES = ["draft", "sent", "paid", "cancelled"];

export const STATUS_LABELS = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  cancelled: "Cancelled",
};

// Mirrors the server rules (server/utils/invoiceHelpers.js).
// The server still enforces them; this only decides which buttons to show.
export const STATUS_TRANSITIONS = {
  draft: ["sent", "cancelled"],
  sent: ["paid", "cancelled"],
  paid: [],
  cancelled: [],
};

// Only drafts can be edited or deleted
export const isEditable = (status) => status === "draft";


// Button text for moving an invoice to a status
export const STATUS_ACTION_LABELS = {
  sent: "Mark as sent",
  paid: "Mark as paid",
  cancelled: "Cancel invoice",
};