import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";

function Topbar({ onMenuClick, menuOpen }) {
  const { user, logout } = useAuth();
  const initial = user?.name?.trim().charAt(0).toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8 print:hidden">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        aria-expanded={menuOpen}
        className="-ml-2 rounded-xl p-2 text-[#0B1730] hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#12B8A6] lg:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
        </svg>
      </button>

      <div className="ml-auto flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#12B8A6]/15 text-sm font-semibold text-[#0F766E]"
          >
            {initial}
          </span>

          <div className="hidden min-w-0 sm:block">
            <p className="max-w-[12rem] truncate text-sm font-semibold text-[#0B1730]">
              {user?.name}
            </p>
            <p className="max-w-[12rem] truncate text-xs text-slate-500">
              {user?.email}
            </p>
          </div>
        </div>

        <Button variant="secondary" onClick={logout} className="px-4 py-2">
          Log out
        </Button>
      </div>
    </header>
  );
}

export default Topbar;