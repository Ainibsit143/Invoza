import RowActions from "../ui/RowActions";
import { formatCurrency } from "../../utils/formatCurrency";

const COLUMNS = "md:grid-cols-[minmax(0,3fr)_minmax(0,1fr)_auto]";

function ProductTable({ products, currency, onEdit, onDelete }) {
  return (
    <div className="md:overflow-hidden md:rounded-2xl md:border md:border-slate-200 md:bg-white md:shadow-sm">
      {/* Column titles: only on tablet and desktop */}
      <div
        aria-hidden="true"
        className={`hidden gap-4 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid ${COLUMNS}`}
      >
        <span>Name</span>
        <span className="text-right">Price</span>
        <span />
      </div>

      <ul className="space-y-3 md:space-y-0 md:divide-y md:divide-slate-100">
        {products.map((product) => (
          <li
            key={product._id}
            className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid md:items-center md:gap-4 md:rounded-none md:border-0 md:px-5 md:py-4 md:shadow-none ${COLUMNS}`}
          >
            <div>
              <p className="break-words text-sm font-semibold text-[#0B1730]">
                {product.name}
              </p>
              {product.description && (
                <p className="mt-0.5 line-clamp-2 break-words text-xs text-slate-500">
                  {product.description}
                </p>
              )}
            </div>

            <p className="mt-2 text-sm font-semibold text-[#0B1730] md:mt-0 md:text-right">
              {formatCurrency(product.price, currency)}
            </p>

            <RowActions
              label={product.name}
              onEdit={() => onEdit(product)}
              onDelete={() => onDelete(product)}
              className="-mb-1 -ml-3 mt-3 md:m-0 md:justify-end"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductTable;