-- Neuro-Vitals External Supabase Schema
-- Run this SQL in your Supabase SQL editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  dob DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- TEST SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.test_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('full', 'individual')),
  modules TEXT[] NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sessions" ON public.test_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.test_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.test_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- TEST RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.test_sessions(id) ON DELETE CASCADE NOT NULL,
  rppg_data JSONB DEFAULT '{}',
  gait_data JSONB DEFAULT '{}',
  voice_data JSONB DEFAULT '{}',
  face_data JSONB DEFAULT '{}',
  risk_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own results" ON public.test_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.test_sessions ts
      WHERE ts.id = test_results.session_id AND ts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own results" ON public.test_results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.test_sessions ts
      WHERE ts.id = test_results.session_id AND ts.user_id = auth.uid()
    )
  );

-- ============================================
-- FEEDBACK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert feedback" ON public.feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own feedback" ON public.feedback
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- CONTACT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can submit a contact message
CREATE POLICY "Authenticated users can insert contact messages" ON public.contact_messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- HELP QUESTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.help_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE public.help_questions ENABLE ROW LEVEL SECURITY;

-- Help questions are publicly readable
CREATE POLICY "Anyone can read help questions" ON public.help_questions
  FOR SELECT USING (true);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_test_sessions_user_id ON public.test_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_session_id ON public.test_results(session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
