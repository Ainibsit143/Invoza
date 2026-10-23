function RowActions({ label, onEdit, onDelete, className = "" }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${label}`}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#0F766E] hover:bg-[#12B8A6]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#12B8A6]"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Delete ${label}`}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
      >
        Delete
      </button>
    </div>
  );
}

export default RowActions;