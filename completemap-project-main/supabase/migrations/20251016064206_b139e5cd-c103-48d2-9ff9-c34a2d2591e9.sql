-- Create test_sessions table to store test information
CREATE TABLE IF NOT EXISTS public.test_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_code TEXT NOT NULL UNIQUE,
  user_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'checking', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  deliverability_score INTEGER,
  total_inboxes INTEGER DEFAULT 5,
  successful_deliveries INTEGER DEFAULT 0
);

-- Create test_results table to store individual inbox results
CREATE TABLE IF NOT EXISTS public.test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_session_id UUID REFERENCES public.test_sessions(id) ON DELETE CASCADE NOT NULL,
  inbox_email TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('gmail', 'outlook', 'yahoo', 'protonmail', 'icloud')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'checking', 'received', 'not_received', 'error')),
  folder_location TEXT CHECK (folder_location IN ('inbox', 'spam', 'promotions', 'unknown')),
  checked_at TIMESTAMPTZ,
  error_message TEXT,
  UNIQUE(test_session_id, inbox_email)
);

-- Enable Row Level Security
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (no authentication required for this tool)
CREATE POLICY "Allow public read access to test_sessions"
  ON public.test_sessions
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to test_sessions"
  ON public.test_sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to test_sessions"
  ON public.test_sessions
  FOR UPDATE
  USING (true);

CREATE POLICY "Allow public read access to test_results"
  ON public.test_results
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to test_results"
  ON public.test_results
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to test_results"
  ON public.test_results
  FOR UPDATE
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_test_sessions_test_code ON public.test_sessions(test_code);
CREATE INDEX IF NOT EXISTS idx_test_sessions_created_at ON public.test_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_results_test_session_id ON public.test_results(test_session_id);
CREATE INDEX IF NOT EXISTS idx_test_results_provider ON public.test_results(provider);

-- Create function to calculate deliverability score
CREATE OR REPLACE FUNCTION public.calculate_deliverability_score(session_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  total_count INTEGER;
  received_count INTEGER;
  score INTEGER;
BEGIN
  -- Count total test results
  SELECT COUNT(*) INTO total_count
  FROM public.test_results
  WHERE test_session_id = session_id;
  
  -- Count received emails
  SELECT COUNT(*) INTO received_count
  FROM public.test_results
  WHERE test_session_id = session_id
    AND status = 'received';
  
  -- Calculate percentage score
  IF total_count > 0 THEN
    score := ROUND((received_count::DECIMAL / total_count::DECIMAL) * 100);
  ELSE
    score := 0;
  END IF;
  
  RETURN score;
END;
$$;

-- Create trigger to update session status and score when results change
CREATE OR REPLACE FUNCTION public.update_test_session_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  all_checked BOOLEAN;
  session_score INTEGER;
  received_count INTEGER;
BEGIN
  -- Check if all results for this session have been checked
  SELECT NOT EXISTS (
    SELECT 1 FROM public.test_results
    WHERE test_session_id = NEW.test_session_id
      AND status = 'pending'
  ) INTO all_checked;
  
  -- Calculate deliverability score
  session_score := public.calculate_deliverability_score(NEW.test_session_id);
  
  -- Count successful deliveries
  SELECT COUNT(*) INTO received_count
  FROM public.test_results
  WHERE test_session_id = NEW.test_session_id
    AND status = 'received';
  
  -- Update session if all checks are complete
  IF all_checked THEN
    UPDATE public.test_sessions
    SET 
      status = 'completed',
      completed_at = now(),
      deliverability_score = session_score,
      successful_deliveries = received_count
    WHERE id = NEW.test_session_id;
  ELSE
    UPDATE public.test_sessions
    SET 
      deliverability_score = session_score,
      successful_deliveries = received_count
    WHERE id = NEW.test_session_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_test_session
  AFTER INSERT OR UPDATE ON public.test_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_test_session_status();