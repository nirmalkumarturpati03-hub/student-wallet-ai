import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses, useIncomes, useProfile } from "@/hooks/useFinance";
import { formatMoney } from "@/lib/currency";
import { getCategoryMeta, EXPENSE_CATEGORIES } from "@/lib/categories";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownRight, ArrowUpRight, Search, Filter, ArrowUpDown } from "lucide-react";
import { inRange, matchesQuery, sortItems, type DateRange, type SortMode } from "@/lib/filters";

type Item = { id: string; kind: "income" | "expense"; title: string; amount: number; date: string; meta: string; description: string | null };

export default function TransactionsPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: expenses = [] } = useExpenses(user?.id);
  const { data: incomes = [] } = useIncomes(user?.id);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("all");
  const [cat, setCat] = useState("all");
  const [range, setRange] = useState<DateRange>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<SortMode>("newest");
  const currency = profile?.currency ?? "INR";

  const items = useMemo<Item[]>(() => {
    const list: Item[] = [];
    expenses.forEach((e) => list.push({ id: e.id, kind: "expense", title: e.title, amount: Number(e.amount), date: e.date, meta: e.category, description: e.description }));
    incomes.forEach((i) => list.push({ id: i.id, kind: "income", title: i.description || i.source, amount: Number(i.amount), date: i.date, meta: i.source, description: i.description }));
    return list;
  }, [expenses, incomes]);

  const filtered = useMemo(() => {
    const f = items.filter((it) =>
      (kind === "all" || it.kind === kind) &&
      (cat === "all" || it.meta === cat) &&
      inRange(it.date, range, from, to) &&
      matchesQuery(q, it.title, it.description, it.meta, it.amount, it.date),
    );
    return sortItems(f, sort);
  }, [items, q, kind, cat, range, from, to, sort]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black sm:text-3xl">Transactions</h1>
        <p className="text-sm text-muted-foreground">All your income & expenses in one place.</p>
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_150px_180px_180px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search title, category, amount…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <Select value={kind} onValueChange={setKind}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger><Filter className="mr-2 h-4 w-4" /><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {EXPENSE_CATEGORIES.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={range} onValueChange={(v) => setRange(v as DateRange)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as SortMode)}>
            <SelectTrigger><ArrowUpDown className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="highest">Highest amount</SelectItem>
              <SelectItem value="lowest">Lowest amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {range === "custom" && (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div><label className="text-xs text-muted-foreground">From</label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
            <div><label className="text-xs text-muted-foreground">To</label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
          </div>
        )}
      </div>

      <div className="glass rounded-2xl">
        {filtered.length === 0 ? (
          <p className="p-12 text-center text-muted-foreground">No transactions.</p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((it) => {
              const meta = it.kind === "expense" ? getCategoryMeta(it.meta) : null;
              return (
                <li key={`${it.kind}-${it.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30">
                  <div className={`grid h-10 w-10 place-items-center rounded-xl ${it.kind === "income" ? "bg-success/15 text-success" : ""}`} style={meta ? { background: `${meta.color}22`, color: meta.color } : undefined}>
                    {meta ? <meta.icon className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{it.title}</div>
                    <div className="text-xs text-muted-foreground">{it.meta} · {format(new Date(it.date), "d MMM yyyy")}</div>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-bold ${it.kind === "income" ? "text-success" : "text-destructive"}`}>
                    {it.kind === "income" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {it.kind === "income" ? "+" : "-"}{formatMoney(it.amount, currency)}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
