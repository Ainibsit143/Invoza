function Textarea({
  label,
  name,
  error,
  register,
  rows = 3,
  ...props
}) {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-[#0B1730]"
        >
          {label}
        </label>
      )}

      <textarea
        id={name}
        name={name}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#0B1730] outline-none transition focus:border-[#12B8A6] focus:ring-2 focus:ring-[#12B8A6]/20 aria-[invalid=true]:border-red-500"
        {...register}
        {...props}
      />

      {error && (
        <p id={`${name}-error`} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default Textarea;