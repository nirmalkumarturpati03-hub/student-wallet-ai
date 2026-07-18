import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIncomes, useAddIncome, useDeleteIncome, useProfile } from "@/hooks/useFinance";
import { formatMoney } from "@/lib/currency";
import { INCOME_SOURCES } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "sonner";

export default function IncomePage() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: incomes = [], isLoading } = useIncomes(user?.id);
  const add = useAddIncome(user?.id);
  const del = useDeleteIncome(user?.id);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ description: "", amount: "", source: "Pocket Money", date: new Date().toISOString().slice(0, 10) });
  const currency = profile?.currency ?? "INR";
  const total = incomes.reduce((s, i) => s + Number(i.amount), 0);

  const save = async () => {
    if (!form.amount) return toast.error("Fill all fields");
    await add.mutateAsync({ description: form.description || null, amount: Number(form.amount), source: form.source, date: form.date });
    toast.success("Income added");
    setForm({ description: "", amount: "", source: "Pocket Money", date: new Date().toISOString().slice(0, 10) });
    setOpen(false);
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

      <div className="glass rounded-2xl">
        {isLoading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
        ) : incomes.length === 0 ? (
          <p className="p-12 text-center text-muted-foreground">No income entries yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {incomes.map((i, idx) => (
              <motion.li key={i.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-success/15 text-success"><TrendingUp className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{i.description || i.source}</div>
                  <div className="text-xs text-muted-foreground">{i.source} · {format(new Date(i.date), "d MMM yyyy")}</div>
                </div>
                <div className="text-sm font-bold text-success">+{formatMoney(Number(i.amount), currency)}</div>
                <button onClick={async () => { await del.mutateAsync(i.id); toast.success("Deleted"); }} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-strong sm:max-w-md">
          <DialogHeader><DialogTitle>Add income</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Description (optional)</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Monthly pocket money" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
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
            <Button onClick={save} className="gradient-primary text-primary-foreground">Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
