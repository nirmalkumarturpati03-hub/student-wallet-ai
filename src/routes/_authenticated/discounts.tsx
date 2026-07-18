import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/layout/AppShell";
import DiscountsPage from "@/features/discounts/DiscountsPage";

export const Route = createFileRoute("/_authenticated/discounts")({
  head: () => ({ meta: [{ title: "Student Discounts · Student Wallet AI" }] }),
  component: () => <AppShell><DiscountsPage /></AppShell>,
});
