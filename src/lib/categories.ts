import {
  Utensils, Home, Bus, Fuel, BookOpen, PencilLine, ShoppingBag, Popcorn,
  GraduationCap, Wifi, Phone, Stethoscope, ShieldAlert, Package, LucideIcon,
  TramFront, Film, PlaySquare, Coffee,
} from "lucide-react";

export type ExpenseCategory =
  | "Food" | "College Canteen" | "Hostel" | "Rent" | "Transport" | "Bus" | "Train" | "Petrol"
  | "Shopping" | "Books" | "Stationery" | "Medical" | "Internet" | "Recharge"
  | "Entertainment" | "Movie" | "Subscription" | "College Fee" | "Emergency" | "Others";

export const EXPENSE_CATEGORIES: { name: ExpenseCategory; icon: LucideIcon; color: string }[] = [
  { name: "Food", icon: Utensils, color: "oklch(0.75 0.18 40)" },
  { name: "College Canteen", icon: Coffee, color: "oklch(0.75 0.16 60)" },
  { name: "Hostel", icon: Home, color: "oklch(0.7 0.15 260)" },
  { name: "Rent", icon: Home, color: "oklch(0.65 0.18 280)" },
  { name: "Transport", icon: Bus, color: "oklch(0.72 0.16 200)" },
  { name: "Bus", icon: Bus, color: "oklch(0.7 0.14 210)" },
  { name: "Train", icon: TramFront, color: "oklch(0.68 0.16 190)" },
  { name: "Petrol", icon: Fuel, color: "oklch(0.7 0.18 30)" },
  { name: "Shopping", icon: ShoppingBag, color: "oklch(0.7 0.2 320)" },
  { name: "Books", icon: BookOpen, color: "oklch(0.7 0.16 140)" },
  { name: "Stationery", icon: PencilLine, color: "oklch(0.75 0.14 100)" },
  { name: "Medical", icon: Stethoscope, color: "oklch(0.7 0.2 15)" },
  { name: "Internet", icon: Wifi, color: "oklch(0.7 0.16 180)" },
  { name: "Recharge", icon: Phone, color: "oklch(0.72 0.16 220)" },
  { name: "Entertainment", icon: Popcorn, color: "oklch(0.72 0.2 350)" },
  { name: "Movie", icon: Film, color: "oklch(0.7 0.2 340)" },
  { name: "Subscription", icon: PlaySquare, color: "oklch(0.68 0.18 300)" },
  { name: "College Fee", icon: GraduationCap, color: "oklch(0.65 0.2 240)" },
  { name: "Emergency", icon: ShieldAlert, color: "oklch(0.65 0.24 25)" },
  { name: "Others", icon: Package, color: "oklch(0.65 0.03 265)" },
];

export const INCOME_SOURCES = [
  "Pocket Money", "Parents", "Scholarship", "Part-Time Job", "Freelancing", "Gift", "Refund", "Salary", "Other",
] as const;
export type IncomeSource = typeof INCOME_SOURCES[number];

export const PAYMENT_METHODS = ["Cash", "UPI", "Debit Card", "Credit Card", "Net Banking", "Wallet"] as const;

export function getCategoryMeta(name: string) {
  return EXPENSE_CATEGORIES.find((c) => c.name === name) ?? EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
}
