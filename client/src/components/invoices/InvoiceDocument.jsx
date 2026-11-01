import InvozaLogo from "../ui/InvozaLogo";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

const DAY = 24 * 60 * 60 * 1000;

const ITEM_COLUMNS = "grid-cols-[minmax(0,1fr)_4rem_7.5rem_7.5rem]";

const TOTAL_LABELS = {
  paid: "Total paid",
  cancelled: "Total (cancelled)",
};

function MetaRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <dt className="font-semibold text-[#0B1730]">{label}</dt>
      <dd className="text-right text-slate-700">{children}</dd>
    </div>
  );
}

// One fixed layout. InvoiceFit scales it down on small screens.
function InvoiceDocument({ invoice }) {
  const business = invoice.business ?? {};
  const customer = invoice.customer ?? {};
  const initial = business.name?.trim().charAt(0).toUpperCase();

  const money = (amount) => formatCurrency(amount, invoice.currency);

  const termDays = Math.round(
    (new Date(invoice.dueDate) - new Date(invoice.issueDate)) / DAY
  );

  const fromLines = [
    business.address,
    business.email,
    business.phone,
    business.taxId && `Tax ID: ${business.taxId}`,
  ].filter(Boolean);

  const customerLines = [
    customer.address,
    customer.email,
    customer.phone,
  ].filter(Boolean);

  return (
    <article
      style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
      className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm print:rounded-none print:border-0 print:shadow-none"
    >
            <div className="flex min-h-[1018px] flex-col p-8 print:min-h-[270mm]">
        <h2 className="sr-only">Invoice {invoice.invoiceNumber}</h2>

        {/* Top: business name */}
        <div className="flex min-w-0 items-center gap-3">
          {business.name ? (
            <>
              <span
                aria-hidden="true"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0B1730] text-xl font-bold text-[#12B8A6]"
              >
                {initial}
              </span>
              <p className="break-words text-xl font-bold tracking-tight text-[#0B1730]">
                {business.name}
              </p>
            </>
          ) : (
            <p className="text-3xl font-bold tracking-tight text-[#0F766E]">
              INVOICE
            </p>
          )}
        </div>

        {/* Billed to and invoice details side by side */}
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-slate-100 p-4">
            <p className="text-sm font-bold uppercase tracking-wide text-[#0B1730]">
              Billed to:
            </p>
            {customer.name && (
              <p className="mt-2 break-words text-sm font-semibold text-[#0B1730]">
                {customer.name}
              </p>
            )}
            {customerLines.map((line, index) => (
              <p
                key={index}
                className="mt-0.5 whitespace-pre-line break-words text-sm text-slate-600"
              >
                {line}
              </p>
            ))}
          </div>

          <dl className="space-y-2 rounded-lg bg-slate-100 p-4 text-sm">
            <MetaRow label="Invoice Number">{invoice.invoiceNumber}</MetaRow>
            <MetaRow label="Date">{formatDate(invoice.issueDate)}</MetaRow>
            <MetaRow label="Due Date">{formatDate(invoice.dueDate)}</MetaRow>
          </dl>
        </div>

        {/* Items */}
        <div className="mt-6">
          <div
            className={`grid divide-x divide-white/30 bg-[#0F766E] text-xs font-bold uppercase tracking-wide text-white ${ITEM_COLUMNS}`}
          >
            <span className="px-3 py-3">Description</span>
            <span className="px-3 py-3 text-center">Qty</span>
            <span className="px-3 py-3 text-right">
              Unit price ({invoice.currency})
            </span>
            <span className="px-3 py-3 text-right">
              Total ({invoice.currency})
            </span>
          </div>

          <ul className="border-x border-b border-slate-300">
            {invoice.items.map((item, index) => (
              <li
                key={`${item.productId}-${index}`}
                className={`grid divide-x divide-slate-300 border-t border-slate-300 first:border-t-0 ${ITEM_COLUMNS}`}
              >
                <div className="min-w-0 px-3 py-3">
                  <p className="break-words text-sm font-semibold text-[#0B1730]">
                    {item.name}
                  </p>
                  {item.description && (
                    <p className="mt-0.5 whitespace-pre-line break-words text-xs text-slate-500">
                      {item.description}
                    </p>
                  )}
                </div>

                <p className="px-3 py-3 text-center text-sm text-slate-700">
                  {item.quantity}
                </p>
                <p className="px-3 py-3 text-right text-sm text-slate-700">
                  {money(item.unitPrice)}
                </p>
                <p className="px-3 py-3 text-right text-sm font-semibold text-[#0B1730]">
                  {money(item.lineTotal)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Totals */}
        <dl className="ml-auto mt-3 w-full max-w-sm space-y-1 text-sm">
          <div className="flex items-center justify-between gap-4 px-3 py-1">
            <dt className="uppercase tracking-wide text-slate-600">
              Subtotal ({invoice.currency})
            </dt>
            <dd className="font-medium text-[#0B1730]">
              {money(invoice.subtotal)}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4 px-3 py-1">
            <dt className="uppercase tracking-wide text-slate-600">
              Tax ({invoice.taxRate}%)
            </dt>
            <dd className="font-medium text-[#0B1730]">
              {money(invoice.taxAmount)}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4 bg-slate-200 px-3 py-2">
            <dt className="font-bold uppercase tracking-wide text-[#0B1730]">
              Grand total ({invoice.currency})
            </dt>
            <dd className="font-bold text-[#0B1730]">{money(invoice.total)}</dd>
          </div>
        </dl>

        <div className="ml-auto mt-4 w-full max-w-sm border-b-4 border-double border-slate-400 pb-2 text-right">
          <p className="break-words text-2xl font-extrabold uppercase tracking-tight text-[#0B1730]">
            {TOTAL_LABELS[invoice.status] ?? "Total due"}: {money(invoice.total)}
          </p>
        </div>

        {/* Terms, payment details, business details */}
        <div className="mt-8 grid grid-cols-2 gap-6">
          <div className="space-y-4">
            {Number.isFinite(termDays) && termDays > 0 && (
              <p className="text-sm font-semibold text-[#0B1730]">
                Payment due within {termDays} {termDays === 1 ? "day" : "days"}
              </p>
            )}

            {business.paymentDetails && (
              <div className="rounded-lg bg-slate-100 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Payment details
                </p>
                <p className="mt-2 whitespace-pre-line break-words text-sm text-[#0B1730]">
                  {business.paymentDetails}
                </p>
              </div>
            )}

            {invoice.notes && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Notes
                </p>
                <p className="mt-2 whitespace-pre-line break-words text-sm text-slate-700">
                  {invoice.notes}
                </p>
              </div>
            )}
          </div>

          {(business.name || fromLines.length > 0) && (
            <div className="min-w-0 text-right">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                From
              </p>
              {business.name && (
                <p className="mt-2 break-words text-sm font-semibold text-[#0B1730]">
                  {business.name}
                </p>
              )}
              {fromLines.map((line, index) => (
                <p
                  key={index}
                  className="mt-0.5 whitespace-pre-line break-words text-sm text-slate-600"
                >
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>

                {/* Footer: Powered by Invoza (stays at the bottom of the page) */}
        <div className="mt-auto pt-8">
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
            <span>Powered by</span>
            <InvozaLogo className="text-base" />
          </div>
        </div>
      </div>
    </article>
  );
}

export default InvoiceDocument;