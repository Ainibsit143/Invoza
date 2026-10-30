import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import InvoiceForm from "../../components/invoices/InvoiceForm";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { customerService } from "../../services/customers";
import { invoiceService } from "../../services/invoices";
import { productService } from "../../services/products";
import { isEditable } from "../../utils/invoiceStatus";

function InvoiceEditor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  // { customers, products, invoice } once everything is loaded
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const [customers, products, invoice] = await Promise.all([
          customerService.list(),
          productService.list(),
          isEdit ? invoiceService.get(id) : Promise.resolve(null),
        ]);

        if (!ignore) {
          setData({ customers, products, invoice });
        }
      } catch (error) {
        if (!ignore) {
          setLoadError(error.message);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [id, isEdit, reloadKey]);

  const handleRetry = () => {
    setLoadError("");
    setReloadKey((key) => key + 1);
  };

  const handleCancel = () => navigate("/invoices");

  // If this throws, InvoiceForm shows the error and stays open
  const handleSave = async (values) => {
    if (isEdit) {
      await invoiceService.update(id, values);
    } else {
      await invoiceService.create(values);
    }

    navigate("/invoices", {
      state: { notice: isEdit ? "Invoice updated" : "Invoice created" },
    });
  };

  const loading = !data && !loadError;
  const invoice = data?.invoice;
  const locked = isEdit && invoice && !isEditable(invoice.status);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to="/invoices"
        className="text-sm font-medium text-[#0F766E] hover:underline"
      >
        &larr; Back to invoices
      </Link>

      <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#0B1730] sm:text-3xl">
        {isEdit
          ? invoice
            ? `Edit ${invoice.invoiceNumber}`
            : "Edit invoice"
          : "New invoice"}
      </h1>

      <div className="mt-6">
        {loading && (
          <div
            role="status"
            className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-16 text-sm text-slate-600"
          >
            <span
              aria-hidden="true"
              className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#12B8A6]"
            />
            Loading...
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

        {locked && (
          <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
            <h2 className="text-base font-semibold text-[#0B1730]">
              This invoice can no longer be edited
            </h2>
            <p className="mt-1 max-w-sm text-sm text-slate-600">
              Only draft invoices can be edited. This one is already{" "}
              {invoice.status}.
            </p>
            <Button onClick={handleCancel} className="mt-5">
              Back to invoices
            </Button>
          </div>
        )}

        {data && !locked && (
          <InvoiceForm
            invoice={invoice}
            customers={data.customers}
            products={data.products}
            defaultCurrency={user?.currency ?? "USD"}
            onSubmit={handleSave}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}

export default InvoiceEditor;