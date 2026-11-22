-- ==============================================================================
-- LUDEK TECH HUB — SEED DATA
-- Seeds baseline roles, achievements, and sample announcements.
-- To promote a registered user to admin securely via Supabase SQL Editor:
--   UPDATE public.profiles SET role_id = 3 WHERE id = '<USER_UUID>';
-- Never hardcode admin passwords in SQL or client files.
-- ==============================================================================

INSERT INTO public.roles (id, name, description) VALUES
  (1, 'student', 'Standard learner account with access to published curriculum, labs, and personal progress.'),
  (2, 'instructor', 'Can review learner analytics and draft curriculum updates.'),
  (3, 'admin', 'Full platform administrator with content publishing and user role management access.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.achievements (id, title, description, criteria_type, criteria_value, xp_bonus) VALUES
  ('first_lesson', 'First Step Forward', 'Complete your first interactive lesson in Ludek Tech Hub.', 'lessons_completed', 1, 50),
  ('first_code_run', 'Hello Sandbox', 'Execute live HTML, CSS, or JavaScript inside the Code Lab.', 'code_runs', 1, 30),
  ('first_challenge', 'Problem Solver', 'Pass validation on your first guided coding exercise.', 'exercises_passed', 1, 75),
  ('quiz_master', 'Verified Understanding', 'Score 80% or higher on a module assessment.', 'quizzes_passed', 1, 100),
  ('html_foundations', 'Structure Architect', 'Complete all lessons in Path 1: HTML Foundations.', 'path_html_completed', 1, 200),
  ('css_foundations', 'Layout Craftsperson', 'Complete all lessons in Path 2: CSS Foundations.', 'path_css_completed', 1, 200),
  ('first_js_function', 'Logic Builder', 'Complete a JavaScript functions or DOM challenge.', 'js_exercises_passed', 1, 100),
  ('first_project', 'Real Builder', 'Complete and submit your first portfolio project.', 'projects_completed', 1, 250),
  ('streak_seven', 'Seven-Day Momentum', 'Maintain a verified 7-day learning streak.', 'streak_days', 7, 300),
  ('debugging_specialist', 'Debugging Specialist', 'Solve 5 coding exercises across any learning path.', 'exercises_passed', 5, 150)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.announcements (title, body, published) VALUES
  (
    'Welcome to Ludek Tech Hub',
    'Start at Path 0 if you have never written code before, or use Break It Down mode inside any lesson to step through concepts one sentence at a time.',
    TRUE
  ),
  (
    'Interactive Networking & Git Simulators Live',
    'Explore the 11-stage URL-to-Website lifecycle simulator, HTTP Request Builder, and live Git repository playground under Visualizers.',
    TRUE
  )
ON CONFLICT DO NOTHING;
