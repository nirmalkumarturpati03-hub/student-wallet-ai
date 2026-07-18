import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/layout/AppShell";
import ExpensesPage from "@/features/expenses/ExpensesPage";

export const Route = createFileRoute("/_authenticated/expenses")({
  head: () => ({ meta: [{ title: "Expenses · Student Wallet AI" }] }),
  component: () => <AppShell><ExpensesPage /></AppShell>,
});
