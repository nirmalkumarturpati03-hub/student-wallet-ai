import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INCOME_SOURCES } from "@/lib/categories";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateIncome } from "@/hooks/useFinance";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

const schema = z.object({
  description: z.string().trim().min(1, "Required").max(120),
  amount: z.number().nonnegative("Cannot be negative"),
  source: z.string().min(1),
  date: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

export default function EditIncomeDialog({
  income, open, onOpenChange,
}: { income: Tables<"incomes"> | null; open: boolean; onOpenChange: (b: boolean) => void }) {
  const { user } = useAuth();
  const update = useUpdateIncome(user?.id);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (income) reset({
      description: income.description ?? income.source,
      amount: Number(income.amount),
      source: income.source,
      date: income.date,
    });
  }, [income, reset]);

  const onSubmit = async (v: FormData) => {
    if (!income) return;
    try {
      await update.mutateAsync({
        id: income.id,
        patch: { description: v.description, amount: v.amount, source: v.source, date: v.date },
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
        <DialogHeader><DialogTitle>Edit income</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input {...register("description")} placeholder="Monthly pocket money" />
            {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
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
          <div>
            <Label>Source</Label>
            <Select value={watch("source")} onValueChange={(v) => setValue("source", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{INCOME_SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
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
