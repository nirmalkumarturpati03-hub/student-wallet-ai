import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses, useIncomes, useProfile } from "@/hooks/useFinance";
import { formatMoney } from "@/lib/currency";
import { getCategoryMeta } from "@/lib/categories";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { format, subMonths, isSameMonth, startOfMonth } from "date-fns";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: expenses = [] } = useExpenses(user?.id);
  const { data: incomes = [] } = useIncomes(user?.id);
  const currency = profile?.currency ?? "INR";

  const monthly = useMemo(() => {
    const arr: { month: string; income: number; expense: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = startOfMonth(subMonths(new Date(), i));
      const inc = incomes.filter((x) => isSameMonth(new Date(x.date), d)).reduce((s, x) => s + Number(x.amount), 0);
      const exp = expenses.filter((x) => isSameMonth(new Date(x.date), d)).reduce((s, x) => s + Number(x.amount), 0);
      arr.push({ month: format(d, "MMM"), income: inc, expense: exp });
    }
    return arr;
  }, [expenses, incomes]);

  const catData = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + Number(e.amount)));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value, color: getCategoryMeta(name).color }));
  }, [expenses]);

  const totalInc = incomes.reduce((s, i) => s + Number(i.amount), 0);
  const totalExp = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const savingsRate = totalInc > 0 ? Math.round(((totalInc - totalExp) / totalInc) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black sm:text-3xl">Analytics</h1>
        <p className="text-sm text-muted-foreground">Deep insights into your financial patterns.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="glass rounded-2xl p-5">
          <div className="text-xs uppercase text-muted-foreground">Total income</div>
          <div className="mt-1 text-2xl font-black text-success">{formatMoney(totalInc, currency)}</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="text-xs uppercase text-muted-foreground">Total spent</div>
          <div className="mt-1 text-2xl font-black text-destructive">{formatMoney(totalExp, currency)}</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="text-xs uppercase text-muted-foreground">Savings rate</div>
          <div className="mt-1 text-2xl font-black">{savingsRate}%</div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="mb-3 font-semibold">Income vs Expenses (12 months)</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--success)" stopOpacity={0.5} /><stop offset="1" stopColor="var(--success)" stopOpacity={0} /></linearGradient>
                <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--destructive)" stopOpacity={0.5} /><stop offset="1" stopColor="var(--destructive)" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
              <Legend />
              <Area type="monotone" dataKey="income" stroke="var(--success)" fill="url(#inc)" strokeWidth={2} />
              <Area type="monotone" dataKey="expense" stroke="var(--destructive)" fill="url(#exp)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="mb-3 font-semibold">All-time category breakdown</h3>
        {catData.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={catData} dataKey="value" nameKey="name" outerRadius={110} label>
                  {catData.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
