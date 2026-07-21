import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Plus, Trash2, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useGoals, useAddGoal, useDeleteGoal, useContributeGoal, useProfile } from "@/hooks/useFinance";
import { formatMoney } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function SavingsPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: goals = [] } = useGoals(user?.id);
  const add = useAddGoal(user?.id);
  const del = useDeleteGoal(user?.id);
  const contrib = useContributeGoal(user?.id);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", target_amount: "", deadline: "" });
  const currency = profile?.currency ?? "INR";

  const save = async () => {
    if (!form.name || !form.target_amount) return toast.error("Fill required fields");
    await add.mutateAsync({
      name: form.name, target_amount: Number(form.target_amount),
      deadline: form.deadline || null, saved_amount: 0,
    });
    setForm({ name: "", target_amount: "", deadline: "" });
    setOpen(false);
    toast.success("Goal created");
  };

  const addSavings = async (id: string, _current: number, amt: number) => {
    await contrib.mutateAsync({ goalId: id, amount: amt });
    toast.success(`+${formatMoney(amt, currency)} saved`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">Savings Goals</h1>
          <p className="text-sm text-muted-foreground">Save toward the things that matter — trips, gadgets, emergencies.</p>
        </div>
        <Button className="gradient-primary text-primary-foreground shadow-glow" onClick={() => setOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> New goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
            <Target className="h-6 w-6" />
          </div>
          <p className="text-lg font-semibold">No goals yet</p>
          <p className="mb-4 text-sm text-muted-foreground">Set one to start building your savings streak.</p>
          <Button onClick={() => setOpen(true)} className="gradient-primary text-primary-foreground">Create first goal</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((g, i) => {
            const saved = Number(g.saved_amount);
            const target = Number(g.target_amount);
            const pct = Math.min(100, Math.round((saved / target) * 100));
            return (
              <motion.div key={g.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{g.name}</h3>
                    {g.deadline && <p className="text-xs text-muted-foreground">By {new Date(g.deadline).toLocaleDateString()}</p>}
                  </div>
                  <button onClick={async () => { await del.mutateAsync(g.id); toast.success("Removed"); }} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-black">{formatMoney(saved, currency)}</div>
                  <div className="text-xs text-muted-foreground">of {formatMoney(target, currency)}</div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full gradient-primary" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-3 flex gap-2">
                  {[100, 500, 1000].map((amt) => (
                    <Button key={amt} size="sm" variant="outline" onClick={() => addSavings(g.id, saved, amt)}>
                      +{amt}
                    </Button>
                  ))}
                </div>
                {pct >= 100 && <p className="mt-3 flex items-center gap-1 text-sm font-semibold text-success"><TrendingUp className="h-4 w-4" /> Goal reached 🎉</p>}
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-strong sm:max-w-md">
          <DialogHeader><DialogTitle>New savings goal</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Goal name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="New laptop" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Target amount</Label><Input type="number" value={form.target_amount} onChange={(e) => setForm({ ...form, target_amount: e.target.value })} /></div>
              <div><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="gradient-primary text-primary-foreground">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
