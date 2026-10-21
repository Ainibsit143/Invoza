import { useAuth } from "../../context/AuthContext";

const STATS = [
  { label: "Total invoiced", value: "$0.00", hint: "0 invoices" },
  { label: "Paid", value: "$0.00", hint: "0 invoices" },
  { label: "Pending", value: "$0.00", hint: "0 invoices" },
  { label: "Overdue", value: "$0.00", hint: "0 invoices" },
];

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-2 break-words text-xl font-bold tracking-tight text-[#0B1730] sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.trim().split(" ")[0];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B1730] sm:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Here is a snapshot of your invoicing.
        </p>
      </div>

      <section aria-label="Invoice statistics">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {STATS.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      <section
        aria-labelledby="recent-invoices-heading"
        className="rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <h2
            id="recent-invoices-heading"
            className="text-base font-semibold text-[#0B1730]"
          >
            Recent invoices
          </h2>
        </div>

        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#12B8A6]/15 text-[#0F766E]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </span>
          <h3 className="mt-4 text-base font-semibold text-[#0B1730]">
            No invoices yet
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-600">
            Invoices you create will show up here, along with their payment
            status.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
