import { Link } from "react-router-dom";
import RowActions from "../ui/RowActions";
import StatusBadge from "./StatusBadge";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import {
  STATUS_ACTION_LABELS,
  STATUS_TRANSITIONS,
  isEditable,
} from "../../utils/invoiceStatus";

const COLUMNS = "lg:grid-cols-[minmax(0,2fr)_96px_minmax(0,1fr)_220px]";

// A draft that is no longer wanted is deleted, so no "cancel" button for it
const getNextStatuses = (invoice) =>
  (STATUS_TRANSITIONS[invoice.status] ?? []).filter(
    (next) => !(invoice.status === "draft" && next === "cancelled")
  );

function InvoiceTable({ invoices, busyId, onEdit, onDelete, onStatusChange }) {
  return (
    <div className="lg:overflow-hidden lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:shadow-sm">
      {/* Column titles: only on large screens */}
      <div
        aria-hidden="true"
        className={`hidden gap-4 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid ${COLUMNS}`}
      >
        <span>Invoice</span>
        <span>Status</span>
        <span className="text-right">Total</span>
        <span />
      </div>

      <ul className="space-y-3 lg:space-y-0 lg:divide-y lg:divide-slate-100">
        {invoices.map((invoice) => {
          const busy = busyId === invoice._id;

          return (
            <li
              key={invoice._id}
              className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid lg:items-center lg:gap-4 lg:rounded-none lg:border-0 lg:px-5 lg:py-4 lg:shadow-none ${COLUMNS}`}
            >
              <div>
                <Link
                to={`/invoices/${invoice._id}`}
                className="inline-block text-sm font-semibold text-[#0B1730] hover:text-[#12B8A6] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#12B8A6]"
                >
                  {invoice.invoiceNumber}
                </Link>

                <p className="mt-0.5 break-words text-sm text-slate-600">
                  {invoice.customer?.name}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Due {formatDate(invoice.dueDate)}
                </p>
              </div>

              <div className="mt-3 lg:mt-0">
                <StatusBadge status={invoice.status} />
              </div>

              <p className="mt-2 text-sm font-semibold text-[#0B1730] lg:mt-0 lg:text-right">
                {formatCurrency(invoice.total, invoice.currency)}
              </p>

              <div className="-mb-1 -ml-3 mt-3 flex flex-wrap items-center gap-1 empty:hidden lg:m-0 lg:justify-end lg:empty:block">
                
                <Link
                to={`/invoices/${invoice._id}`}
                aria-label={`View ${invoice.invoiceNumber}`}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#0F766E] hover:bg-[#12B8A6]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#12B8A6]"
                >
                    View
                </Link>

                {getNextStatuses(invoice).map((next) => (
                  <button
                    key={next}
                    type="button"
                    disabled={busy}
                    onClick={() => onStatusChange(invoice, next)}
                    aria-label={`${STATUS_ACTION_LABELS[next]} ${invoice.invoiceNumber}`}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${
                      next === "cancelled"
                        ? "text-red-600 hover:bg-red-50 focus-visible:outline-red-500"
                        : "text-[#0F766E] hover:bg-[#12B8A6]/10 focus-visible:outline-[#12B8A6]"
                    }`}
                  >
                    {STATUS_ACTION_LABELS[next]}
                  </button>
                ))}

                {isEditable(invoice.status) && (
                  <RowActions
                    label={invoice.invoiceNumber}
                    onEdit={() => onEdit(invoice)}
                    onDelete={() => onDelete(invoice)}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default InvoiceTable;