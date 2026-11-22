import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ChevronRight, ClipboardCheck, Code2, PlayCircle } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { ProgressBar, SurfaceCard } from '../components/ui/DesignSystem';
import { useProgress } from '../contexts/ProgressContext';
import { LEARNING_PATHS } from '../data/curriculum';

export function CurriculumPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPath = searchParams.get('path') || 'all';
  const [selectedPathId, setSelectedPathId] = useState(initialPath);
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Beginner' | 'Intermediate' | 'Advanced'>('all');

  const { progress, publishOverrides } = useProgress();

  const visiblePaths = useMemo(() => {
    return LEARNING_PATHS.filter((p) => {
      const isPublished = publishOverrides[p.id] ?? p.published;
      if (!isPublished) return false;
      if (selectedPathId !== 'all' && p.id !== selectedPathId) return false;
      if (difficultyFilter !== 'all' && p.difficulty !== difficultyFilter) return false;
      return true;
    });
  }, [selectedPathId, difficultyFilter, publishOverrides]);

  return (
    <AppShell breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Curriculum' }]}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              Front-End Engineering Curriculum
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Nine progressive learning paths taking you from zero coding experience to production-ready front-end development.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              aria-label="Filter by learning path"
              value={selectedPathId}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedPathId(val);
                if (val === 'all') searchParams.delete('path');
                else searchParams.set('path', val);
                setSearchParams(searchParams);
              }}
              className="min-h-[40px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#11151E] px-3 text-xs"
            >
              <option value="all">All 9 Learning Paths</option>
              {LEARNING_PATHS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>

            <div className="flex items-center rounded-lg bg-slate-200/70 dark:bg-[#11151E] border border-slate-200 dark:border-slate-800 p-0.5 text-xs">
              {(['all', 'Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap ${
                    difficultyFilter === diff
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {diff === 'all' ? 'All Levels' : diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {visiblePaths.map((path) => {
            const pathLessons = path.courses.flatMap((c) => c.modules.flatMap((m) => m.lessons));
            const completedInPath = pathLessons.filter(
              (l) => progress.lessonProgress[l.id]?.status === 'completed'
            ).length;

            return (
              <SurfaceCard key={path.id} className="p-5 sm:p-6 space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      <span>{path.subtitle}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{path.difficulty}</span>
                      <span aria-hidden="true"> · </span>
                      <span className="font-mono tabular-nums">{path.estimatedHours} hrs</span>
                    </p>
                    <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                      {path.title}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
                      {path.description}
                    </p>
                  </div>
                  <div className="w-full md:w-56 shrink-0">
                    <ProgressBar
                      value={completedInPath}
                      max={pathLessons.length || 1}
                      label={`${completedInPath}/${pathLessons.length} lessons`}
                    />
                  </div>
                </div>

                {path.courses.map((course) => (
                  <div key={course.id} className="space-y-4">
                    {course.modules.map((mod) => (
                      <div
                        key={mod.id}
                        className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0D1017] p-4 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                              {mod.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{mod.summary}</p>
                          </div>
                          {mod.quiz && (
                            <Link
                              to={`/assessments/${mod.quiz.id}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-medium hover:border-blue-500 transition-colors"
                            >
                              <ClipboardCheck className="h-3.5 w-3.5 text-blue-500" />
                              <span>Module Assessment</span>
                            </Link>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {mod.lessons.map((lesson) => {
                            const done = progress.lessonProgress[lesson.id]?.status === 'completed';
                            return (
                              <Link
                                key={lesson.id}
                                to={`/learn/${lesson.id}`}
                                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11151E] px-3.5 py-2.5 hover:border-blue-500/60 transition-colors"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {done ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                  ) : (
                                    <PlayCircle className="h-4 w-4 text-blue-500 shrink-0" />
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                                      {lesson.title}
                                    </p>
                                    <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                                      {lesson.durationMinutes} min · +{lesson.xpReward} XP
                                    </p>
                                  </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                              </Link>
                            );
                          })}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                          <Code2 className="h-3.5 w-3.5" />
                          <span>
                            {mod.exercises.length} exercises (
                            {mod.exercises.filter((e) => progress.exerciseSubmissions[e.id]?.passed).length} passed)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </SurfaceCard>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
