import RowActions from "../ui/RowActions";

const COLUMNS =
  "md:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1.2fr)_auto]";

function CustomerTable({ customers, onEdit, onDelete }) {
  return (
    <div className="md:overflow-hidden md:rounded-2xl md:border md:border-slate-200 md:bg-white md:shadow-sm">
      {/* Column titles: only on tablet and desktop */}
      <div
        aria-hidden="true"
        className={`hidden gap-4 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid ${COLUMNS}`}
      >
        <span>Name</span>
        <span>Email</span>
        <span>Phone</span>
        <span />
      </div>

      <ul className="space-y-3 md:space-y-0 md:divide-y md:divide-slate-100">
        {customers.map((customer) => (
          <li
            key={customer._id}
            className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid md:items-center md:gap-4 md:rounded-none md:border-0 md:px-5 md:py-4 md:shadow-none ${COLUMNS}`}
          >
            <div>
              <p className="break-words text-sm font-semibold text-[#0B1730]">
                {customer.name}
              </p>
              {customer.address && (
                <p className="mt-0.5 break-words text-xs text-slate-500">
                  {customer.address}
                </p>
              )}
            </div>

            <p className="mt-1 break-all text-sm text-slate-600 md:mt-0">
              {customer.email}
            </p>

            <p
              className={`mt-0.5 text-sm text-slate-600 md:mt-0 ${
                customer.phone ? "" : "hidden md:block"
              }`}
            >
              {customer.phone || "—"}
            </p>

            <RowActions
              label={customer.name}
              onEdit={() => onEdit(customer)}
              onDelete={() => onDelete(customer)}
              className="-mb-1 -ml-3 mt-3 md:m-0 md:justify-end"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CustomerTable;