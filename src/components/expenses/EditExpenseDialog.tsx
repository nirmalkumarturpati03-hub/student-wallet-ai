import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/lib/categories";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateExpense } from "@/hooks/useFinance";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

const schema = z.object({
  title: z.string().trim().min(1, "Required").max(120),
  amount: z.number().nonnegative("Cannot be negative"),
  category: z.string().min(1),
  date: z.string().min(1),
  payment_method: z.string().optional(),
  description: z.string().max(500).optional(),
});
type FormData = z.infer<typeof schema>;

export default function EditExpenseDialog({
  expense, open, onOpenChange,
}: { expense: Tables<"expenses"> | null; open: boolean; onOpenChange: (b: boolean) => void }) {
  const { user } = useAuth();
  const update = useUpdateExpense(user?.id);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (expense) reset({
      title: expense.title, amount: Number(expense.amount), category: expense.category,
      date: expense.date, payment_method: expense.payment_method ?? "", description: expense.description ?? "",
    });
  }, [expense, reset]);

  const onSubmit = async (v: FormData) => {
    if (!expense) return;
    try {
      await update.mutateAsync({
        id: expense.id,
        patch: {
          title: v.title, amount: v.amount, category: v.category, date: v.date,
          description: v.description || null, payment_method: v.payment_method || null,
        },
      });
      toast.success("Updated successfully");
      onOpenChange(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong sm:max-w-md">
        <DialogHeader><DialogTitle>Edit expense</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input {...register("title")} />
            {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Amount</Label>
              <Input type="number" step="0.01" min="0" {...register("amount", { valueAsNumber: true })} />
              {errors.amount && <p className="mt-1 text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" {...register("date")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={watch("category")} onValueChange={(v) => setValue("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment</Label>
              <Select value={watch("payment_method") || ""} onValueChange={(v) => setValue("payment_method", v)}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Note</Label>
            <Textarea rows={2} {...register("description")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="gradient-primary text-primary-foreground">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
