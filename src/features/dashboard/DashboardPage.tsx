import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet, Target, Sparkles, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses, useIncomes, useProfile, useBills, useGoals } from "@/hooks/useFinance";
import { useProfile as useProf } from "@/hooks/useFinance";
import { formatMoney } from "@/lib/currency";
import { EXPENSE_CATEGORIES, getCategoryMeta } from "@/lib/categories";
import { format, startOfMonth, isSameMonth, isToday, subDays, isAfter } from "date-fns";
import AiSuggestionCard from "@/features/dashboard/AiSuggestionCard";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: expenses = [], isLoading: expLoad } = useExpenses(user?.id);
  const { data: incomes = [], isLoading: incLoad } = useIncomes(user?.id);
  const { data: bills = [] } = useBills(user?.id);
  const { data: goals = [] } = useGoals(user?.id);

  const currency = profile?.currency ?? "INR";
  const monthlyBudget = Number(profile?.monthly_budget ?? 0);

  const stats = useMemo(() => {
    const now = new Date();
    const monthExp = expenses.filter((e) => isSameMonth(new Date(e.date), now));
    const monthInc = incomes.filter((i) => isSameMonth(new Date(i.date), now));
    const monthExpTotal = monthExp.reduce((s, e) => s + Number(e.amount), 0);
    const monthIncTotal = monthInc.reduce((s, i) => s + Number(i.amount), 0);
    const todayExp = expenses.filter((e) => isToday(new Date(e.date))).reduce((s, e) => s + Number(e.amount), 0);
    const totalInc = incomes.reduce((s, i) => s + Number(i.amount), 0);
    const totalExp = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const balance = totalInc - totalExp;
    const savings = goals.reduce((s, g) => s + Number(g.saved_amount), 0);
    const savingsTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);
    return { monthExpTotal, monthIncTotal, todayExp, balance, savings, savingsTarget, dailyBudget: monthlyBudget > 0 ? monthlyBudget / 30 : 0 };
  }, [expenses, incomes, goals, monthlyBudget]);

  // Weekly spending (last 7 days)
  const weekly = useMemo(() => {
    const days: { day: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const total = expenses.filter((e) => format(new Date(e.date), "yyyy-MM-dd") === format(d, "yyyy-MM-dd")).reduce((s, e) => s + Number(e.amount), 0);
      days.push({ day: format(d, "EEE"), amount: total });
    }
    return days;
  }, [expenses]);

  // Monthly expenses (last 6 months)
  const monthly = useMemo(() => {
    const arr: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i); d.setDate(1);
      const total = expenses.filter((e) => isSameMonth(new Date(e.date), d)).reduce((s, e) => s + Number(e.amount), 0);
      arr.push({ month: format(d, "MMM"), amount: total });
    }
    return arr;
  }, [expenses]);

  // Category breakdown (current month)
  const catData = useMemo(() => {
    const now = new Date();
    const map = new Map<string, number>();
    expenses.filter((e) => isSameMonth(new Date(e.date), now)).forEach((e) => {
      map.set(e.category, (map.get(e.category) ?? 0) + Number(e.amount));
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value, color: getCategoryMeta(name).color }));
  }, [expenses]);

  const upcoming = bills.filter((b) => !b.paid && isAfter(new Date(b.due_date), subDays(new Date(), 1))).slice(0, 4);
  const recent = expenses.slice(0, 6);

  if (expLoad || incLoad) {
    return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">Hi, {profile?.full_name?.split(" ")[0] ?? "there"} 👋</h1>
          <p className="text-sm text-muted-foreground">Here's your finance snapshot for {format(new Date(), "MMMM yyyy")}.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Current balance" value={formatMoney(stats.balance, currency)} icon={Wallet} tone="primary" delta={stats.balance >= 0 ? "up" : "down"} />
        <StatCard label="Money saved" value={formatMoney(stats.savings, currency)} icon={Target} tone="accent" subtitle={stats.savingsTarget > 0 ? `${Math.round((stats.savings / stats.savingsTarget) * 100)}% of goals` : "Set a goal"} />
        <StatCard label="Monthly expense" value={formatMoney(stats.monthExpTotal, currency)} icon={TrendingDown} tone="destructive" subtitle={monthlyBudget > 0 ? `${Math.round((stats.monthExpTotal / monthlyBudget) * 100)}% of budget` : undefined} />
        <StatCard label="Income (this month)" value={formatMoney(stats.monthIncTotal, currency)} icon={TrendingUp} tone="success" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's spend" value={formatMoney(stats.todayExp, currency)} icon={Calendar} tone="warning" />
        <StatCard label="Daily budget" value={formatMoney(stats.dailyBudget, currency)} icon={Wallet} tone="primary" subtitle="Approx" />
        <StatCard label="Monthly budget" value={formatMoney(monthlyBudget, currency)} icon={Wallet} tone="secondary" subtitle={<Link to="/budget" className="text-primary hover:underline">Edit</Link>} />
        <StatCard label="Budget remaining" value={formatMoney(Math.max(0, monthlyBudget - stats.monthExpTotal), currency)} icon={Wallet} tone="success" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Monthly expenses</h3>
            <span className="text-xs text-muted-foreground">Last 6 months</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={3} dot={{ fill: "var(--primary)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="mb-3 font-semibold">Categories</h3>
          {catData.length === 0 ? (
            <div className="grid h-56 place-items-center text-sm text-muted-foreground">No expenses yet</div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={catData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                    {catData.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <h3 className="mb-3 font-semibold">Weekly spending</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="amount" fill="var(--accent)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <AiSuggestionCard />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Recent transactions</h3>
            <Link to="/transactions" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No transactions yet. Add your first expense!</p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((e) => {
                const meta = getCategoryMeta(e.category);
                return (
                  <li key={e.id} className="flex items-center gap-3 py-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: `${meta.color}22`, color: meta.color }}>
                      <meta.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{e.title}</div>
                      <div className="text-xs text-muted-foreground">{e.category} · {format(new Date(e.date), "d MMM")}</div>
                    </div>
                    <div className="text-sm font-semibold text-destructive">-{formatMoney(Number(e.amount), currency)}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Upcoming bills</h3>
              <Link to="/settings" className="text-xs text-primary hover:underline">Manage</Link>
            </div>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming bills.</p>
            ) : (
              <ul className="space-y-2">
                {upcoming.map((b) => (
                  <li key={b.id} className="flex items-center justify-between rounded-xl bg-background/40 p-2 text-sm">
                    <div>
                      <div className="font-medium">{b.name}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(b.due_date), "d MMM")}</div>
                    </div>
                    <div className="font-semibold">{formatMoney(Number(b.amount), currency)}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Savings goals</h3>
              <Link to="/savings" className="text-xs text-primary hover:underline">All</Link>
            </div>
            {goals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No goals yet — set one to start saving.</p>
            ) : (
              <ul className="space-y-3">
                {goals.slice(0, 3).map((g) => {
                  const pct = Math.min(100, Math.round((Number(g.saved_amount) / Number(g.target_amount)) * 100));
                  return (
                    <li key={g.id}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{g.name}</span>
                        <span className="text-muted-foreground">{pct}%</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full gradient-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tone = "primary", subtitle, delta }: {
  label: string; value: string; icon: any; tone?: "primary" | "accent" | "success" | "warning" | "destructive" | "secondary"; subtitle?: React.ReactNode; delta?: "up" | "down";
}) {
  const toneMap: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    accent: "text-accent bg-accent/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    destructive: "text-destructive bg-destructive/10",
    secondary: "text-foreground bg-muted",
  };
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4">
      <div className="flex items-start justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`grid h-8 w-8 place-items-center rounded-xl ${toneMap[tone]}`}><Icon className="h-4 w-4" /></div>
      </div>
      <div className="mt-2 text-2xl font-black">{value}</div>
      {subtitle && <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>}
      {delta && (
        <div className={`mt-1 inline-flex items-center gap-1 text-xs ${delta === "up" ? "text-success" : "text-destructive"}`}>
          {delta === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {delta === "up" ? "Healthy" : "Watch"}
        </div>
      )}
    </motion.div>
  );
}
