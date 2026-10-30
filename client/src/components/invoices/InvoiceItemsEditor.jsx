import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Link } from "react-router-dom";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import { formatCurrency } from "../../utils/formatCurrency";
import { calculateInvoiceTotals } from "../../utils/invoiceTotals";

const COLUMNS =
  "grid grid-cols-2 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_auto]";

function InvoiceItemsEditor({ products }) {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = useWatch({ control, name: "items" }) ?? [];
  const currency = useWatch({ control, name: "currency" });
  const { lineTotals } = calculateInvoiceTotals(items, 0);

  return (
    <section aria-labelledby="items-heading">
      <div className="flex items-center justify-between gap-4">
        <h2
          id="items-heading"
          className="text-base font-semibold text-[#0B1730]"
        >
          Items
        </h2>
        <Button
          variant="secondary"
          onClick={() =>
            append({ productId: "", quantity: "1", unitPrice: "" })
          }
        >
          Add item
        </Button>
      </div>

      {products.length === 0 && (
        <p className="mt-3 text-sm text-slate-600">
          You have no products yet.{" "}
          <Link
            to="/products"
            className="font-medium text-[#0F766E] underline"
          >
            Add a product
          </Link>{" "}
          first.
        </p>
      )}

      <ul className="mt-4 space-y-4">
        {fields.map((field, index) => {
          const fieldErrors = errors.items?.[index];

          return (
            <li
              key={field.id}
              className={`rounded-2xl border border-slate-200 bg-slate-50/60 p-4 ${COLUMNS}`}
            >
              <div className="col-span-2 lg:col-span-1">
                <Select
                  label="Product or service"
                  name={`items.${index}.productId`}
                  error={fieldErrors?.productId?.message}
                  register={register(`items.${index}.productId`, {
                    required: "Choose a product",
                    onChange: (event) => {
                      const product = products.find(
                        (item) => item._id === event.target.value
                      );

                      if (product) {
                        setValue(
                          `items.${index}.unitPrice`,
                          String(product.price),
                          { shouldValidate: true }
                        );
                      }
                    },
                  })}
                >
                  <option value="">Choose a product</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name}
                    </option>
                  ))}
                </Select>
              </div>

              <Input
                label="Quantity"
                name={`items.${index}.quantity`}
                type="number"
                inputMode="numeric"
                step="1"
                min="1"
                autoComplete="off"
                error={fieldErrors?.quantity?.message}
                register={register(`items.${index}.quantity`, {
                  required: "Quantity is required",
                  validate: (value) =>
                    (/^\d+$/.test(String(value).trim()) &&
                      Number(value) >= 1) ||
                    "Whole number, 1 or more",
                })}
              />

              <Input
                label={`Unit price${currency ? ` (${currency})` : ""}`}
                name={`items.${index}.unitPrice`}
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                autoComplete="off"
                placeholder="0.00"
                error={fieldErrors?.unitPrice?.message}
                register={register(`items.${index}.unitPrice`, {
                  required: "Price is required",
                  validate: (value) =>
                    /^\d+(\.\d{1,2})?$/.test(String(value).trim()) ||
                    "Up to 2 decimals, 0 or more",
                })}
              />

              <div className="space-y-2">
                <p className="text-sm font-medium text-[#0B1730]">Line total</p>
                <p className="py-3 text-sm font-semibold text-[#0B1730]">
                  {formatCurrency(lineTotals[index] ?? 0, currency || "USD")}
                </p>
              </div>

              <div className="flex items-end justify-end">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  aria-label={`Remove item ${index + 1}`}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default InvoiceItemsEditor;