import { useFormContext } from "react-hook-form";
import { Link } from "react-router-dom";

import Input from "../ui/Input";
import Select from "../ui/Select";
import { CURRENCIES } from "../../utils/currencies";

function InvoiceDetailsFields({ customers }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Select
          label="Customer"
          name="customerId"
          error={errors.customerId?.message}
          register={register("customerId", {
            required: "Choose a customer",
          })}
        >
          <option value="">Choose a customer</option>
          {customers.map((customer) => (
            <option key={customer._id} value={customer._id}>
              {customer.name}
            </option>
          ))}
        </Select>

        {customers.length === 0 && (
          <p className="mt-2 text-sm text-slate-600">
            You have no customers yet.{" "}
            <Link
              to="/customers"
              className="font-medium text-[#0F766E] underline"
            >
              Add a customer
            </Link>{" "}
            first.
          </p>
        )}
      </div>

      <Input
        label="Issue date"
        name="issueDate"
        type="date"
        error={errors.issueDate?.message}
        register={register("issueDate", {
          required: "Issue date is required",
        })}
      />

      <Input
        label="Due date"
        name="dueDate"
        type="date"
        error={errors.dueDate?.message}
        register={register("dueDate", {
          required: "Due date is required",
          validate: (value, values) =>
            !values.issueDate ||
            value >= values.issueDate ||
            "Due date cannot be before the issue date",
        })}
      />

      <Select
        label="Currency"
        name="currency"
        error={errors.currency?.message}
        register={register("currency", {
          required: "Choose a currency",
        })}
      >
        {CURRENCIES.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code} - {currency.name}
          </option>
        ))}
      </Select>

      <Input
        label="Tax rate (%)"
        name="taxRate"
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        max="100"
        autoComplete="off"
        placeholder="0"
        error={errors.taxRate?.message}
        register={register("taxRate", {
          validate: (value) => {
            const rate = Number(value);

            if (value === "") return "Enter 0 if there is no tax";

            return (
              (Number.isFinite(rate) && rate >= 0 && rate <= 100) ||
              "Tax rate must be between 0 and 100"
            );
          },
        })}
      />
    </div>
  );
}

export default InvoiceDetailsFields;