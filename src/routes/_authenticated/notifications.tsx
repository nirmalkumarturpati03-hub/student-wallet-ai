import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/layout/AppShell";
import NotificationsPage from "@/features/notifications/NotificationsPage";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications · Student Wallet AI" }] }),
  component: () => <AppShell><NotificationsPage /></AppShell>,
});
