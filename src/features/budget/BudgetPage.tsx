import { useState } from "react";
import { motion } from "framer-motion";
import { PiggyBank, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile, useExpenses } from "@/hooks/useFinance";
import { formatMoney, CURRENCIES } from "@/lib/currency";
import { EXPENSE_CATEGORIES, getCategoryMeta } from "@/lib/categories";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isSameMonth } from "date-fns";
import { toast } from "sonner";

export default function BudgetPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const upd = useUpdateProfile(user?.id);
  const { data: expenses = [] } = useExpenses(user?.id);
  const [budget, setBudget] = useState<string>("");
  const [currency, setCurrency] = useState<string>(profile?.currency ?? "INR");
  const activeCurrency = profile?.currency ?? "INR";
  const monthlyBudget = Number(profile?.monthly_budget ?? 0);

  const now = new Date();
  const monthExp = expenses.filter((e) => isSameMonth(new Date(e.date), now));
  const spent = monthExp.reduce((s, e) => s + Number(e.amount), 0);
  const pct = monthlyBudget > 0 ? Math.min(100, Math.round((spent / monthlyBudget) * 100)) : 0;

  const catBreakdown = EXPENSE_CATEGORIES.map((c) => {
    const total = monthExp.filter((e) => e.category === c.name).reduce((s, e) => s + Number(e.amount), 0);
    return { name: c.name, color: c.color, total, icon: c.icon };
  }).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);

  const save = async () => {
    const patch: { monthly_budget?: number; currency?: string } = {};
    if (budget) patch.monthly_budget = Number(budget);
    if (currency) patch.currency = currency;
    await upd.mutateAsync(patch);
    toast.success("Budget updated");
    setBudget("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black sm:text-3xl">Budget</h1>
        <p className="text-sm text-muted-foreground">Set a monthly cap and watch your spending against it.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Monthly progress</div>
              <div className="mt-1 text-3xl font-black">{formatMoney(spent, activeCurrency)} <span className="text-base font-medium text-muted-foreground">/ {formatMoney(monthlyBudget, activeCurrency)}</span></div>
            </div>
            <div className={`text-2xl font-black ${pct > 90 ? "text-destructive" : pct > 70 ? "text-warning" : "text-success"}`}>{pct}%</div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} className={`h-full ${pct > 90 ? "bg-destructive" : "gradient-primary"}`} />
          </div>
          {pct > 90 && <p className="mt-2 text-xs text-destructive">You're almost over budget this month — slow down.</p>}
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="mb-3 flex items-center gap-2"><PiggyBank className="h-5 w-5 text-primary" /><h3 className="font-semibold">Update budget</h3></div>
          <div className="space-y-3">
            <div>
              <Label>Monthly budget</Label>
              <Input type="number" placeholder={String(monthlyBudget || "5000")} value={budget} onChange={(e) => setBudget(e.target.value)} />
            </div>
            <div>
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.code} ({c.symbol})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={save} className="w-full gradient-primary text-primary-foreground"><Save className="mr-1 h-4 w-4" /> Save</Button>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="mb-4 font-semibold">Category breakdown (this month)</h3>
        {catBreakdown.length === 0 ? (
          <p className="text-sm text-muted-foreground">No spending recorded this month yet.</p>
        ) : (
          <div className="space-y-3">
            {catBreakdown.map((c) => {
              const p = spent > 0 ? Math.round((c.total / spent) * 100) : 0;
              return (
                <div key={c.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><c.icon className="h-4 w-4" style={{ color: c.color }} /> {c.name}</span>
                    <span className="font-semibold">{formatMoney(c.total, activeCurrency)} <span className="text-muted-foreground">({p}%)</span></span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full" style={{ width: `${p}%`, background: c.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
