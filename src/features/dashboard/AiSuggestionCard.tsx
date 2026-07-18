import { useEffect, useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { aiInsights } from "@/lib/ai.functions";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses, useIncomes, useProfile } from "@/hooks/useFinance";
import { formatMoney } from "@/lib/currency";
import { isSameMonth } from "date-fns";

export default function AiSuggestionCard() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: expenses = [] } = useExpenses(user?.id);
  const { data: incomes = [] } = useIncomes(user?.id);
  const fetchInsight = useServerFn(aiInsights);
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const buildContext = () => {
    const now = new Date();
    const monthExp = expenses.filter((e) => isSameMonth(new Date(e.date), now));
    const catMap = new Map<string, number>();
    monthExp.forEach((e) => catMap.set(e.category, (catMap.get(e.category) ?? 0) + Number(e.amount)));
    const catStr = Array.from(catMap.entries()).map(([c, v]) => `${c}: ${formatMoney(v, profile?.currency ?? "INR")}`).join(", ");
    const totalExp = monthExp.reduce((s, e) => s + Number(e.amount), 0);
    const monthInc = incomes.filter((i) => isSameMonth(new Date(i.date), now)).reduce((s, i) => s + Number(i.amount), 0);
    return `Currency: ${profile?.currency ?? "INR"}. Monthly budget: ${formatMoney(Number(profile?.monthly_budget ?? 0), profile?.currency ?? "INR")}. Month income: ${formatMoney(monthInc, profile?.currency ?? "INR")}. Month expenses: ${formatMoney(totalExp, profile?.currency ?? "INR")}. By category: ${catStr || "none"}.`;
  };

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const r = await fetchInsight({ data: { context: buildContext() } });
      setInsight(r.suggestion);
    } catch {
      setInsight("Add a few expenses and I'll analyze your habits.");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (user && expenses.length > 0 && !insight) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, expenses.length]);

  return (
    <div className="glass-strong rounded-2xl p-5 shadow-glow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow"><Sparkles className="h-4 w-4" /></div>
          <h3 className="font-semibold">AI insight</h3>
        </div>
        <button onClick={load} disabled={loading} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-50" aria-label="Refresh">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      <p className="mt-3 min-h-16 text-sm leading-relaxed">
        {loading ? <span className="skeleton block h-3 w-3/4 rounded" /> : insight || "Track a few expenses to unlock personalized AI insights."}
      </p>
    </div>
  );
}
