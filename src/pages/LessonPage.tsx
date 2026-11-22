import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  ClipboardCheck,
  Layers,
  StickyNote,
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { BreakItDownPlayer } from '../components/lesson/BreakItDownPlayer';
import { LessonRenderer } from '../components/lesson/LessonRenderer';
import { AskYourTutorPanel } from '../components/lesson/AskYourTutorPanel';
import { ExerciseRunner } from '../components/lab/ExerciseRunner';
import { Button, SurfaceCard } from '../components/ui/DesignSystem';
import { useToast } from '../components/ui/ToastContext';
import { useProgress } from '../contexts/ProgressContext';
import { useAuth } from '../contexts/AuthContext';
import { getExerciseById, getLessonEntryById, getLessonNeighbors } from '../data/curriculum';

export function LessonPage() {
  const { lessonId = 'lesson-0-1-1' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const {
    progress,
    markStepCompleted,
    completeLesson,
    toggleBookmark,
    saveNote,
    setActiveLesson,
    logLearningMinutes,
  } = useProgress();

  const entry = getLessonEntryById(lessonId);
  const { prev, next } = getLessonNeighbors(lessonId);

  const [breakItDownOpen, setBreakItDownOpen] = useState(
    (user?.preferredPace || 'slow') === 'slow'
  );
  const [noteDraft, setNoteDraft] = useState(progress.notes[lessonId] || '');

  useEffect(() => {
    setNoteDraft(progress.notes[lessonId] || '');
    if (entry) {
      setActiveLesson(entry.path.id, entry.lesson.id);
    }
  }, [lessonId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track real active study minutes every 60 seconds spent in a lesson
  useEffect(() => {
    const timer = window.setInterval(() => {
      logLearningMinutes(1);
    }, 60000);
    return () => window.clearInterval(timer);
  }, [logLearningMinutes]);

  if (!entry) {
    return (
      <AppShell breadcrumbs={[{ label: 'Curriculum', to: '/curriculum' }, { label: 'Not Found' }]}>
        <SurfaceCard className="p-8 text-center space-y-4">
          <h1 className="text-xl font-bold">Lesson Not Found</h1>
          <p className="text-sm text-slate-500">That lesson ID does not exist in the curriculum.</p>
          <Link to="/curriculum">
            <Button>Return to Curriculum</Button>
          </Link>
        </SurfaceCard>
      </AppShell>
    );
  }

  const { lesson, module, path } = entry;
  const lessonProg = progress.lessonProgress[lesson.id];
  const isCompleted = lessonProg?.status === 'completed';
  const isBookmarked = progress.bookmarks.includes(lesson.id);
  const primaryExercise = lesson.exerciseId ? getExerciseById(lesson.exerciseId)?.exercise : undefined;
  const extraModuleExercises = module.exercises.filter((e) => e.id !== lesson.exerciseId);

  const handleComplete = () => {
    const unlocked = completeLesson(lesson.id, path.id, lesson.xpReward);
    showToast({
      title: isCompleted ? 'Lesson Already Completed' : `Lesson Completed (+${lesson.xpReward} XP)`,
      description: unlocked.length > 0 ? `Achievement Unlocked: ${unlocked.join(', ')}` : lesson.title,
      variant: 'success',
    });
  };

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Curriculum', to: '/curriculum' },
        { label: path.title, to: `/curriculum?path=${path.id}` },
        { label: lesson.title },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setBreakItDownOpen((v) => !v)}
          >
            <Layers className="h-3.5 w-3.5 text-blue-500" />
            <span className="hidden sm:inline">{breakItDownOpen ? 'Hide Break It Down' : 'Break It Down'}</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => toggleBookmark(lesson.id)}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark lesson'}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-blue-500 text-blue-500' : ''}`} />
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Main Lesson Column */}
        <div className="xl:col-span-8 space-y-6 min-w-0">
          {/* Header & Objectives */}
          <SurfaceCard className="p-6 space-y-5">
            <div className="space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span>{module.title}</span>
                <span aria-hidden="true"> · </span>
                <span className="font-mono tabular-nums">{lesson.durationMinutes} min</span>
                <span aria-hidden="true"> · </span>
                <span className="font-mono tabular-nums">+{lesson.xpReward} XP</span>
                {isCompleted && (
                  <>
                    <span aria-hidden="true"> · </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Completed</span>
                  </>
                )}
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {lesson.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {lesson.intro}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-200 mb-2">
                  Learning Objectives
                </h2>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  {lesson.objectives.map((obj) => (
                    <li key={obj} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-200 mb-2">
                  Prerequisites
                </h2>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  {lesson.prerequisites.map((pre) => (
                    <li key={pre}>· {pre}</li>
                  ))}
                </ul>
              </div>
            </div>
          </SurfaceCard>

          {/* Glossary Terms for First-Time Beginners */}
          {lesson.glossaryTerms && lesson.glossaryTerms.length > 0 && (
            <SurfaceCard className="p-5 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Key Terms in Plain Language
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {lesson.glossaryTerms.map((g) => (
                  <div
                    key={g.term}
                    className="rounded-lg bg-slate-50 dark:bg-[#0D1017] border border-slate-200 dark:border-slate-800 p-3"
                  >
                    <p className="text-xs font-semibold text-blue-600 dark:text-cyan-400">{g.term}</p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {g.plainDefinition}
                    </p>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          )}

          {/* BREAK IT DOWN Slow Learning Mode */}
          {breakItDownOpen && lesson.breakItDownSteps.length > 0 && (
            <BreakItDownPlayer
              key={lesson.id}
              steps={lesson.breakItDownSteps}
              completedStepNumbers={lessonProg?.completedSteps || []}
              onStepCompleted={(num) => markStepCompleted(lesson.id, num)}
              defaultDepth={user?.preferredPace === 'accelerated' ? 'deeper' : 'beginner'}
            />
          )}

          {/* Data-Driven Lesson Content + Visualizers */}
          <LessonRenderer blocks={lesson.contentBlocks} />

          {/* Primary Guided Exercise */}
          {primaryExercise && <ExerciseRunner key={primaryExercise.id} exercise={primaryExercise} />}

          {/* Additional Module Challenges */}
          {extraModuleExercises.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                More Module Practice Challenges
              </h2>
              {extraModuleExercises.map((ex) => (
                <ExerciseRunner key={ex.id} exercise={ex} />
              ))}
            </div>
          )}

          {/* Common Mistakes */}
          {lesson.commonMistakes.length > 0 && (
            <SurfaceCard className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                <h2 className="text-base font-semibold">Common Beginner Mistakes &amp; Fixes</h2>
              </div>
              <div className="space-y-3">
                {lesson.commonMistakes.map((m) => (
                  <div
                    key={m.mistake}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0D1017] p-4 text-xs space-y-1.5"
                  >
                    <p className="font-semibold text-slate-900 dark:text-white">{m.mistake}</p>
                    <p className="text-slate-600 dark:text-slate-400">
                      <strong>Why it happens:</strong> {m.whyItHappens}
                    </p>
                    <p className="text-emerald-700 dark:text-emerald-400">
                      <strong>Fix:</strong> {m.fix}
                    </p>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          )}

          {/* Summary & Takeaways */}
          <SurfaceCard className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Lesson Summary &amp; Key Takeaways
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-300">{lesson.summary}</p>
            <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
              {lesson.keyTakeaways.map((tk) => (
                <li key={tk} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{tk}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <Button variant={isCompleted ? 'secondary' : 'primary'} onClick={handleComplete}>
                <CheckCircle2 className="h-4 w-4" />
                <span>{isCompleted ? 'Completed' : `Mark Lesson Complete (+${lesson.xpReward} XP)`}</span>
              </Button>

              {module.quiz && (
                <Link to={`/assessments/${module.quiz.id}`}>
                  <Button variant="secondary">
                    <ClipboardCheck className="h-4 w-4 text-blue-500" />
                    <span>Take Module Quiz</span>
                  </Button>
                </Link>
              )}
            </div>
          </SurfaceCard>

          {/* Prev / Next Lesson */}
          <div className="flex items-center justify-between gap-4 pt-2">
            {prev ? (
              <Button variant="secondary" onClick={() => navigate(`/learn/${prev.lesson.id}`)}>
                <ArrowLeft className="h-4 w-4" />
                <span className="truncate max-w-[180px] sm:max-w-xs">{prev.lesson.title}</span>
              </Button>
            ) : (
              <div />
            )}
            {next && (
              <Button variant="primary" onClick={() => navigate(`/learn/${next.lesson.id}`)}>
                <span className="truncate max-w-[180px] sm:max-w-xs">Next: {next.lesson.title}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Right Companion Column: Ask Your Tutor + Personal Notes + Module Syllabus */}
        <div className="xl:col-span-4 space-y-6 xl:sticky xl:top-20">
          <AskYourTutorPanel lesson={lesson} exercise={primaryExercise} />

          <SurfaceCard className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-blue-500" />
                <h3 className="text-sm font-semibold">My Lesson Notes</h3>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  saveNote(lesson.id, noteDraft);
                  showToast({ title: 'Notes saved', variant: 'success' });
                }}
              >
                Save Note
              </Button>
            </div>
            <textarea
              rows={4}
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Write personal reminders or questions for this lesson..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0D1017] p-3 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
            />
          </SurfaceCard>

          <SurfaceCard className="p-5 space-y-3">
            <h3 className="text-sm font-semibold">Module Syllabus</h3>
            <div className="space-y-1.5">
              {module.lessons.map((l) => {
                const active = l.id === lesson.id;
                const done = progress.lessonProgress[l.id]?.status === 'completed';
                return (
                  <Link
                    key={l.id}
                    to={`/learn/${l.id}`}
                    className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs ${
                      active
                        ? 'bg-blue-600/15 text-blue-600 dark:text-cyan-400 font-semibold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="truncate">{l.title}</span>
                    {done && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                  </Link>
                );
              })}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </AppShell>
  );
}
