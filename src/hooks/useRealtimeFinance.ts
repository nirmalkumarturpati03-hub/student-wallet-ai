import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes to Postgres changes for the current user's finance tables and
 * invalidates the matching React Query caches so every page updates in realtime.
 */
export function useRealtimeFinance(userId?: string) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!userId) return;
    const tables: Array<{ table: string; key: string }> = [
      { table: "expenses", key: "expenses" },
      { table: "incomes", key: "incomes" },
      { table: "savings_goals", key: "goals" },
      { table: "upcoming_bills", key: "bills" },
      { table: "notifications", key: "notifications" },
      { table: "budgets", key: "budgets" },
      { table: "profiles", key: "profile" },
    ];
    const channel = supabase.channel(`finance:${userId}`);
    tables.forEach(({ table, key }) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: table === "profiles" ? `id=eq.${userId}` : `user_id=eq.${userId}` },
        () => qc.invalidateQueries({ queryKey: [key, userId] }),
      );
    });
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, qc]);
}
