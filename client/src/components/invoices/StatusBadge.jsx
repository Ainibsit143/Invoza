import { STATUS_LABELS } from "../../utils/invoiceStatus";

const STYLES = {
  draft: "bg-slate-100 text-slate-600 ring-slate-200",
  sent: "bg-sky-50 text-sky-700 ring-sky-200",
  paid: "bg-teal-50 text-teal-700 ring-teal-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        STYLES[status] ?? STYLES.draft
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export default StatusBadge;