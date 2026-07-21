
-- Extend savings_goals with description, priority, image_url
ALTER TABLE public.savings_goals
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Extend upcoming_bills with description, repeat_option, reminder_date
ALTER TABLE public.upcoming_bills
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS repeat_option TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS reminder_date DATE;

-- Goal contribution history
CREATE TABLE IF NOT EXISTS public.goal_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount <> 0),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goal_transactions TO authenticated;
GRANT ALL ON public.goal_transactions TO service_role;
ALTER TABLE public.goal_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Own goal transactions" ON public.goal_transactions;
CREATE POLICY "Own goal transactions" ON public.goal_transactions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_goal_tx_user ON public.goal_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_goal_tx_goal ON public.goal_transactions(goal_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.goal_transactions;

-- Auto-complete savings goal + notify when target reached
CREATE OR REPLACE FUNCTION public.check_goal_completion()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.saved_amount >= NEW.target_amount AND COALESCE(OLD.completed, false) = false THEN
    NEW.completed := true;
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (NEW.user_id, '🎉 Goal reached!',
            'You hit your "' || NEW.name || '" savings goal. Amazing work!',
            'goal_completed');
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_goal_completion ON public.savings_goals;
CREATE TRIGGER trg_goal_completion
  BEFORE UPDATE ON public.savings_goals
  FOR EACH ROW EXECUTE FUNCTION public.check_goal_completion();

-- Budget threshold notifications on expense changes
CREATE OR REPLACE FUNCTION public.check_budget_alerts()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid UUID;
  budget NUMERIC;
  spent NUMERIC;
  pct NUMERIC;
  month_key TEXT := to_char(now(), 'YYYY-MM');
  threshold INT;
  notif_type TEXT;
BEGIN
  uid := COALESCE(NEW.user_id, OLD.user_id);
  SELECT monthly_budget INTO budget FROM public.profiles WHERE id = uid;
  IF budget IS NULL OR budget <= 0 THEN RETURN NEW; END IF;

  SELECT COALESCE(SUM(amount), 0) INTO spent
  FROM public.expenses
  WHERE user_id = uid
    AND to_char(date, 'YYYY-MM') = month_key;

  pct := (spent / budget) * 100;

  FOR threshold IN SELECT unnest(ARRAY[50, 75, 90, 100]) LOOP
    IF pct >= threshold THEN
      notif_type := 'budget_' || threshold || '_' || month_key;
      IF NOT EXISTS (
        SELECT 1 FROM public.notifications
        WHERE user_id = uid AND type = notif_type
      ) THEN
        INSERT INTO public.notifications (user_id, title, message, type)
        VALUES (uid,
          CASE WHEN threshold = 100 THEN '🚨 Budget exceeded'
               WHEN threshold = 90 THEN '⚠️ 90% of budget used'
               WHEN threshold = 75 THEN '⚠️ 75% of budget used'
               ELSE '📊 Halfway through your budget' END,
          'You have spent ' || round(pct, 0) || '% of this month''s budget.',
          notif_type);
      END IF;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_expense_budget_alert ON public.expenses;
CREATE TRIGGER trg_expense_budget_alert
  AFTER INSERT OR UPDATE OR DELETE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.check_budget_alerts();

-- Large expense notification (>= 25% of monthly budget in a single txn)
CREATE OR REPLACE FUNCTION public.notify_large_expense()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  budget NUMERIC;
BEGIN
  SELECT monthly_budget INTO budget FROM public.profiles WHERE id = NEW.user_id;
  IF budget IS NOT NULL AND budget > 0 AND NEW.amount >= budget * 0.25 THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (NEW.user_id, '💸 Large expense recorded',
            COALESCE(NEW.title, 'Expense') || ' of ' || NEW.amount || ' logged.',
            'large_expense');
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_large_expense ON public.expenses;
CREATE TRIGGER trg_large_expense
  AFTER INSERT ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.notify_large_expense();
