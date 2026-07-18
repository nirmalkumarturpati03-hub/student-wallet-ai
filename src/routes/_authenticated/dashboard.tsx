import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/layout/AppShell";
import DashboardPage from "@/features/dashboard/DashboardPage";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · Student Wallet AI" }] }),
  component: () => (
    <AppShell>
      <DashboardPage />
    </AppShell>
  ),
});
