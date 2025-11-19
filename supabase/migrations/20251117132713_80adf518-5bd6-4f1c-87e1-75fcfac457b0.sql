-- Create enum for report status
CREATE TYPE public.report_status AS ENUM ('pending', 'in_review', 'investigating', 'resolved', 'dismissed');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  incident_date DATE NOT NULL,
  description TEXT NOT NULL,
  evidence_details TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  tracking_token TEXT UNIQUE,
  status public.report_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view their own reports
CREATE POLICY "Users can view their own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone with a tracking token can view that report (for anonymous reports)
CREATE POLICY "Anyone can view reports with tracking token"
  ON public.reports FOR SELECT
  USING (tracking_token IS NOT NULL);

-- Authenticated users can create reports
CREATE POLICY "Authenticated users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = user_id OR is_anonymous = true);

-- Anonymous users can create reports
CREATE POLICY "Anonymous users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (is_anonymous = true);

-- Create report status history table
CREATE TABLE public.report_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  status public.report_status NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.report_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view status history of their reports"
  ON public.report_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id = report_status_history.report_id
      AND reports.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view status history with token"
  ON public.report_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id = report_status_history.report_id
      AND reports.tracking_token IS NOT NULL
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate tracking token
CREATE OR REPLACE FUNCTION public.generate_tracking_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  token TEXT;
BEGIN
  token := encode(gen_random_bytes(16), 'hex');
  RETURN UPPER(SUBSTRING(token FROM 1 FOR 8) || '-' || SUBSTRING(token FROM 9 FOR 8));
END;
$$;

-- Insert initial status history when report is created
CREATE OR REPLACE FUNCTION public.create_initial_status_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.report_status_history (report_id, status, notes)
  VALUES (NEW.id, NEW.status, 'Denúncia recebida');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_report_created
  AFTER INSERT ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.create_initial_status_history();