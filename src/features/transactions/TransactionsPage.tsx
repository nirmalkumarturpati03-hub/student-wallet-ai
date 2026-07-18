import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses, useIncomes, useProfile } from "@/hooks/useFinance";
import { formatMoney } from "@/lib/currency";
import { getCategoryMeta } from "@/lib/categories";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownRight, ArrowUpRight, Search } from "lucide-react";

type Item = { id: string; kind: "income" | "expense"; title: string; amount: number; date: string; meta: string };

export default function TransactionsPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: expenses = [] } = useExpenses(user?.id);
  const { data: incomes = [] } = useIncomes(user?.id);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<string>("all");
  const currency = profile?.currency ?? "INR";

  const items = useMemo<Item[]>(() => {
    const list: Item[] = [];
    expenses.forEach((e) => list.push({ id: e.id, kind: "expense", title: e.title, amount: Number(e.amount), date: e.date, meta: e.category }));
    incomes.forEach((i) => list.push({ id: i.id, kind: "income", title: i.title, amount: Number(i.amount), date: i.date, meta: i.source }));
    return list.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [expenses, incomes]);

  const filtered = items.filter((it) => (kind === "all" || it.kind === kind) && (!q || it.title.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black sm:text-3xl">Transactions</h1>
        <p className="text-sm text-muted-foreground">All your income & expenses in one place.</p>
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_200px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <Select value={kind} onValueChange={setKind}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="income">Income only</SelectItem>
              <SelectItem value="expense">Expense only</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
