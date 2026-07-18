import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { aiChat } from "@/lib/ai.functions";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses, useIncomes, useProfile, useGoals } from "@/hooks/useFinance";
import { formatMoney } from "@/lib/currency";
import { isSameMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How can I save ₹500 more this month?",
  "Where am I overspending?",
  "Help me plan a budget for next month",
  "Tips to save on food expenses",
];

export default function AssistantPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: expenses = [] } = useExpenses(user?.id);
  const { data: incomes = [] } = useIncomes(user?.id);
  const { data: goals = [] } = useGoals(user?.id);
  const chat = useServerFn(aiChat);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const context = () => {
    const now = new Date();
    const monthExp = expenses.filter((e) => isSameMonth(new Date(e.date), now));
    const monthInc = incomes.filter((i) => isSameMonth(new Date(i.date), now));
    const currency = profile?.currency ?? "INR";
    const catMap = new Map<string, number>();
    monthExp.forEach((e) => catMap.set(e.category, (catMap.get(e.category) ?? 0) + Number(e.amount)));
    const cats = Array.from(catMap.entries()).map(([c, v]) => `${c}: ${formatMoney(v, currency)}`).join(", ");
    const goalStr = goals.map((g) => `${g.name}: ${formatMoney(Number(g.saved_amount), currency)}/${formatMoney(Number(g.target_amount), currency)}`).join("; ");
    return `Currency: ${currency}. Monthly budget: ${formatMoney(Number(profile?.monthly_budget ?? 0), currency)}. This month income: ${formatMoney(monthInc.reduce((s, i) => s + Number(i.amount), 0), currency)}. This month expenses: ${formatMoney(monthExp.reduce((s, e) => s + Number(e.amount), 0), currency)}. By category: ${cats || "none"}. Goals: ${goalStr || "none"}.`;
  };

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await chat({ data: { messages: next, context: context() } });
      setMessages([...next, { role: "assistant", content: res.text }]);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "AI is unavailable");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col animate-fade-in">
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow"><Sparkles className="h-5 w-5" /></div>
        <div>
          <h1 className="text-xl font-black sm:text-2xl">AI Assistant</h1>
          <p className="text-xs text-muted-foreground">Ask me anything about your finances.</p>
        </div>
      </div>

      <div className="glass flex flex-1 flex-col overflow-hidden rounded-2xl">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="mx-auto max-w-xl py-8 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow"><Sparkles className="h-6 w-6" /></div>
              <p className="mt-4 text-lg font-semibold">Hi! I'm your finance coach.</p>
              <p className="mt-1 text-sm text-muted-foreground">Try one of these to get started:</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs hover:bg-muted">{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "gradient-primary text-primary-foreground" : "bg-muted"}`}>
                {m.content}
              </div>
            </motion.div>
          ))}
          {loading && <div className="flex justify-start"><div className="rounded-2xl bg-muted px-4 py-2.5"><Loader2 className="h-4 w-4 animate-spin" /></div></div>}
          <div ref={endRef} />
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 border-t border-border p-3">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your money..." disabled={loading} />
          <Button type="submit" disabled={loading || !input.trim()} className="gradient-primary text-primary-foreground"><Send className="h-4 w-4" /></Button>
        </form>
      </div>
    </div>
  );
}
