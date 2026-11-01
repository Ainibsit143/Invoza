import { useState } from "react";
import { useForm } from "react-hook-form";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PAYMENT_PLACEHOLDER = [
  "Bank: HBL",
  "Account title: Your Name",
  "Account no: 1234 5678 9012",
  "IBAN: PK00 HABB 0000 0000 0000 0000",
  "SWIFT: HABBPKKA",
].join("\n");

function BusinessForm({ business, onSubmit }) {
  const [serverError, setServerError] = useState("");
  const [notice, setNotice] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ defaultValues: business });

  const submit = async (values) => {
    setServerError("");
    setNotice("");

    try {
      const saved = await onSubmit(values);

      // Saved values become the new "unchanged" state
      reset(saved);
      setNotice("Business details saved");
    } catch (error) {
      setServerError(error.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      onChange={() => setNotice("")}
      noValidate
      className="space-y-5"
    >
      {serverError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {serverError}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {notice}
        </div>
      )}

      <Input
        label="Business name"
        name="name"
        autoComplete="organization"
        placeholder="Your name or company"
        error={errors.name?.message}
        register={register("name", {
          maxLength: {
            value: 100,
            message: "Business name must be 100 characters or fewer",
          },
        })}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Business email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="billing@example.com"
          error={errors.email?.message}
          register={register("email", {
            validate: (value) =>
              !value.trim() ||
              EMAIL_PATTERN.test(value.trim()) ||
              "Enter a valid email address",
          })}
        />

        <Input
          label="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+92 300 0000000"
          error={errors.phone?.message}
          register={register("phone", {
            maxLength: {
              value: 30,
              message: "Phone must be 30 characters or fewer",
            },
          })}
        />
      </div>

      <Textarea
        label="Address"
        name="address"
        rows={3}
        placeholder={"Street, area\nCity, country"}
        error={errors.address?.message}
        register={register("address", {
          maxLength: {
            value: 300,
            message: "Address must be 300 characters or fewer",
          },
        })}
      />

      <Input
        label="Tax ID (optional)"
        name="taxId"
        autoComplete="off"
        placeholder="NTN, VAT, GST number..."
        error={errors.taxId?.message}
        register={register("taxId", {
          maxLength: {
            value: 50,
            message: "Tax ID must be 50 characters or fewer",
          },
        })}
      />

      <Textarea
        label="Payment details"
        name="paymentDetails"
        rows={6}
        placeholder={PAYMENT_PLACEHOLDER}
        error={errors.paymentDetails?.message}
        register={register("paymentDetails", {
          maxLength: {
            value: 500,
            message: "Payment details must be 500 characters or fewer",
          },
        })}
      />
      <p className="-mt-3 text-xs text-slate-500">
        Shown on your invoices so clients know how to pay you. Bank, Payoneer,
        PayPal, anything you like.
      </p>

      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? "Saving..." : "Save business details"}
        </Button>
      </div>
    </form>
  );
}

export default BusinessForm;