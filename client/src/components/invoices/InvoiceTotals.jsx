import { useFormContext, useWatch } from "react-hook-form";

import { formatCurrency } from "../../utils/formatCurrency";
import { calculateInvoiceTotals } from "../../utils/invoiceTotals";

function InvoiceTotals() {
  const { control } = useFormContext();

  const items = useWatch({ control, name: "items" }) ?? [];
  const taxRate = useWatch({ control, name: "taxRate" });
  const currency = useWatch({ control, name: "currency" }) || "USD";

  const { subtotal, taxAmount, total } = calculateInvoiceTotals(items, taxRate);

  return (
    <dl className="ml-auto w-full space-y-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm sm:max-w-xs">
      <div className="flex items-center justify-between gap-4">
        <dt className="text-slate-600">Subtotal</dt>
        <dd className="font-medium text-[#0B1730]">
          {formatCurrency(subtotal, currency)}
        </dd>
      </div>

      <div className="flex items-center justify-between gap-4">
        <dt className="text-slate-600">Tax ({Number(taxRate) || 0}%)</dt>
        <dd className="font-medium text-[#0B1730]">
          {formatCurrency(taxAmount, currency)}
        </dd>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-3">
        <dt className="font-semibold text-[#0B1730]">Total</dt>
        <dd className="text-base font-bold text-[#0B1730]">
          {formatCurrency(total, currency)}
        </dd>
      </div>
    </dl>
  );
}

export default InvoiceTotals;