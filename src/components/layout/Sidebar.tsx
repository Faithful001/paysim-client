import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CreditCard,
  Receipt,
  Zap,
  ArrowDownToLine,
  LogOut,
  Wallet,
  History,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

const navItems = [
  { label: "Home", to: "/dashboard", icon: LayoutDashboard },
  { label: "Payments", to: "/payments", icon: ArrowDownToLine },
  { label: "Bills", to: "/bills", icon: Zap },
  { label: "Cards", to: "/cards", icon: CreditCard },
  { label: "Transactions", to: "/transactions", icon: History },
  { label: "Withdraw", to: "/withdraw", icon: Receipt },
];

export function Sidebar() {
  const { location } = useRouterState();
  const { user, logout } = useAuthStore();

  return (
    <div className="flex flex-col h-full border-r border-slate-100 bg-white">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand shadow-lg shadow-indigo-200">
            <Wallet size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">PaySim</span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {navItems.map(({ label, to, icon: Icon }) => {
          const active = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "gradient-brand text-white shadow-md shadow-indigo-200"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-brand text-white text-sm font-bold">
            {user ? getInitials(`${user.firstName} ${user.lastName}`) : "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {user ? `${user.firstName} ${user.lastName}` : "User"}
            </p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
