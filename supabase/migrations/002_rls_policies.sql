-- ==============================================================================
-- LUDEK TECH HUB — 002 ROW LEVEL SECURITY (RLS) & ROLE AUTHORIZATION
-- ==============================================================================

-- Helper function: securely determine whether authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.roles r ON r.id = p.role_id
    WHERE p.id = auth.uid()
      AND r.name = 'admin'
  );
$$;

-- Enable RLS across all tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exercise_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_project_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- ROLES & PROFILES
-- ------------------------------------------------------------------------------
CREATE POLICY "Roles readable by authenticated users"
  ON public.roles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can read own profile or admins read all"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own non-privileged profile fields"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role_id = (SELECT role_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update any profile including roles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- PUBLISHED CURRICULUM (Publicly readable when published; Admin full control)
-- ------------------------------------------------------------------------------
CREATE POLICY "Published learning paths readable"
  ON public.learning_paths FOR SELECT
  USING (published = TRUE OR public.is_admin());

CREATE POLICY "Admins manage learning paths"
  ON public.learning_paths FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Published courses readable"
  ON public.courses FOR SELECT
  USING (published = TRUE OR public.is_admin());

CREATE POLICY "Admins manage courses"
  ON public.courses FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Published modules readable"
  ON public.modules FOR SELECT
  USING (published = TRUE OR public.is_admin());

CREATE POLICY "Admins manage modules"
  ON public.modules FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Published lessons readable"
  ON public.lessons FOR SELECT
  USING (published = TRUE OR public.is_admin());

CREATE POLICY "Admins manage lessons"
  ON public.lessons FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lesson steps readable for published lessons"
  ON public.lesson_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      WHERE l.id = lesson_id AND (l.published = TRUE OR public.is_admin())
    )
  );

CREATE POLICY "Admins manage lesson steps"
  ON public.lesson_steps FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Published exercises readable"
  ON public.exercises FOR SELECT
  USING (published = TRUE OR public.is_admin());

CREATE POLICY "Admins manage exercises"
  ON public.exercises FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Exercise tests readable"
  ON public.exercise_tests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.exercises e
      WHERE e.id = exercise_id AND (e.published = TRUE OR public.is_admin())
    )
  );

CREATE POLICY "Admins manage exercise tests"
  ON public.exercise_tests FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Published quizzes readable"
  ON public.quizzes FOR SELECT
  USING (published = TRUE OR public.is_admin());

CREATE POLICY "Admins manage quizzes"
  ON public.quizzes FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Published quiz questions readable"
  ON public.quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_id AND (q.published = TRUE OR public.is_admin())
    )
  );

CREATE POLICY "Admins manage quiz questions"
  ON public.quiz_questions FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Published projects readable"
  ON public.projects FOR SELECT
  USING (published = TRUE OR public.is_admin());

CREATE POLICY "Admins manage projects"
  ON public.projects FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Project milestones readable"
  ON public.project_milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND (p.published = TRUE OR public.is_admin())
    )
  );

CREATE POLICY "Admins manage project milestones"
  ON public.project_milestones FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Achievements catalog readable"
  ON public.achievements FOR SELECT USING (TRUE);

CREATE POLICY "Admins manage achievements"
  ON public.achievements FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Published announcements readable"
  ON public.announcements FOR SELECT
  USING (published = TRUE OR public.is_admin());

CREATE POLICY "Admins manage announcements"
  ON public.announcements FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- PRIVATE USER DATA (Strict Ownership + Admin Read Analytics)
-- ------------------------------------------------------------------------------
CREATE POLICY "Own user_progress access"
  ON public.user_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins read user_progress"
  ON public.user_progress FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Own lesson progress access"
  ON public.user_lesson_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins read lesson progress"
  ON public.user_lesson_progress FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Own exercise submissions access"
  ON public.user_exercise_submissions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Own quiz attempts access"
  ON public.quiz_attempts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Own project progress access"
  ON public.user_project_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Own achievements access"
  ON public.user_achievements FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Own XP transactions access"
  ON public.xp_transactions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Own learning sessions access"
  ON public.learning_sessions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Own bookmarks access"
  ON public.bookmarks FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Own notes access"
  ON public.notes FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Own saved workspaces access"
  ON public.saved_workspaces FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
