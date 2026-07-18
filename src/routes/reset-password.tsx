import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Wallet, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set a new password · Student Wallet AI" }] }),
  component: ResetPassword,
});

const schema = z.object({ password: z.string().min(6, "Min 6 chars"), confirm: z.string() }).refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

function ResetPassword() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: { password: "", confirm: "" } });
  const onSubmit = async (v: z.infer<typeof schema>) => {
    const { error } = await supabase.auth.updateUser({ password: v.password });
    if (error) return toast.error(error.message);
    toast.success("Password updated. Please sign in.");
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong w-full max-w-md rounded-3xl p-8 shadow-glow">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow"><Wallet className="h-5 w-5" /></div>
          <span className="font-bold">Student Wallet AI</span>
        </div>
        <h1 className="mt-6 text-2xl font-black">Set a new password</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-3">
          <div>
            <Label htmlFor="password">New password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" type="password" {...register("password")} className="pl-9" />
            </div>
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <div>
            <Label htmlFor="confirm">Confirm password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="confirm" type="password" {...register("confirm")} className="pl-9" />
            </div>
            {errors.confirm && <p className="mt-1 text-xs text-destructive">{errors.confirm.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full gradient-primary text-primary-foreground shadow-glow">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update password
          </Button>
        </form>
      </div>
    </div>
  );
}
