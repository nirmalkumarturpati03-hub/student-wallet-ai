import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/layout/AppShell";
import BudgetPage from "@/features/budget/BudgetPage";

export const Route = createFileRoute("/_authenticated/budget")({
  head: () => ({ meta: [{ title: "Budget · Student Wallet AI" }] }),
  component: () => <AppShell><BudgetPage /></AppShell>,
});
