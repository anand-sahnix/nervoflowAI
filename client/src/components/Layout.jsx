import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { BrainCircuit, LayoutDashboard, LogOut, PanelsTopLeft } from "lucide-react";
import { useAuthStore } from "../store/authStore.js";
import { Button } from "./Button.jsx";

export function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-950">
            <BrainCircuit className="h-6 w-6 text-emerald-700" />
            NeuroFlow AI
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink className={({ isActive }) => navClass(isActive)} to="/">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </NavLink>
            <NavLink className={({ isActive }) => navClass(isActive)} to="/workspaces">
              <PanelsTopLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Workspaces</span>
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-32 truncate text-sm text-slate-600 md:inline">{user?.name}</span>
            <Button variant="subtle" onClick={handleLogout} aria-label="Log out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

function navClass(isActive) {
  return `focus-ring inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold ${
    isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
  }`;
}
