import { useState } from "react";
import { useForm } from "react-hook-form";

import Button from "../ui/Button";
import Input from "../ui/Input";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function CustomerForm({ customer, onSubmit, onCancel }) {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: customer?.name ?? "",
      email: customer?.email ?? "",
      phone: customer?.phone ?? "",
      address: customer?.address ?? "",
    },
  });

  const submit = async (values) => {
    setServerError("");

    try {
      await onSubmit({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        address: values.address.trim(),
      });
    } catch (error) {
      setServerError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
      {serverError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {serverError}
        </div>
      )}

      <Input
        label="Name"
        name="name"
        autoComplete="off"
        placeholder="Customer or company name"
        error={errors.name?.message}
        register={register("name", {
          required: "Name is required",
          validate: (value) =>
            value.trim().length >= 2 || "Name must be at least 2 characters",
          maxLength: {
            value: 100,
            message: "Name must be 100 characters or fewer",
          },
        })}
      />

      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="off"
        placeholder="billing@example.com"
        error={errors.email?.message}
        register={register("email", {
          required: "Email is required",
          pattern: {
            value: EMAIL_PATTERN,
            message: "Please enter a valid email",
          },
        })}
      />

      <Input
        label="Phone (optional)"
        name="phone"
        type="tel"
        autoComplete="off"
        placeholder="+92 300 1234567"
        error={errors.phone?.message}
        register={register("phone", {
          maxLength: {
            value: 30,
            message: "Phone must be 30 characters or fewer",
          },
        })}
      />

      <Input
        label="Address (optional)"
        name="address"
        autoComplete="off"
        placeholder="Street, city, country"
        error={errors.address?.message}
        register={register("address", {
          maxLength: {
            value: 300,
            message: "Address must be 300 characters or fewer",
          },
        })}
      />

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
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
            : customer
              ? "Save changes"
              : "Add customer"}
        </Button>
      </div>
    </form>
  );
}

export default CustomerForm;