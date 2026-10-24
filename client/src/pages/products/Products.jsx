import { useEffect, useMemo, useState } from "react";

import ProductForm from "../../components/products/ProductForm";
import ProductTable from "../../components/products/ProductTable";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Pagination from "../../components/ui/Pagination";
import { productService } from "../../services/products";

const PAGE_SIZE = 10;

function Products() {
  const [products, setProducts] = useState([]);
  const { user } = useAuth();
  const currency = user?.currency ?? "USD";
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [notice, setNotice] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      try {
        const data = await productService.list();

        if (!ignore) {
          setProducts(data);
        }
      } catch (error) {
        if (!ignore) {
          setLoadError(error.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  // Hide the success message after a few seconds
  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => setNotice(""), 4000);

    return () => clearTimeout(timer);
  }, [notice]);

  const query = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!query) return products;

    return products.filter((product) =>
      [product.name, product.description].some((value) =>
        value?.toLowerCase().includes(query)
      )
    );
  }, [products, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleRetry = () => {
    setLoadError("");
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  // If this throws, ProductForm shows the error and the popup stays open
  const handleSave = async (values) => {
    if (editing) {
      const updated = await productService.update(editing._id, values);

      setProducts((current) =>
        current.map((product) =>
          product._id === updated._id ? updated : product
        )
      );
      setNotice("Product updated");
    } else {
      const created = await productService.create(values);

      setProducts((current) => [created, ...current]);
      setNotice("Product added");
    }

    closeForm();
  };

  const openDelete = (product) => {
    setDeleteError("");
    setDeleting(product);
  };

  const closeDelete = () => {
    setDeleting(null);
    setDeleteError("");
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");

    try {
      await productService.remove(deleting._id);

      setProducts((current) =>
        current.filter((product) => product._id !== deleting._id)
      );
      setNotice(`${deleting.name} deleted`);
      setDeleting(null);
    } catch (error) {
      setDeleteError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1730] sm:text-3xl">
            Products
          </h1>
          {!loading && !loadError && (
            <p className="mt-1 text-sm text-slate-600">
              {products.length}{" "}
              {products.length === 1 ? "product" : "products"}
            </p>
          )}
        </div>

        <Button onClick={openCreate}>Add product</Button>
      </div>

      {notice && (
        <div
          role="status"
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {notice}
        </div>
      )}

      <div className="mt-6">
        {loading && (
          <div
            role="status"
            className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-16 text-sm text-slate-600"
          >
            <span
              aria-hidden="true"
              className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#12B8A6]"
            />
            Loading products...
          </div>
        )}

        {!loading && loadError && (
          <div
            role="alert"
            className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center"
          >
            <p className="text-sm text-red-700">{loadError}</p>
            <Button variant="secondary" onClick={handleRetry}>
              Retry
            </Button>
          </div>
        )}

        {!loading && !loadError && products.length === 0 && (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <h2 className="text-base font-semibold text-[#0B1730]">
              No products yet
            </h2>
            <p className="mt-1 max-w-sm text-sm text-slate-600">
              Add the products and services you sell, so you can put them on
              invoices.
            </p>
            <Button onClick={openCreate} className="mt-5">
              Add product
            </Button>
          </div>
        )}

        {!loading && !loadError && products.length > 0 && (
          <>
            <div className="mb-4">
              <label htmlFor="product-search" className="sr-only">
                Search products
              </label>
              <input
                id="product-search"
                type="search"
                value={search}
                onChange={handleSearch}
                placeholder="Search by name or description"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#0B1730] outline-none transition focus:border-[#12B8A6] focus:ring-2 focus:ring-[#12B8A6]/20 sm:max-w-sm"
              />
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-600">
                No products match &quot;{search.trim()}&quot;.
              </div>
            ) : (
              <>
                <ProductTable
                  products={visible}
                  currency={currency}
                  onEdit={openEdit}
                  onDelete={openDelete}
                />
                <Pagination
                  page={currentPage}
                  pageSize={PAGE_SIZE}
                  totalItems={filtered.length}
                  onPageChange={setPage}
                />
              </>
            )}
          </>
        )}
      </div>

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editing ? "Edit product" : "Add product"}
      >
        <ProductForm
          product={editing}
          currency={currency}
          onSubmit={handleSave}
          onCancel={closeForm}
        />
      </Modal>

      <Modal
        open={Boolean(deleting)}
        onClose={closeDelete}
        title="Delete product"
      >
        <p className="text-sm text-slate-600">
          Delete <span className="font-semibold">{deleting?.name}</span>? This
          cannot be undone.
        </p>

        {deleteError && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {deleteError}
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={closeDelete}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete product"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default Products;