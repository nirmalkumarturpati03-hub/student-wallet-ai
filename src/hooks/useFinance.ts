import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// ---------- Profile ----------
export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId!).maybeSingle();
      if (error) throw error;
      return data as Tables<"profiles"> | null;
    },
  });
}

export function useUpdateProfile(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: TablesUpdate<"profiles">) => {
      const { data, error } = await supabase.from("profiles").update(patch).eq("id", userId!).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile", userId] }),
  });
}

// ---------- Expenses ----------
export function useExpenses(userId?: string) {
  return useQuery({
    queryKey: ["expenses", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("expenses").select("*").eq("user_id", userId!).order("date", { ascending: false }).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Tables<"expenses">[];
    },
  });
}
export function useAddExpense(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Omit<TablesInsert<"expenses">, "user_id">) => {
      const { data, error } = await supabase.from("expenses").insert({ ...row, user_id: userId! }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses", userId] }),
  });
}
export function useUpdateExpense(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: TablesUpdate<"expenses"> }) => {
      const { data, error } = await supabase.from("expenses").update(patch).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses", userId] }),
  });
}
export function useDeleteExpense(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses", userId] }),
  });
}

// ---------- Incomes ----------
export function useIncomes(userId?: string) {
  return useQuery({
    queryKey: ["incomes", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("incomes").select("*").eq("user_id", userId!).order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Tables<"incomes">[];
    },
  });
}
export function useAddIncome(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Omit<TablesInsert<"incomes">, "user_id">) => {
      const { data, error } = await supabase.from("incomes").insert({ ...row, user_id: userId! }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["incomes", userId] }),
  });
}
export function useDeleteIncome(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("incomes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["incomes", userId] }),
  });
}

// ---------- Goals ----------
export function useGoals(userId?: string) {
  return useQuery({
    queryKey: ["goals", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("savings_goals").select("*").eq("user_id", userId!).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Tables<"savings_goals">[];
    },
  });
}
export function useAddGoal(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Omit<TablesInsert<"savings_goals">, "user_id">) => {
      const { data, error } = await supabase.from("savings_goals").insert({ ...row, user_id: userId! }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals", userId] }),
  });
}
export function useUpdateGoal(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: TablesUpdate<"savings_goals"> }) => {
      const { data, error } = await supabase.from("savings_goals").update(patch).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals", userId] }),
  });
}
export function useDeleteGoal(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("savings_goals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals", userId] }),
  });
}

// ---------- Bills ----------
export function useBills(userId?: string) {
  return useQuery({
    queryKey: ["bills", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("upcoming_bills").select("*").eq("user_id", userId!).order("due_date");
      if (error) throw error;
      return (data ?? []) as Tables<"upcoming_bills">[];
    },
  });
}
export function useAddBill(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Omit<TablesInsert<"upcoming_bills">, "user_id">) => {
      const { data, error } = await supabase.from("upcoming_bills").insert({ ...row, user_id: userId! }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bills", userId] }),
  });
}
export function useUpdateBill(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: TablesUpdate<"upcoming_bills"> }) => {
      const { data, error } = await supabase.from("upcoming_bills").update(patch).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bills", userId] }),
  });
}
export function useDeleteBill(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("upcoming_bills").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bills", userId] }),
  });
}

// ---------- Notifications ----------
export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: ["notifications", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("notifications").select("*").eq("user_id", userId!).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return (data ?? []) as Tables<"notifications">[];
    },
  });
}
export function useMarkNotifRead(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", userId] }),
  });
}
export function useAddNotification(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Omit<TablesInsert<"notifications">, "user_id">) => {
      const { error } = await supabase.from("notifications").insert({ ...row, user_id: userId! });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", userId] }),
  });
}
