import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";

const search = z.object({
  mode: z.enum(["login", "register"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Login or sign up · Student Wallet AI" }] }),
  component: AuthPage,
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 chars"),
  remember: z.boolean().optional(),
});
const registerSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your name"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 chars"),
});

function AuthPage() {
  const { mode: initialMode, redirect } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"login" | "register">(initialMode ?? "login");
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: redirect ?? "/dashboard", replace: true });
  }, [user, loading, redirect, navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-primary/25 blur-3xl animate-float" />
        <div className="absolute right-10 bottom-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl lg:grid-cols-2 lg:glass-strong lg:shadow-glow">
        <div className="hidden flex-col justify-between bg-gradient-to-br from-primary/20 via-accent/10 to-transparent p-10 lg:flex">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow"><Wallet className="h-5 w-5" /></div>
            <span className="font-bold">Student Wallet <span className="text-gradient">AI</span></span>
          </Link>
          <div>
            <div className="text-3xl font-black leading-tight">Money habits that actually stick.</div>
            <p className="mt-3 text-sm text-muted-foreground">Get personalized AI insights, budget alerts, and beautiful analytics — free for students.</p>
          </div>
          <div className="text-xs text-muted-foreground">Trusted by 12,000+ students</div>
        </div>

        <div className="glass-strong rounded-3xl p-6 sm:p-10 lg:rounded-none lg:bg-transparent lg:backdrop-blur-none lg:shadow-none lg:glass-strong-none">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow"><Wallet className="h-5 w-5" /></div>
            <span className="font-bold">Student Wallet AI</span>
          </div>
          <div className="mb-6 flex gap-2 rounded-xl bg-muted p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${mode === "login" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
            >Login</button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${mode === "register" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
            >Register</button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {mode === "login" ? <LoginForm redirect={redirect} /> : <RegisterForm onDone={() => setMode("login")} />}
            </motion.div>
          </AnimatePresence>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or continue with <div className="h-px flex-1 bg-border" />
          </div>

          <GoogleButton />
        </div>
      </div>
    </div>
  );
}

function LoginForm({ redirect }: { redirect?: string }) {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async (v: z.infer<typeof loginSchema>) => {
    const { error } = await supabase.auth.signInWithPassword({ email: v.email, password: v.password });
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: redirect ?? "/dashboard", replace: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="email" type="email" {...register("email")} placeholder="you@college.edu" className="pl-9" />
        </div>
        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="password" type="password" {...register("password")} placeholder="••••••••" className="pl-9" />
        </div>
        {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs">
          <Checkbox id="remember" defaultChecked {...(register("remember") as unknown as object)} />
          Remember me
        </label>
        <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full gradient-primary text-primary-foreground shadow-glow">
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign in
      </Button>
    </form>
  );
}

function RegisterForm({ onDone }: { onDone: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: "", email: "", password: "" },
  });

  const onSubmit = async (v: z.infer<typeof registerSchema>) => {
    const { error } = await supabase.auth.signUp({
      email: v.email,
      password: v.password,
      options: {
        data: { full_name: v.full_name },
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });
    if (error) return toast.error(error.message);
    toast.success("Account created! Check your email to verify.");
    onDone();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <Label htmlFor="name">Full name</Label>
        <div className="relative">
          <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="name" {...register("full_name")} placeholder="Priya Sharma" className="pl-9" />
        </div>
        {errors.full_name && <p className="mt-1 text-xs text-destructive">{errors.full_name.message}</p>}
      </div>
      <div>
        <Label htmlFor="email2">Email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="email2" type="email" {...register("email")} placeholder="you@college.edu" className="pl-9" />
        </div>
        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor="pw2">Password</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="pw2" type="password" {...register("password")} placeholder="At least 6 chars" className="pl-9" />
        </div>
        {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full gradient-primary text-primary-foreground shadow-glow">
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create account
      </Button>
    </form>
  );
}

function GoogleButton() {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      setLoading(false);
      toast.error(result.error.message ?? "Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    // else session was set, navigate
    window.location.href = "/dashboard";
  };
  return (
    <button
      onClick={handle}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
        <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84c.87-2.6 3.3-4.5 6.16-4.5z"/></svg>
      )}
      Continue with Google
    </button>
  );
}
