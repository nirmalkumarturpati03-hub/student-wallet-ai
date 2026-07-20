import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, TrendingUp, Search, Filter, ArrowUpDown, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIncomes, useAddIncome, useDeleteIncome, useProfile } from "@/hooks/useFinance";
import { formatMoney } from "@/lib/currency";
import { INCOME_SOURCES } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EditIncomeDialog from "@/components/income/EditIncomeDialog";
import { format } from "date-fns";
import { toast } from "sonner";
import { inRange, matchesQuery, sortItems, type DateRange, type SortMode } from "@/lib/filters";
import type { Tables } from "@/integrations/supabase/types";

export default function IncomePage() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: incomes = [], isLoading } = useIncomes(user?.id);
  const add = useAddIncome(user?.id);
  const del = useDeleteIncome(user?.id);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tables<"incomes"> | null>(null);
  const [q, setQ] = useState("");
  const [src, setSrc] = useState("all");
  const [range, setRange] = useState<DateRange>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<SortMode>("newest");
  const empty = { description: "", amount: "", source: "Pocket Money" as string, date: new Date().toISOString().slice(0, 10) };
  const [form, setForm] = useState(empty);
  const currency = profile?.currency ?? "INR";

  const filtered = useMemo(() => {
    const f = incomes.filter((i) =>
      (src === "all" || i.source === src) &&
      inRange(i.date, range, from, to) &&
      matchesQuery(q, i.description, i.source, i.amount, i.date),
    );
    return sortItems(f, sort);
  }, [incomes, q, src, range, from, to, sort]);

  const total = filtered.reduce((s, i) => s + Number(i.amount), 0);

  const save = async () => {
    const amt = Number(form.amount);
    if (!form.description.trim()) return toast.error("Title is required");
    if (!form.amount || isNaN(amt) || amt < 0) return toast.error("Amount must be zero or positive");
    try {
      await add.mutateAsync({ description: form.description.trim(), amount: amt, source: form.source, date: form.date });
      toast.success("Income added successfully");
      setForm(empty);
      setOpen(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to add income");
    }
  };

  const handleDelete = async (row: Tables<"incomes">) => {
    if (!window.confirm(`Delete "${row.description || row.source}"?`)) return;
    await del.mutateAsync(row.id);
    toast.success("Deleted successfully", {
      action: {
        label: "Undo",
        onClick: async () => {
          const { id: _id, created_at: _c, updated_at: _u, user_id: _uid, ...rest } = row;
          await add.mutateAsync(rest);
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
          <h1 className="text-2xl font-black sm:text-3xl">Income</h1>
          <p className="text-sm text-muted-foreground">Track pocket money, scholarships and other earnings.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gradient-primary text-primary-foreground shadow-glow">
          <Plus className="mr-1 h-4 w-4" /> Add income
        </Button>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Total income</div>
            <div className="text-3xl font-black">{formatMoney(total, currency)}</div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search title, source, amount…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <Select value={src} onValueChange={setSrc}>
            <SelectTrigger><Filter className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {INCOME_SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
        {isLoading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <p className="p-12 text-center text-muted-foreground">No income entries yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((i, idx) => (
              <motion.li key={i.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(idx * 0.02, 0.3) }} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-success/15 text-success"><TrendingUp className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{i.description || i.source}</div>
                  <div className="text-xs text-muted-foreground">{i.source} · {format(new Date(i.date), "d MMM yyyy")}</div>
                </div>
                <div className="text-sm font-bold text-success">+{formatMoney(Number(i.amount), currency)}</div>
                <button onClick={() => setEditing(i)} className="rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(i)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-strong sm:max-w-md">
          <DialogHeader><DialogTitle>Add income</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Monthly pocket money" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Amount</Label><Input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
              <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            </div>
            <div>
              <Label>Source</Label>
              <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{INCOME_SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={add.isPending} className="gradient-primary text-primary-foreground">Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditIncomeDialog income={editing} open={!!editing} onOpenChange={(b) => !b && setEditing(null)} />
    </div>
  );
}
