import { Link } from "react-router-dom";

const CURRENT_YEAR = new Date().getFullYear();
const LINE_ITEMS = [
  { name: "Website design", qty: 1, amount: "$900.00" },
  { name: "Logo and branding", qty: 1, amount: "$350.00" },
];

function Logo({ dark = false, className = "" }) {
  return (
    <Link
      to="/"
      className={`text-3xl font-bold tracking-tight ${className}`}
    >
      <span className={dark ? "text-white" : "text-[#0B1730]"}>Invoza</span>
      <span className="text-[#12B8A6]">.</span>
    </Link>
  );
}

function CheckCircle() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5 text-[#12B8A6]"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// Decorative sample only not real data
function InvoicePreview() {
  return (
    <div aria-hidden="true" className="relative mb-5 w-full max-w-xs">
      <div className="absolute inset-0 translate-x-2.5 translate-y-2.5 rounded-2xl bg-white/10" />

      <div className="relative rounded-2xl bg-white p-5 shadow-xl shadow-black/30">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-base font-bold tracking-tight text-[#0B1730]">
              Invoza<span className="text-[#12B8A6]">.</span>
            </p>
            <p className="mt-0.5 text-xs text-slate-500">Invoice INV-0042</p>
          </div>
          <span className="rounded-full bg-[#12B8A6]/15 px-2.5 py-1 text-xs font-semibold text-[#0F766E]">
            Paid
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-slate-500">Billed to</p>
            <p className="mt-0.5 text-sm font-semibold text-[#0B1730]">
              Acme Studio
            </p>
          </div>
          <div>
            <p className="text-slate-500">Due date</p>
            <p className="mt-0.5 text-sm font-semibold text-[#0B1730]">
              Nov 15, 2026
            </p>
          </div>
        </div>

        <ul className="mt-4 divide-y divide-slate-100 rounded-xl bg-slate-50 px-3">
          {LINE_ITEMS.map((item) => (
            <li
              key={item.name}
              className="flex items-center justify-between py-2.5 text-sm"
            >
              <div>
                <p className="font-medium text-[#0B1730]">{item.name}</p>
                <p className="text-xs text-slate-500">Qty {item.qty}</p>
              </div>
              <span className="font-medium text-[#0B1730]">{item.amount}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-slate-500">Total</span>
          <span className="text-xl font-bold tracking-tight text-[#0B1730]">
            $1,250.00
          </span>
        </div>
      </div>

      <div className="absolute -bottom-4 right-3 flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-lg shadow-black/20">
        <CheckCircle />
        <p className="text-xs font-semibold text-[#0B1730]">
          Payment received
        </p>
      </div>
    </div>
  );
}

function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fcffff] p-4 sm:p-8">
      <div className="grid w-full max-w-7xl overflow-hidden rounded-3xl border border-[#12B8A6]/40 bg-white shadow-2xl shadow-[#0B1730]/10 lg:grid-cols-2">
        <aside className="relative hidden flex-col justify-between gap-10 overflow-hidden bg-[#0B1730] p-10 lg:flex">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border border-[#12B8A6]/20"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-[#12B8A6]/20"
          />

          <Logo dark className="relative" />

          <div className="relative space-y-8">
            <div className="space-y-4">
              <span className="inline-block rounded-full bg-[#12B8A6]/15 px-3 py-1 text-xs font-semibold text-[#12B8A6]">
                Modern invoicing for modern businesses
              </span>
              <p className="text-4xl font-bold leading-[1.1] tracking-tight text-white">
                Get paid faster.{" "}
                <span className="text-[#12B8A6]">Stay organized.</span>
              </p>
              <p className="max-w-sm text-slate-300">
                Manage customers, create invoices and track payments in one
                simple workspace.
              </p>
            </div>

            <InvoicePreview />
          </div>

          <p className="relative text-sm text-slate-400">
            &copy; {CURRENT_YEAR} Invoza
          </p>
        </aside>

        <main className="flex items-center justify-center px-6 py-10 sm:px-12">
          <div className="w-full max-w-sm">
            <Logo className="mb-8 inline-block lg:hidden" />

            <div className="mb-8 space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-[#0B1730]">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-slate-600">{subtitle}</p>
              )}
            </div>

            {children}

            {footer && (
              <p className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-600">
                {footer}
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AuthLayout;