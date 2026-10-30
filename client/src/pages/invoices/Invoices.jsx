import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import InvoiceTable from "../../components/invoices/InvoiceTable";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Pagination from "../../components/ui/Pagination";
import { invoiceService } from "../../services/invoices";
import {
  INVOICE_STATUSES,
  STATUS_ACTION_LABELS,
  STATUS_LABELS,
} from "../../utils/invoiceStatus";

const PAGE_SIZE = 10;

const STATUS_WARNINGS = {
  sent: "Once an invoice is sent, it can no longer be edited or deleted.",
  paid: "A paid invoice is final and cannot be changed.",
  cancelled: "A cancelled invoice is final and cannot be changed.",
};

function Invoices() {
  const navigate = useNavigate();
  const location = useLocation();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [pendingStatus, setPendingStatus] = useState(null);
  const [statusError, setStatusError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // A message passed from the form page after saving (e.g. "Invoice created")
  const [notice, setNotice] = useState(location.state?.notice ?? "");

  useEffect(() => {
    let ignore = false;

    async function loadInvoices() {
      try {
        const data = await invoiceService.list();

        if (!ignore) {
          setInvoices(data);
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

    loadInvoices();

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

  const filtered = useMemo(
    () =>
      invoices.filter((invoice) => {
        if (statusFilter !== "all" && invoice.status !== statusFilter) {
          return false;
        }

        if (!query) return true;

        return [
          invoice.invoiceNumber,
          invoice.customer?.name,
          invoice.customer?.email,
        ].some((value) => value?.toLowerCase().includes(query));
      }),
    [invoices, query, statusFilter]
  );

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

  const handleStatusFilter = (event) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const openCreate = () => navigate("/invoices/new");

  const openEdit = (invoice) => navigate(`/invoices/${invoice._id}/edit`);

  const openDelete = (invoice) => {
    setDeleteError("");
    setDeleting(invoice);
  };

  const closeDelete = () => {
    setDeleting(null);
    setDeleteError("");
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");

    try {
      await invoiceService.remove(deleting._id);

      setInvoices((current) =>
        current.filter((invoice) => invoice._id !== deleting._id)
      );
      setNotice(`${deleting.invoiceNumber} deleted`);
      setDeleting(null);
    } catch (error) {
      setDeleteError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const openStatusChange = (invoice, status) => {
    setStatusError("");
    setPendingStatus({ invoice, status });
  };

  const closeStatusChange = () => {
    setPendingStatus(null);
    setStatusError("");
  };

  const handleStatusChange = async () => {
    setIsUpdating(true);
    setStatusError("");

    try {
      const updated = await invoiceService.updateStatus(
        pendingStatus.invoice._id,
        pendingStatus.status
      );

      setInvoices((current) =>
        current.map((invoice) =>
          invoice._id === updated._id ? updated : invoice
        )
      );
      setNotice(
        `${updated.invoiceNumber} marked as ${STATUS_LABELS[
          updated.status
        ].toLowerCase()}`
      );
      setPendingStatus(null);
    } catch (error) {
      setStatusError(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1730] sm:text-3xl">
            Invoices
          </h1>
          {!loading && !loadError && (
            <p className="mt-1 text-sm text-slate-600">
              {invoices.length}{" "}
              {invoices.length === 1 ? "invoice" : "invoices"}
            </p>
          )}
        </div>

        <Button onClick={openCreate}>Create invoice</Button>
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
            Loading invoices...
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

        {!loading && !loadError && invoices.length === 0 && (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <h2 className="text-base font-semibold text-[#0B1730]">
              No invoices yet
            </h2>
            <p className="mt-1 max-w-sm text-sm text-slate-600">
              Create your first invoice for one of your customers.
            </p>
            <Button onClick={openCreate} className="mt-5">
              Create invoice
            </Button>
          </div>
        )}

        {!loading && !loadError && invoices.length > 0 && (
          <>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <div className="sm:w-full sm:max-w-sm">
                <label htmlFor="invoice-search" className="sr-only">
                  Search invoices
                </label>
                <input
                  id="invoice-search"
                  type="search"
                  value={search}
                  onChange={handleSearch}
                  placeholder="Search by number or customer"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#0B1730] outline-none transition focus:border-[#12B8A6] focus:ring-2 focus:ring-[#12B8A6]/20"
                />
              </div>

              <div>
                <label htmlFor="invoice-status-filter" className="sr-only">
                  Filter by status
                </label>
                <select
                  id="invoice-status-filter"
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#0B1730] outline-none transition focus:border-[#12B8A6] focus:ring-2 focus:ring-[#12B8A6]/20 sm:w-auto"
                >
                  <option value="all">All statuses</option>
                  {INVOICE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-600">
                No invoices match your search or filter.
              </div>
            ) : (
              <>
                <InvoiceTable
                  invoices={visible}
                  busyId={isUpdating ? pendingStatus?.invoice._id : null}
                  onEdit={openEdit}
                  onDelete={openDelete}
                  onStatusChange={openStatusChange}
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
        open={Boolean(pendingStatus)}
        onClose={closeStatusChange}
        title={pendingStatus ? STATUS_ACTION_LABELS[pendingStatus.status] : ""}
      >
        <p className="text-sm text-slate-600">
          <span className="font-semibold">
            {pendingStatus?.invoice.invoiceNumber}
          </span>
          . {pendingStatus ? STATUS_WARNINGS[pendingStatus.status] : ""}
        </p>

        {statusError && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {statusError}
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={closeStatusChange}
            disabled={isUpdating}
          >
            Keep as is
          </Button>
          <Button
            variant={pendingStatus?.status === "cancelled" ? "danger" : "primary"}
            onClick={handleStatusChange}
            disabled={isUpdating}
          >
            {isUpdating
              ? "Saving..."
              : pendingStatus
                ? STATUS_ACTION_LABELS[pendingStatus.status]
                : ""}
          </Button>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleting)}
        onClose={closeDelete}
        title="Delete invoice"
      >
        <p className="text-sm text-slate-600">
          Delete draft{" "}
          <span className="font-semibold">{deleting?.invoiceNumber}</span>? This
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
            {isDeleting ? "Deleting..." : "Delete invoice"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default Invoices;