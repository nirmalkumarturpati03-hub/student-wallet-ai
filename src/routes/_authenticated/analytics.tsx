import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/layout/AppShell";
import AnalyticsPage from "@/features/analytics/AnalyticsPage";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics · Student Wallet AI" }] }),
  component: () => <AppShell><AnalyticsPage /></AppShell>,
});
