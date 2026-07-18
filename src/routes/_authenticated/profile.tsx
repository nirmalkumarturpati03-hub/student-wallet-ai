import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/layout/AppShell";
import ProfilePage from "@/features/profile/ProfilePage";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile · Student Wallet AI" }] }),
  component: () => <AppShell><ProfilePage /></AppShell>,
});
