import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  // Close the mobile menu with the Escape key
  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-64 print:hidden">
        <Sidebar />
      </aside>

      {/* Mobile and tablet menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            aria-hidden="true"
            onClick={closeMenu}
            className="absolute inset-0 bg-[#0B1730]/60"
          />
          <aside className="absolute inset-y-0 left-0 w-64 shadow-2xl">
            <Sidebar onNavigate={closeMenu} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64 print:pl-0">
        <Topbar onMenuClick={() => setMenuOpen(true)} menuOpen={menuOpen} />

        <main className="px-4 py-8 sm:px-8 print:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;