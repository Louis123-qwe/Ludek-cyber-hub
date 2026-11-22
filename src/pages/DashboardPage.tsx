import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, BookOpen, Clock, Flame, FolderGit2, Target, Trophy } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Button, ProgressBar, SurfaceCard } from '../components/ui/DesignSystem';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { ACHIEVEMENTS_CATALOG } from '../data/achievements';
import { LEARNING_PATHS, getAllLessons, getLessonEntryById } from '../data/curriculum';
import { PROJECTS_DATA } from '../data/projects';

export function DashboardPage() {
  const { user } = useAuth();
  const { progress, announcements, publishOverrides } = useProgress();

  const visiblePaths = LEARNING_PATHS.filter((p) => publishOverrides[p.id] ?? p.published);
  const visiblePathIds = new Set(visiblePaths.map((p) => p.id));
  const allLessons = getAllLessons().filter((entry) => visiblePathIds.has(entry.path.id));
  const completedLessonsList = allLessons.filter(
    (item) => progress.lessonProgress[item.lesson.id]?.status === 'completed'
  );
  const completedCount = completedLessonsList.length;
  const totalLessonsCount = allLessons.length;
  const overallPercent = totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;

  const activeEntry =
    getLessonEntryById(progress.currentLessonId) || allLessons[0];
  const currentLevel = Math.floor(progress.totalXp / 250) + 1;
  const xpIntoLevel = progress.totalXp % 250;

  // Compute recommended next uncompleted lessons
  const upcomingLessons = allLessons
    .filter((entry) => progress.lessonProgress[entry.lesson.id]?.status !== 'completed')
    .slice(0, 4);

  // Compute last 7 days learning session minutes strictly from real logged sessions
  const last7Days = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const session = progress.learningSessions.find((s) => s.date === iso);
    return { date: iso, label, minutes: session?.minutesSpent || 0 };
  });
  const maxWeeklyMinutes = Math.max(user?.dailyGoalMinutes || 30, ...last7Days.map((d) => d.minutes));

  const completedProjectsCount = Object.values(progress.projectProgress).filter(
    (p) => p.status === 'completed'
  ).length;
  const passedExercisesCount = Object.values(progress.exerciseSubmissions).filter((e) => e.passed).length;

  const isBrandNewUser =
    completedCount === 0 && passedExercisesCount === 0 && progress.totalXp === 0;

  return (
    <AppShell
      breadcrumbs={[{ label: 'Dashboard' }]}
      actions={
        <Link to={`/learn/${activeEntry.lesson.id}`}>
          <Button size="sm" variant="primary">
            <span>{isBrandNewUser ? 'Start Lesson 1' : 'Continue Learning'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Welcome & Continue Hero */}
        <SurfaceCard className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-medium text-blue-600 dark:text-cyan-400">
                Level {currentLevel} · {xpIntoLevel}/250 XP to Level {currentLevel + 1}
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Welcome{user ? `, ${user.fullName || user.username}` : ' to Ludek Tech Hub'}
              </h1>
              {isBrandNewUser ? (
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  You are starting from a clean slate—no fake stats, every milestone ahead is yours to earn. Begin with Path 0 and toggle Break It Down whenever you want concepts explained one step at a time.
                </p>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Current focus: <strong>{activeEntry.path.title}</strong> · {activeEntry.module.title} · {activeEntry.lesson.title}
                </p>
              )}
            </div>

            <div className="w-full lg:w-72 space-y-3">
              <ProgressBar
                value={completedCount}
                max={totalLessonsCount}
                label={`Overall Curriculum (${completedCount}/${totalLessonsCount} lessons)`}
              />
              <Link to={`/learn/${activeEntry.lesson.id}`} className="block">
                <Button className="w-full">
                  <span>{isBrandNewUser ? 'Begin Path 0: Fundamentals' : `Resume: ${activeEntry.lesson.title}`}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </SurfaceCard>

        {/* Real Calculated KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SurfaceCard className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Total XP</span>
              <Trophy className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold font-mono tabular-nums">{progress.totalXp}</p>
            <p className="text-xs text-slate-500">Overall: {overallPercent}%</p>
          </SurfaceCard>

          <SurfaceCard className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Learning Streak</span>
              <Flame className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold font-mono tabular-nums">{progress.currentStreakDays} days</p>
            <p className="text-xs text-slate-500">Longest: {progress.longestStreakDays} days</p>
          </SurfaceCard>

          <SurfaceCard className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Active Study Time</span>
              <Clock className="h-4 w-4 text-cyan-500" />
            </div>
            <p className="text-2xl font-bold font-mono tabular-nums">{progress.totalMinutesLearned} min</p>
            <p className="text-xs text-slate-500">Goal: {user?.dailyGoalMinutes || 30} min/day</p>
          </SurfaceCard>

          <SurfaceCard className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Projects &amp; Exercises</span>
              <FolderGit2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold font-mono tabular-nums">
              {completedProjectsCount}/{PROJECTS_DATA.length}
            </p>
            <p className="text-xs text-slate-500">{passedExercisesCount} challenges solved</p>
          </SurfaceCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Skill Mastery Per Path + Weekly Activity */}
          <div className="lg:col-span-7 space-y-6">
            <SurfaceCard className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Skill Progression by Learning Path</h2>
                <Link to="/curriculum" className="text-xs text-blue-600 dark:text-cyan-400 hover:underline">
                  All Paths
                </Link>
              </div>
              <div className="space-y-3.5">
                {visiblePaths.map((path) => {
                  const pathLessons = path.courses.flatMap((c) => c.modules.flatMap((m) => m.lessons));
                  const doneInPath = pathLessons.filter(
                    (l) => progress.lessonProgress[l.id]?.status === 'completed'
                  ).length;
                  return (
                    <ProgressBar
                      key={path.id}
                      value={doneInPath}
                      max={pathLessons.length || 1}
                      label={`${path.title} (${doneInPath}/${pathLessons.length})`}
                    />
                  );
                })}
              </div>
            </SurfaceCard>

            <SurfaceCard className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Weekly Study Activity (Real Logged Minutes)</h2>
                <span className="text-xs text-slate-500 font-mono tabular-nums">
                  Goal: {user?.dailyGoalMinutes || 30}m/day
                </span>
              </div>
              <div className="grid grid-cols-7 gap-2 items-end h-36 pt-4">
                {last7Days.map((day) => {
                  const heightPct = Math.round((day.minutes / maxWeeklyMinutes) * 100);
                  return (
                    <div key={day.date} className="flex flex-col items-center gap-1.5 h-full justify-end">
                      <span className="text-[11px] font-mono tabular-nums text-slate-500">
                        {day.minutes}m
                      </span>
                      <div className="w-full max-w-[32px] flex-1 flex items-end bg-slate-100 dark:bg-slate-800/70 rounded-md overflow-hidden">
                        <div
                          className="w-full bg-blue-600 dark:bg-cyan-500 rounded-t-md transition-all"
                          style={{ height: `${Math.max(day.minutes > 0 ? 12 : 4, heightPct)}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-500">{day.label}</span>
                    </div>
                  );
                })}
              </div>
            </SurfaceCard>
          </div>

          {/* Upcoming Lessons, Recent XP, Announcements & Achievements */}
          <div className="lg:col-span-5 space-y-6">
            <SurfaceCard className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                <h2 className="text-base font-semibold">Learning Goal &amp; Next Lessons</h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Goal: {user?.learningGoal || 'Master front-end fundamentals and build a portfolio.'}
              </p>
              <div className="space-y-2 pt-1">
                {upcomingLessons.map((item) => (
                  <Link
                    key={item.lesson.id}
                    to={`/learn/${item.lesson.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-xs hover:border-blue-500/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {item.lesson.title}
                      </p>
                      <p className="text-slate-500 truncate">{item.path.title}</p>
                    </div>
                    <BookOpen className="h-4 w-4 text-slate-400 shrink-0" />
                  </Link>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  <h2 className="text-base font-semibold">Achievements</h2>
                </div>
                <span className="text-xs font-mono tabular-nums text-slate-500">
                  {progress.unlockedAchievements.length}/{ACHIEVEMENTS_CATALOG.length}
                </span>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {ACHIEVEMENTS_CATALOG.map((ach) => {
                  const unlocked = progress.unlockedAchievements.some((u) => u.achievementId === ach.id);
                  return (
                    <div
                      key={ach.id}
                      className={`rounded-lg border px-3 py-2 text-xs ${
                        unlocked
                          ? 'border-emerald-500/40 bg-emerald-500/10'
                          : 'border-slate-200 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between font-medium">
                        <span>{ach.title}</span>
                        <span className="font-mono tabular-nums">{unlocked ? 'Unlocked' : `+${ach.xpBonus} XP`}</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">{ach.description}</p>
                    </div>
                  );
                })}
              </div>
            </SurfaceCard>

            <SurfaceCard className="p-5 space-y-3">
              <h2 className="text-base font-semibold">Recent Activity &amp; Announcements</h2>
              {progress.xpTransactions.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No activity recorded yet. Complete a lesson or run your first exercise to start your log.
                </p>
              ) : (
                <ul className="space-y-2 text-xs">
                  {progress.xpTransactions.slice(0, 4).map((tx) => (
                    <li key={tx.id} className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/70 pb-1.5">
                      <span className="truncate text-slate-700 dark:text-slate-300">{tx.description}</span>
                      <span className="font-mono tabular-nums text-emerald-500 shrink-0">+{tx.amount} XP</span>
                    </li>
                  ))}
                </ul>
              )}
              {announcements.filter((a) => a.published).slice(0, 2).map((ann) => (
                <div key={ann.id} className="rounded-lg bg-slate-100 dark:bg-[#0D1017] p-3 text-xs">
                  <p className="font-semibold text-slate-900 dark:text-white">{ann.title}</p>
                  <p className="mt-1 text-slate-600 dark:text-slate-400">{ann.body}</p>
                </div>
              ))}
            </SurfaceCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
