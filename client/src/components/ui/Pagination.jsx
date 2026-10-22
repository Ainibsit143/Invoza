import Button from "./Button";

function Pagination({ page, pageSize, totalItems, onPageChange }) {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) {
    return null;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <nav
      aria-label="Pagination"
      className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-slate-600">
        Showing {start}–{end} of {totalItems}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex-1 px-4 py-2 sm:flex-none"
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex-1 px-4 py-2 sm:flex-none"
        >
          Next
        </Button>
      </div>
    </nav>
  );
}

export default Pagination;