import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import Button from "../ui/Button";
import Textarea from "../ui/Textarea";
import InvoiceDetailsFields from "./InvoiceDetailsFields";
import InvoiceItemsEditor from "./InvoiceItemsEditor";
import InvoiceTotals from "./InvoiceTotals";
import { toDateInputValue } from "../../utils/formatDate";

// Local calendar date as YYYY-MM-DD (the "en-CA" format)
const toLocalInputDate = (date) => date.toLocaleDateString("en-CA");

function getDefaultValues(invoice, defaultCurrency) {
  if (invoice) {
    return {
      customerId: invoice.customerId,
      issueDate: toDateInputValue(invoice.issueDate),
      dueDate: toDateInputValue(invoice.dueDate),
      currency: invoice.currency,
      taxRate: String(invoice.taxRate ?? 0),
      notes: invoice.notes ?? "",
      items: invoice.items.map((item) => ({
        productId: item.productId,
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
      })),
    };
  }

  const issueDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);

  return {
    customerId: "",
    issueDate: toLocalInputDate(issueDate),
    dueDate: toLocalInputDate(dueDate),
    currency: defaultCurrency,
    taxRate: "0",
    notes: "",
    items: [{ productId: "", quantity: "1", unitPrice: "" }],
  };
}

function InvoiceForm({
  invoice,
  customers,
  products,
  defaultCurrency = "USD",
  onSubmit,
  onCancel,
}) {
  const [serverError, setServerError] = useState("");

  const methods = useForm({
    defaultValues: getDefaultValues(invoice, defaultCurrency),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const submit = async (values) => {
    setServerError("");

    try {
      await onSubmit({
        customerId: values.customerId,
        items: values.items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
        currency: values.currency,
        issueDate: values.issueDate,
        dueDate: values.dueDate,
        taxRate: Number(values.taxRate),
        notes: values.notes.trim(),
      });
    } catch (error) {
      setServerError(error.message);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(submit)} noValidate className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <InvoiceDetailsFields customers={customers} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <InvoiceItemsEditor products={products} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <Textarea
            label="Notes (optional)"
            name="notes"
            rows={4}
            placeholder="Payment terms, bank details, thank-you note..."
            error={errors.notes?.message}
            register={register("notes", {
              maxLength: {
                value: 1000,
                message: "Notes must be 1000 characters or fewer",
              },
            })}
          />
        </div>

        <InvoiceTotals />

        {serverError && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {serverError}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : invoice
                ? "Save changes"
                : "Create invoice"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

export default InvoiceForm;