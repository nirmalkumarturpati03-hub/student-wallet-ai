import { isToday, isThisWeek, isThisMonth, parseISO } from "date-fns";

export type DateRange = "all" | "today" | "week" | "month" | "custom";
export type SortMode = "newest" | "oldest" | "highest" | "lowest";

export function inRange(dateStr: string, range: DateRange, from?: string, to?: string): boolean {
  const d = parseISO(dateStr);
  switch (range) {
    case "today": return isToday(d);
    case "week": return isThisWeek(d, { weekStartsOn: 1 });
    case "month": return isThisMonth(d);
    case "custom": {
      if (from && d < parseISO(from)) return false;
      if (to && d > parseISO(to)) return false;
      return true;
    }
    default: return true;
  }
}

export function sortItems<T extends { date: string; amount: number | string; created_at?: string }>(
  items: T[], mode: SortMode,
): T[] {
  const arr = [...items];
  switch (mode) {
    case "oldest": return arr.sort((a, b) => (a.date < b.date ? -1 : 1));
    case "highest": return arr.sort((a, b) => Number(b.amount) - Number(a.amount));
    case "lowest": return arr.sort((a, b) => Number(a.amount) - Number(b.amount));
    default: return arr.sort((a, b) => (a.date < b.date ? 1 : -1));
  }
}

export function matchesQuery(q: string, ...fields: (string | number | null | undefined)[]): boolean {
  if (!q) return true;
  const needle = q.toLowerCase().trim();
  return fields.some((f) => f != null && String(f).toLowerCase().includes(needle));
}
