import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Wallet, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset your password · Student Wallet AI" }] }),
  component: ForgotPassword,
});

const schema = z.object({ email: z.string().email() });

function ForgotPassword() {
  const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm({ resolver: zodResolver(schema), defaultValues: { email: "" } });
  const onSubmit = async (v: z.infer<typeof schema>) => {
    const { error } = await supabase.auth.resetPasswordForEmail(v.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return toast.error(error.message);
    toast.success("Check your email for the reset link.");
  };
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong w-full max-w-md rounded-3xl p-8 shadow-glow">
        <Link to="/auth" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> Back</Link>
        <div className="mt-4 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow"><Wallet className="h-5 w-5" /></div>
          <span className="font-bold">Student Wallet AI</span>
        </div>
        <h1 className="mt-6 text-2xl font-black">Forgot password?</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enter your email and we'll send you a reset link.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-3">
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" {...register("email")} className="pl-9" />
            </div>
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full gradient-primary text-primary-foreground shadow-glow">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send reset link
          </Button>
          {isSubmitSuccessful && <p className="text-center text-xs text-success">Email sent (if the account exists).</p>}
        </form>
      </div>
    </div>
  );
}
