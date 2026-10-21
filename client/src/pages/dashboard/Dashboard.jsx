import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-8">
          <span className="text-xl font-bold tracking-tight text-[#0B1730]">
            Invoza<span className="text-[#12B8A6]">.</span>
          </span>

          <Button variant="secondary" onClick={logout}>
            Log out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-[#0B1730]">
          Welcome, {user?.name}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          You are logged in as {user?.email}. Your dashboard is coming soon.
        </p>
      </main>
    </div>
  );
}

export default Dashboard;