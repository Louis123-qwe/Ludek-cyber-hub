-- ==============================================================================
-- LUDEK TECH HUB — 001 INITIAL RELATIONAL SCHEMA
-- Target: PostgreSQL 15+ / Supabase
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. ROLES & PROFILES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
  id SMALLINT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE CHECK (name IN ('student', 'instructor', 'admin')),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE CHECK (char_length(username) BETWEEN 3 AND 32),
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT DEFAULT NULL,
  bio TEXT NOT NULL DEFAULT '',
  role_id SMALLINT NOT NULL DEFAULT 1 REFERENCES public.roles(id),
  preferred_pace TEXT NOT NULL DEFAULT 'slow' CHECK (preferred_pace IN ('slow', 'standard', 'accelerated')),
  daily_goal_minutes INTEGER NOT NULL DEFAULT 30 CHECK (daily_goal_minutes BETWEEN 5 AND 480),
  learning_goal TEXT NOT NULL DEFAULT 'Build my first responsive portfolio website',
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON public.profiles(role_id);

-- ------------------------------------------------------------------------------
-- 2. CURRICULUM HIERARCHY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  order_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  estimated_hours INTEGER NOT NULL DEFAULT 4 CHECK (estimated_hours > 0),
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  learning_path_id TEXT NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  order_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_path_id ON public.courses(learning_path_id);

CREATE TABLE IF NOT EXISTS public.modules (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modules_course_id ON public.modules(course_id);

CREATE TABLE IF NOT EXISTS public.lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 15 CHECK (duration_minutes > 0),
  xp_reward INTEGER NOT NULL DEFAULT 50 CHECK (xp_reward >= 0),
  objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
  prerequisites JSONB NOT NULL DEFAULT '[]'::jsonb,
  content_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  common_mistakes JSONB NOT NULL DEFAULT '[]'::jsonb,
  key_takeaways JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);

CREATE TABLE IF NOT EXISTS public.lesson_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL CHECK (step_number > 0),
  title TEXT NOT NULL,
  plain_explanation TEXT NOT NULL,
  deeper_explanation TEXT NOT NULL DEFAULT '',
  analogy TEXT DEFAULT NULL,
  code_snippet TEXT DEFAULT NULL,
  code_language TEXT DEFAULT 'html' CHECK (code_language IN ('html', 'css', 'javascript', 'bash', 'http')),
  what_if_missing TEXT DEFAULT NULL,
  why_it_matters TEXT DEFAULT NULL,
  UNIQUE (lesson_id, step_number)
);

CREATE INDEX IF NOT EXISTS idx_lesson_steps_lesson_id ON public.lesson_steps(lesson_id);

-- ------------------------------------------------------------------------------
-- 3. EXERCISES & VALIDATION TESTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exercises (
  id TEXT PRIMARY KEY,
  lesson_id TEXT REFERENCES public.lessons(id) ON DELETE SET NULL,
  module_id TEXT NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  challenge_type TEXT NOT NULL CHECK (challenge_type IN (
    'write-code', 'code-completion', 'find-bug', 'predict-output', 'multiple-choice', 'order-steps', 'match-concepts'
  )),
  instructions TEXT NOT NULL,
  objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
  starter_html TEXT NOT NULL DEFAULT '',
  starter_css TEXT NOT NULL DEFAULT '',
  starter_js TEXT NOT NULL DEFAULT '',
  solution_html TEXT NOT NULL DEFAULT '',
  solution_css TEXT NOT NULL DEFAULT '',
  solution_js TEXT NOT NULL DEFAULT '',
  hints JSONB NOT NULL DEFAULT '[]'::jsonb,
  explanation TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 75 CHECK (xp_reward >= 0),
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exercises_module_id ON public.exercises(module_id);

CREATE TABLE IF NOT EXISTS public.exercise_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id TEXT NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  description TEXT NOT NULL,
  assertion_type TEXT NOT NULL CHECK (assertion_type IN ('dom-exists', 'dom-text', 'css-contains', 'js-eval', 'html-regex')),
  assertion_target TEXT NOT NULL,
  expected_value TEXT NOT NULL,
  failure_feedback TEXT NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4. QUIZZES & ASSESSMENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quizzes (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  passing_score_percent INTEGER NOT NULL DEFAULT 70 CHECK (passing_score_percent BETWEEN 50 AND 100),
  xp_reward INTEGER NOT NULL DEFAULT 100 CHECK (xp_reward >= 0),
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple-choice', 'true-false', 'output-prediction')),
  prompt TEXT NOT NULL,
  code_snippet TEXT DEFAULT NULL,
  options JSONB NOT NULL,
  correct_option_index INTEGER NOT NULL,
  explanation TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score_percent INTEGER NOT NULL CHECK (score_percent BETWEEN 0 AND 100),
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);

-- ------------------------------------------------------------------------------
-- 5. PROJECTS & MILESTONES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  learning_path_id TEXT NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  description TEXT NOT NULL,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  learning_outcomes JSONB NOT NULL DEFAULT '[]'::jsonb,
  starter_html TEXT NOT NULL DEFAULT '',
  starter_css TEXT NOT NULL DEFAULT '',
  starter_js TEXT NOT NULL DEFAULT '',
  submission_checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  reflection_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  xp_reward INTEGER NOT NULL DEFAULT 250 CHECK (xp_reward >= 0),
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_milestones (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6. USER PROGRESS, GAMIFICATION, WORKSPACES & NOTES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_path_id TEXT REFERENCES public.learning_paths(id) ON DELETE SET NULL,
  current_lesson_id TEXT REFERENCES public.lessons(id) ON DELETE SET NULL,
  total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  current_streak_days INTEGER NOT NULL DEFAULT 0 CHECK (current_streak_days >= 0),
  longest_streak_days INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak_days >= 0),
  last_active_date DATE DEFAULT NULL,
  total_minutes_learned INTEGER NOT NULL DEFAULT 0 CHECK (total_minutes_learned >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  completed_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ DEFAULT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user ON public.user_lesson_progress(user_id);

CREATE TABLE IF NOT EXISTS public.user_exercise_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  submitted_html TEXT NOT NULL DEFAULT '',
  submitted_css TEXT NOT NULL DEFAULT '',
  submitted_js TEXT NOT NULL DEFAULT '',
  passed BOOLEAN NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, exercise_id)
);

CREATE TABLE IF NOT EXISTS public.user_project_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  html_code TEXT NOT NULL DEFAULT '',
  css_code TEXT NOT NULL DEFAULT '',
  js_code TEXT NOT NULL DEFAULT '',
  completed_milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  reflection_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  completed_at TIMESTAMPTZ DEFAULT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, project_id)
);

CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  criteria_type TEXT NOT NULL,
  criteria_value INTEGER NOT NULL DEFAULT 1,
  xp_bonus INTEGER NOT NULL DEFAULT 50
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  source_type TEXT NOT NULL CHECK (source_type IN ('lesson', 'exercise', 'quiz', 'project', 'achievement')),
  source_id TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_transactions_user ON public.xp_transactions(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  minutes_spent INTEGER NOT NULL DEFAULT 0 CHECK (minutes_spent >= 0),
  activity_type TEXT NOT NULL DEFAULT 'lesson',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_date ON public.learning_sessions(user_id, session_date);

CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.saved_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 80),
  html_code TEXT NOT NULL DEFAULT '',
  css_code TEXT NOT NULL DEFAULT '',
  js_code TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_workspaces_user ON public.saved_workspaces(user_id);

CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. AUTOMATIC PROFILE CREATION TRIGGER ON SUPABASE AUTH SIGNUP
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  generated_username TEXT;
BEGIN
  generated_username := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'username'), ''),
    'learner_' || SUBSTRING(REPLACE(NEW.id::TEXT, '-', '') FROM 1 FOR 8)
  );

  INSERT INTO public.profiles (id, username, full_name, role_id, email_verified)
  VALUES (
    NEW.id,
    generated_username,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    1,
    COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE)
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_progress (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
