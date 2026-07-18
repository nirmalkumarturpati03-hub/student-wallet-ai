import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/layout/AppShell";
import SettingsPage from "@/features/settings/SettingsPage";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings · Student Wallet AI" }] }),
  component: () => <AppShell><SettingsPage /></AppShell>,
});
