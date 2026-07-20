import { useMemo, useState } from "react";
import { Plus, Search, Trash2, Filter, Pencil, ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses, useDeleteExpense, useAddExpense, useProfile } from "@/hooks/useFinance";
import { EXPENSE_CATEGORIES, getCategoryMeta } from "@/lib/categories";
import { formatMoney } from "@/lib/currency";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import QuickAddExpense from "@/components/expenses/QuickAddExpense";
import EditExpenseDialog from "@/components/expenses/EditExpenseDialog";
import ReceiptUploader from "@/features/expenses/ReceiptUploader";
import { toast } from "sonner";
import { inRange, matchesQuery, sortItems, type DateRange, type SortMode } from "@/lib/filters";
import type { Tables } from "@/integrations/supabase/types";

export default function ExpensesPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: expenses = [], isLoading } = useExpenses(user?.id);
  const del = useDeleteExpense(user?.id);
  const addBack = useAddExpense(user?.id);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [range, setRange] = useState<DateRange>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<SortMode>("newest");
  const [open, setOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [editing, setEditing] = useState<Tables<"expenses"> | null>(null);
  const currency = profile?.currency ?? "INR";

  const filtered = useMemo(() => {
    const f = expenses.filter((e) =>
      (cat === "all" || e.category === cat) &&
      inRange(e.date, range, from, to) &&
      matchesQuery(q, e.title, e.description, e.category, e.payment_method, e.amount, e.date),
    );
    return sortItems(f, sort);
  }, [expenses, q, cat, range, from, to, sort]);

  const total = filtered.reduce((s, e) => s + Number(e.amount), 0);

  const handleDelete = async (row: Tables<"expenses">) => {
    if (!window.confirm(`Delete "${row.title}"?`)) return;
    await del.mutateAsync(row.id);
    toast.success("Deleted successfully", {
      action: {
        label: "Undo",
        onClick: async () => {
          const { id: _id, created_at: _c, updated_at: _u, user_id: _uid, ...rest } = row;
          await addBack.mutateAsync(rest);
          toast.success("Restored");
        },
      },
      duration: 5000,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">Expenses</h1>
          <p className="text-sm text-muted-foreground">Track and manage where your money goes.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setReceiptOpen(true)}>Scan receipt</Button>
          <Button className="gradient-primary text-primary-foreground shadow-glow" onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Add expense
          </Button>
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px_180px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search title, category, amount…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
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
          <div className="flex items-center justify-end rounded-xl bg-muted/50 px-4 text-sm">
            <span className="text-muted-foreground">Total:</span>&nbsp;<span className="font-bold">{formatMoney(total, currency)}</span>
          </div>
        </div>
        {range === "custom" && (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div><label className="text-xs text-muted-foreground">From</label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
            <div><label className="text-xs text-muted-foreground">To</label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
          </div>
        )}
      </div>

      <div className="glass rounded-2xl">
        {isLoading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
              <Plus className="h-6 w-6" />
            </div>
            <p className="text-lg font-semibold">No expenses found</p>
            <p className="mb-4 text-sm text-muted-foreground">Try clearing filters or add a new expense.</p>
            <Button onClick={() => setOpen(true)} className="gradient-primary text-primary-foreground">Add expense</Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((e, i) => {
              const meta = getCategoryMeta(e.category);
              return (
                <motion.li
                  key={e.id}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `${meta.color}22`, color: meta.color }}>
                    <meta.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{e.title}</div>
                    <div className="text-xs text-muted-foreground">{e.category} · {format(new Date(e.date), "d MMM yyyy")}{e.payment_method ? ` · ${e.payment_method}` : ""}</div>
                  </div>
                  <div className="text-right text-sm font-bold text-destructive">-{formatMoney(Number(e.amount), currency)}</div>
                  <button
                    onClick={() => setEditing(e)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(e)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>

      <QuickAddExpense open={open} onOpenChange={setOpen} />
      <ReceiptUploader open={receiptOpen} onOpenChange={setReceiptOpen} />
      <EditExpenseDialog expense={editing} open={!!editing} onOpenChange={(b) => !b && setEditing(null)} />
    </div>
  );
}
