import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard, FileCheck2, Gauge, Handshake, Building2, Share2, ScrollText, Settings,
  Users, ShieldCheck, AlertOctagon, ClipboardList, BarChart3,
  Globe2, Bell, Search, User, LogOut,
} from "lucide-react";

const businessNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/kyc", label: "KYC Documents", icon: FileCheck2 },
  { to: "/dashboard/trust", label: "Trust Score", icon: Gauge },
  { to: "/dashboard/deals", label: "My Deals", icon: Handshake },
  { to: "/dashboard/directory", label: "Business Directory", icon: Building2 },
  { to: "/dashboard/shared", label: "Shared Profiles", icon: Share2 },
  { to: "/dashboard/audit", label: "Audit Logs", icon: ScrollText },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: BarChart3, exact: true },
  { to: "/admin/businesses", label: "Businesses", icon: Users },
  { to: "/admin/kyc", label: "KYC Verifications", icon: ShieldCheck },
  { to: "/admin/trust", label: "Trust Management", icon: Gauge },
  { to: "/admin/disputes", label: "Disputes", icon: AlertOctagon },
  { to: "/admin/audit", label: "Audit Logs", icon: ClipboardList },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AppShell({ kind, children }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { user, logout, business } = useAuth();

  const nav = kind === "admin" ? adminNav : businessNav;

  const [profileOpen, setProfileOpen] = useState(false);

  const businessName = business?.legalName || user?.businessName || user?.name || "User";
  const email = user?.email || "";

  useEffect(() => {
    setProfileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout?.();               
    setProfileOpen(false);    
    navigate("/");
  };

  return (
    <div className="min-h-screen flex w-full">

      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-slate-900/[0.06] glass-strong sticky top-0 h-screen flex flex-col">

        <div className="px-5 py-5 flex items-center gap-3 border-b border-slate-900/[0.06]">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-cyan-glow grid place-items-center shadow-glow">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-display font-semibold text-sm">{businessName}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {kind === "admin" ? "Admin Console" : "Business OS"}
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {nav.map((item) => {
            const active = item.exact
              ? pathname === item.to
              : pathname.startsWith(item.to);

            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition",
                  active
                    ? "bg-primary/10 text-foreground border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-slate-900/[0.03]"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="sticky top-0 z-40 h-16 border-b border-slate-900/[0.06] glass-strong px-6 flex items-center gap-4">

          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search businesses, deals, documents…"
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/[0.03] border text-sm"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto ">

            <button className="h-9 w-9 grid place-items-center cursor-pointer rounded-xl glass">
              <Globe2 className="h-4 w-4 text-muted-foreground" />
            </button>

            <button className="h-9 w-9 grid place-items-center rounded-xl cursor-pointer glass relative">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-glow" />
            </button>

            {/* Profile */}
            <div className="relative">

              <button
                onClick={() => setProfileOpen((p) => !p)}
                className="h-9 w-9 grid place-items-center rounded-xl glass cursor-pointer hover:bg-slate-900/[0.06]"
              >
                <User className="h-4 w-4 text-muted-foreground" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border rounded-xl shadow-lg overflow-hidden z-50">

                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-medium truncate">{businessName}</p>
                    <p className="text-xs text-muted-foreground truncate">{email}</p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-red-50 text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>

                </div>
              )}

            </div>

          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          {children}
        </main>

      </div>
    </div>
  );
}