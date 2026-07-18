import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Wallet, PiggyBank, BarChart3, Bell, Bot, Target, ShieldCheck, Zap, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Student Wallet AI — The Smart Finance Companion for Every Student" },
      { name: "description", content: "Track expenses, save money, achieve goals, and let AI guide your spending habits. Built for students." },
      { property: "og:title", content: "Student Wallet AI" },
      { property: "og:description", content: "The smart finance companion for every student." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const goStarted = () => (user ? navigate({ to: "/dashboard" }) : navigate({ to: "/auth", search: { mode: "register" } as never }));

  return (
    <div className="relative overflow-hidden">
      {/* Floating shapes */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-accent/20 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-warning/10 blur-3xl animate-float" style={{ animationDelay: "3s" }} />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-base font-bold">Student Wallet <span className="text-gradient">AI</span></span>
          </Link>
          <nav className="mx-auto hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#about" className="hover:text-foreground">About</a>
            <a href="#contact" className="hover:text-foreground">Contact</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/auth" className="rounded-lg px-3 py-2 text-sm hover:bg-muted">Login</Link>
            <button onClick={goStarted} className="rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-105">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 lg:px-8 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">AI-powered finance for students</span>
            </div>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Manage your student finances <span className="text-gradient">smarter</span>.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Track expenses, save money, achieve goals — and let AI guide your spending habits. All in one beautiful dashboard, built for college life.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button onClick={goStarted} className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-3 font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-105">
                Get Started <ArrowRight className="h-4 w-4" />
              </button>
              <a href="#features" className="rounded-xl border border-border bg-background/50 px-5 py-3 font-semibold hover:bg-muted">
                Learn More
              </a>
            </div>
            <div className="mt-8 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-7 w-7 rounded-full border-2 border-background bg-gradient-to-br from-primary to-accent" />
                ))}
              </div>
              <span>Loved by 12,000+ students · <Star className="inline h-3 w-3 fill-warning text-warning" /> 4.9</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="relative">
            <div className="glass-strong rounded-3xl p-5 shadow-glow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Current balance</div>
                  <div className="mt-1 text-3xl font-black">₹ 18,420</div>
                </div>
                <div className="rounded-full bg-success/20 px-2.5 py-1 text-xs font-semibold text-success">+12%</div>
              </div>
              <div className="mt-4 h-32 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 p-3">
                <svg viewBox="0 0 200 80" className="h-full w-full">
                  <path d="M 0 60 Q 25 40, 50 45 T 100 30 T 150 25 T 200 15" fill="none" stroke="url(#g)" strokeWidth="3" />
                  <defs>
                    <linearGradient id="g" x1="0" x2="1">
                      <stop offset="0" stopColor="var(--primary)" />
                      <stop offset="1" stopColor="var(--accent)" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                {[
                  { l: "Food", v: "₹2.1k" },
                  { l: "Books", v: "₹1.2k" },
                  { l: "Transport", v: "₹680" },
                ].map((x) => (
                  <div key={x.l} className="glass rounded-xl p-2">
                    <div className="text-muted-foreground">{x.l}</div>
                    <div className="font-semibold">{x.v}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Floating coins */}
            <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -right-4 -top-4 grid h-14 w-14 place-items-center rounded-full gradient-primary text-primary-foreground shadow-glow">
              ₹
            </motion.div>
            <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0.8 }} className="absolute -bottom-3 -left-3 grid h-12 w-12 place-items-center rounded-full bg-warning text-warning-foreground shadow-glow">
              $
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-black sm:text-4xl">Everything you need to <span className="text-gradient">win at money</span></h2>
          <p className="mt-3 text-muted-foreground">Purpose-built for students. Zero fluff, all clarity.</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Wallet, title: "Expenses", desc: "Log purchases in a tap. Categorize automatically." },
            { icon: PiggyBank, title: "Budgets", desc: "Daily, weekly, and monthly caps with smart warnings." },
            { icon: Target, title: "Savings goals", desc: "Set targets with deadlines. Watch progress grow." },
            { icon: Bot, title: "AI Assistant", desc: "Ask questions. Get personalized money advice." },
            { icon: BarChart3, title: "Analytics", desc: "Beautiful charts of where your money really goes." },
            { icon: Bell, title: "Alerts", desc: "Low balance, bill reminders, and goal completions." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="glass rounded-2xl p-6 transition-transform hover:-translate-y-1"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-black sm:text-4xl">Three steps. <span className="text-gradient">Full control.</span></h2>
            <ol className="mt-8 space-y-6">
              {[
                { t: "Sign up in seconds", d: "Email or Google. No credit card." },
                { t: "Log income and expenses", d: "Quick-add, receipts, or voice. Your call." },
                { t: "Let AI do the thinking", d: "Get insights, alerts, and smarter budgets automatically." },
              ].map((s, i) => (
                <li key={s.t} className="flex gap-4">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-primary text-sm font-bold text-primary-foreground shadow-glow">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{s.t}</div>
                    <div className="text-sm text-muted-foreground">{s.d}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="glass-strong rounded-3xl p-6">
            <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-success" /> Bank-grade privacy · <Zap className="h-4 w-4 text-warning" /> Real-time sync
            </div>
            <div className="grid gap-3">
              {[
                { l: "Monthly budget", v: "₹ 10,000", p: 62, tone: "primary" },
                { l: "Savings goal (Laptop)", v: "₹ 45,000 / ₹ 60,000", p: 75, tone: "accent" },
                { l: "Weekly food", v: "₹ 900 / ₹ 1,500", p: 60, tone: "warning" },
              ].map((r) => (
                <div key={r.l} className="rounded-2xl border border-border bg-background/40 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{r.l}</span>
                    <span className="text-muted-foreground">{r.v}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full ${r.tone === "primary" ? "gradient-primary" : r.tone === "accent" ? "bg-accent" : "bg-warning"}`} style={{ width: `${r.p}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-black sm:text-4xl">Students <span className="text-gradient">love it</span></h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { n: "Priya · IIT Bombay", t: "Saved ₹8k in one semester. The AI suggestions actually work." },
            { n: "Rahul · DU", t: "Finally see where my pocket money vanishes. Life-changing." },
            { n: "Aisha · BITS Pilani", t: "The dashboard is prettier than my Instagram feed." },
          ].map((r) => (
            <div key={r.n} className="glass rounded-2xl p-6">
              <div className="flex gap-1 text-warning">{[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-warning" />)}</div>
              <p className="mt-3 text-sm">"{r.t}"</p>
              <p className="mt-4 text-xs font-semibold text-muted-foreground">{r.n}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-black sm:text-4xl">Free for students, <span className="text-gradient">forever</span></h2>
        <p className="mt-3 text-center text-muted-foreground">Upgrade for advanced AI and unlimited receipts.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:mx-auto lg:max-w-3xl">
          {[
            { name: "Starter", price: "Free", perks: ["Unlimited expenses", "Budgets & goals", "Basic AI tips", "Mobile-friendly"], cta: "Get Started", featured: false },
            { name: "Plus", price: "₹99/mo", perks: ["Everything in Starter", "Advanced AI Assistant", "Receipt OCR (unlimited)", "Voice input", "Priority support"], cta: "Start Free Trial", featured: true },
          ].map((p) => (
            <div key={p.name} className={`rounded-3xl p-6 ${p.featured ? "glass-strong border-primary/40 shadow-glow" : "glass"}`}>
              <div className="text-sm font-semibold text-muted-foreground">{p.name}</div>
              <div className="mt-2 text-4xl font-black">{p.price}</div>
              <ul className="mt-5 space-y-2 text-sm">
                {p.perks.map((x) => <li key={x} className="flex gap-2"><span className="text-success">✓</span> {x}</li>)}
              </ul>
              <button onClick={goStarted} className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold ${p.featured ? "gradient-primary text-primary-foreground shadow-glow" : "border border-border hover:bg-muted"}`}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-black sm:text-4xl">FAQ</h2>
        <div className="mt-8 space-y-3">
          {[
            { q: "Is my data safe?", a: "Yes. Data is stored securely, encrypted in transit, and only you can access it." },
            { q: "Does it work without internet?", a: "You need internet for AI features and sync, but the interface is fast and mobile-friendly." },
            { q: "Can I export my data?", a: "Yes — export transactions to CSV any time from the Transactions page." },
            { q: "Do you sell my data?", a: "Never. This is a privacy-first product built for students." },
          ].map((f) => (
            <details key={f.q} className="glass group rounded-2xl p-4">
              <summary className="cursor-pointer list-none font-semibold [&::-webkit-details-marker]:hidden">
                <span className="inline-block transition-transform group-open:rotate-45">+</span> <span className="ml-2">{f.q}</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* About / Contact / Footer */}
      <section id="about" className="mx-auto max-w-7xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <div className="glass-strong rounded-3xl p-10 text-center">
          <h2 className="text-3xl font-black sm:text-4xl">Ready to take control?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Join thousands of students building better money habits — one transaction at a time.</p>
          <button onClick={goStarted} className="mx-auto mt-6 inline-flex items-center gap-2 rounded-xl gradient-primary px-6 py-3 font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-105">
            Start free <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <footer id="contact" className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <div>© {new Date().getFullYear()} Student Wallet AI · All rights reserved.</div>
          <div className="flex gap-5">
            <a href="mailto:hello@studentwallet.ai" className="hover:text-foreground">Contact</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
