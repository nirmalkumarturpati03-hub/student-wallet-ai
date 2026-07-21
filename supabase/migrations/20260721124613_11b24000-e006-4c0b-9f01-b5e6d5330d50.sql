
REVOKE EXECUTE ON FUNCTION public.check_goal_completion() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_budget_alerts() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_large_expense() FROM PUBLIC, anon, authenticated;
