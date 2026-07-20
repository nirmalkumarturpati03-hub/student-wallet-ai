DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['expenses','incomes','savings_goals','upcoming_bills','notifications','budgets','profiles']
  LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', t);
  END LOOP;
END $$;