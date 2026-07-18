import { Bell, Search, Moon, Sun, Plus, Menu, User } from "lucide-react";
import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useThemeStore } from "@/store/theme";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useFinance";
import QuickAddExpense from "@/components/expenses/QuickAddExpense";
import { useNotifications } from "@/hooks/useFinance";

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, toggle } = useThemeStore();
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: notifs } = useNotifications(user?.id);
  const unread = (notifs ?? []).filter((n) => !n.read).length;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [quickOpen, setQuickOpen] = useState(false);
  const [q, setQ] = useState("");

  const title = pathname.split("/").filter(Boolean).slice(-1)[0]?.replace(/-/g, " ") ?? "dashboard";

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/60 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
        <button onClick={onMenuClick} className="rounded-lg p-2 hover:bg-muted lg:hidden" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="hidden text-lg font-semibold capitalize sm:block">{title}</h1>

        <div className="mx-auto hidden max-w-md flex-1 md:flex">
          <div className="glass flex w-full items-center gap-2 rounded-xl px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search transactions, goals, categories…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => setQuickOpen(true)}
            className="hidden items-center gap-1.5 rounded-xl gradient-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-105 sm:inline-flex"
          >
            <Plus className="h-4 w-4" /> Quick Add
          </button>
          <button onClick={() => setQuickOpen(true)} className="rounded-lg p-2 hover:bg-muted sm:hidden" aria-label="Quick add">
            <Plus className="h-5 w-5" />
          </button>
          <button onClick={toggle} className="rounded-lg p-2 hover:bg-muted" aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <Link to="/notifications" className="relative rounded-lg p-2 hover:bg-muted" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
          <Link to="/profile" className="ml-1 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-4 w-4 text-muted-foreground" />
            )}
          </Link>
        </div>
      </header>
      <QuickAddExpense open={quickOpen} onOpenChange={setQuickOpen} />
    </>
  );
}
