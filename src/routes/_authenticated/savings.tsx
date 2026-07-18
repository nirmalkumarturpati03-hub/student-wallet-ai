import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/layout/AppShell";
import SavingsPage from "@/features/savings/SavingsPage";

export const Route = createFileRoute("/_authenticated/savings")({
  head: () => ({ meta: [{ title: "Savings Goals · Student Wallet AI" }] }),
  component: () => <AppShell><SavingsPage /></AppShell>,
});
