import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import StatusBadge from "../../components/invoices/StatusBadge";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { invoiceService } from "../../services/invoices";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import {
  calculateInvoiceStats,
  getInvoiceCurrencies,
} from "../../utils/invoiceStats";

function StatCard({ label, value, hint, tone = "text-[#0B1730]" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p
        className={`mt-2 break-words text-xl font-bold tracking-tight sm:text-3xl ${tone}`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

const countLabel = (count) => `${count} ${count === 1 ? "invoice" : "invoices"}`;

function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.trim().split(" ")[0];

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("");

    const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    invoiceService
      .list()
      .then((data) => {
        if (cancelled) return;
        setInvoices(data);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const handleRetry = () => {
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  const currencies = useMemo(() => getInvoiceCurrencies(invoices), [invoices]);

  // Chosen currency, else the user's default, else the first one in use
  const currency = currencies.includes(selectedCurrency)
    ? selectedCurrency
    : currencies.includes(user?.currency)
      ? user.currency
      : (currencies[0] ?? user?.currency ?? "USD");

  const stats = useMemo(
    () => calculateInvoiceStats(invoices, currency),
    [invoices, currency]
  );

  const recentInvoices = useMemo(
    () =>
      [...invoices]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    [invoices]
  );

  const cards = [
    {
      label: "Total invoiced",
      value: formatCurrency(stats.invoiced.amount, currency),
      hint: countLabel(stats.invoiced.count),
    },
    {
      label: "Paid",
      value: formatCurrency(stats.paid.amount, currency),
      hint: countLabel(stats.paid.count),
    },
    {
      label: "Pending",
      value: formatCurrency(stats.pending.amount, currency),
      hint: countLabel(stats.pending.count),
    },
    {
      label: "Overdue",
      value: formatCurrency(stats.overdue.amount, currency),
      hint: countLabel(stats.overdue.count),
      tone: stats.overdue.count > 0 ? "text-red-600" : "text-[#0B1730]",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1730] sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Here is a snapshot of your invoicing.
          </p>
        </div>

        {currencies.length > 1 && (
          <div>
            <label
              htmlFor="stats-currency"
              className="block text-xs font-medium text-slate-600"
            >
              Currency
            </label>
            <select
              id="stats-currency"
              value={currency}
              onChange={(event) => setSelectedCurrency(event.target.value)}
              className="mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#0B1730] outline-none transition focus:border-[#12B8A6] focus:ring-2 focus:ring-[#12B8A6]/20"
            >
              {currencies.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{error}</span>
          <Button variant="secondary" onClick={handleRetry} className="px-4 py-2">
            Try again
          </Button>
        </div>
      )}

      <section aria-label="Invoice statistics">
        <div
          className={`grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4 ${
            loading ? "opacity-60" : ""
          }`}
        >
          {cards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>
      </section>

      <section
        aria-labelledby="recent-invoices-heading"
        className="rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2
            id="recent-invoices-heading"
            className="text-base font-semibold text-[#0B1730]"
          >
            Recent invoices
          </h2>
          {invoices.length > 0 && (
            <Link
              to="/invoices"
              className="text-sm font-medium text-[#0F766E] hover:underline"
            >
              View all
            </Link>
          )}
        </div>

        {loading ? (
          <p className="px-6 py-14 text-center text-sm text-slate-600">
            Loading invoices...
          </p>
        ) : recentInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <h3 className="text-base font-semibold text-[#0B1730]">
              No invoices yet
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-600">
              Invoices you create will show up here, along with their payment
              status.
            </p>
            <Link
              to="/invoices/new"
              className="mt-5 rounded-xl bg-[#0B1730] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#12234a]"
            >
              Create invoice
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentInvoices.map((invoice) => (
              <li
                key={invoice._id ?? invoice.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-4"
              >
                <div className="min-w-0">
                  <Link
                    to={`/invoices/${invoice._id ?? invoice.id}`}
                    className="text-sm font-semibold text-[#0B1730] hover:underline"
                  >
                    {invoice.invoiceNumber}
                  </Link>
                  <p className="mt-0.5 truncate text-sm text-slate-600">
                    {invoice.customer?.name} · Due {formatDate(invoice.dueDate)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <StatusBadge status={invoice.status} />
                  <span className="text-sm font-semibold text-[#0B1730]">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Dashboard;