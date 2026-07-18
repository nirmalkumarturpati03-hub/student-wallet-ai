import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/layout/AppShell";
import TransactionsPage from "@/features/transactions/TransactionsPage";

export const Route = createFileRoute("/_authenticated/transactions")({
  head: () => ({ meta: [{ title: "Transactions · Student Wallet AI" }] }),
  component: () => <AppShell><TransactionsPage /></AppShell>,
});
