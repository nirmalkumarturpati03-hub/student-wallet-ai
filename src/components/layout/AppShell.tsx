import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Wallet, Receipt, PiggyBank, Target, ArrowRightLeft, BarChart3,
  Sparkles, Bell, Tag, User, Settings, LogOut, Menu, X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import Topbar from "./Topbar";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/income", label: "Income", icon: Wallet },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/budget", label: "Budget", icon: PiggyBank },
  { to: "/savings", label: "Savings Goals", icon: Target },
  { to: "/transactions", label: "Transactions", icon: ArrowRightLeft },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/discounts", label: "Student Discounts", icon: Tag },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export default function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const qc = useQueryClient();

  const handleSignOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar/70 backdrop-blur-xl lg:flex">
        <SidebarInner pathname={pathname} onSignOut={handleSignOut} />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar backdrop-blur-xl lg:hidden"
            >
              <SidebarInner pathname={pathname} onSignOut={handleSignOut} onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      {/* Mobile menu trigger visible via topbar */}
      <button
        aria-label="Open menu"
        onClick={() => setMobileOpen(true)}
        className={cn("fixed bottom-4 left-4 z-20 lg:hidden", mobileOpen && "hidden")}
      >
        <span className="sr-only">Open menu</span>
      </button>
    </div>
  );
}

function SidebarInner({ pathname, onSignOut, onNavigate }: { pathname: string; onSignOut: () => void; onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center gap-2 border-b border-sidebar-border px-5 py-5">
        <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow">
          <Wallet className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-bold">Student Wallet</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">AI · Beta</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(to));
            return (
              <li key={to}>
                <Link
                  to={to}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                    active
                      ? "gradient-primary text-primary-foreground shadow-glow"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-destructive/15 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-lg p-2 hover:bg-muted lg:hidden" aria-label="Menu">
      <Menu className="h-5 w-5" />
    </button>
  );
}
export { X as CloseIcon };
