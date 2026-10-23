import { useState } from "react";
import { useForm } from "react-hook-form";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";

function ProductForm({ product, currency = "USD", onSubmit, onCancel }) {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product ? String(product.price) : "",
    },
  });

  const submit = async (values) => {
    setServerError("");

    try {
      await onSubmit({
        name: values.name.trim(),
        description: values.description.trim(),
        price: Number(values.price),
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
        placeholder="Web design, Monthly hosting..."
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

      <Textarea
        label="Description (optional)"
        name="description"
        placeholder="What does this product or service include?"
        error={errors.description?.message}
        register={register("description", {
          maxLength: {
            value: 500,
            message: "Description must be 500 characters or fewer",
          },
        })}
      />

      <Input
        label={`Price (${currency})`}
        name="price"
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        autoComplete="off"
        placeholder="0.00"
        error={errors.price?.message}
        register={register("price", {
          required: "Price is required",
          validate: (value) =>
            /^\d+(\.\d{1,2})?$/.test(String(value).trim()) ||
            "Enter a valid price (0 or more, up to 2 decimals)",
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
            : product
              ? "Save changes"
              : "Add product"}
        </Button>
      </div>
    </form>
  );
}

export default ProductForm;