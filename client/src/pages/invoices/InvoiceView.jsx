import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import InvoiceDocument from "../../components/invoices/InvoiceDocument";
import InvoiceFit from "../../components/invoices/InvoiceFit";
import StatusBadge from "../../components/invoices/StatusBadge";
import Button from "../../components/ui/Button";
import { invoiceService } from "../../services/invoices";
import { isEditable } from "../../utils/invoiceStatus";

function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadInvoice() {
      try {
        const data = await invoiceService.get(id);

        if (!ignore) {
          setInvoice(data);
        }
      } catch (error) {
        if (!ignore) {
          setLoadError(error.message);
        }
      }
    }

    loadInvoice();

    return () => {
      ignore = true;
    };
  }, [id, reloadKey]);

  const handleRetry = () => {
    setLoadError("");
    setReloadKey((key) => key + 1);
  };

  // The browser uses the page title as the default PDF file name
  const handlePrint = () => {
    const previousTitle = document.title;

    document.title = invoice.invoiceNumber;
    window.print();
    document.title = previousTitle;
  };

  const loading = !invoice && !loadError;
  const missingBusiness =
    invoice && isEditable(invoice.status) && !invoice.business?.name;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                <div className="flex items-center gap-3">
          <Link
            to="/invoices"
            className="text-sm font-medium text-[#0F766E] hover:underline"
          >
            &larr; Back to invoices
          </Link>
          {invoice && <StatusBadge status={invoice.status} />}
        </div>

        {invoice && (
          <div className="flex flex-wrap items-center gap-3">
            {isEditable(invoice.status) && (
              <Button
                variant="secondary"
                onClick={() => navigate(`/invoices/${invoice._id}/edit`)}
              >
                Edit
              </Button>
            )}
            <Button onClick={handlePrint}>Download PDF</Button>
          </div>
        )}
      </div>

      {invoice && <h1 className="sr-only">Invoice {invoice.invoiceNumber}</h1>}

      {missingBusiness && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 print:hidden">
          Your business details are missing from this invoice. Add them in{" "}
          <Link to="/settings" className="font-semibold underline">
            Settings
          </Link>
          , then open Edit and save to update this draft.
        </div>
      )}

      <div className="mt-6 print:mt-0">
        {loading && (
          <div
            role="status"
            className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-16 text-sm text-slate-600"
          >
            <span
              aria-hidden="true"
              className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#12B8A6]"
            />
            Loading invoice...
          </div>
        )}

        {loadError && (
          <div
            role="alert"
            className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center"
          >
            <p className="text-sm text-red-700">{loadError}</p>
            <Button variant="secondary" onClick={handleRetry}>
              Retry
            </Button>
          </div>
        )}

                {invoice && (
          <InvoiceFit>
            <InvoiceDocument invoice={invoice} />
          </InvoiceFit>
        )}
      </div>
    </div>
  );
}

export default InvoiceView;