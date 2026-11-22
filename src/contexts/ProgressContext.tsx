import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { ACHIEVEMENTS_CATALOG } from '../data/achievements';
import { getAllLessons } from '../data/curriculum';
import {
  computeStreakOnActivity,
  createEmptyProgressBundle,
  evaluateNewAchievements,
  getLocalProgress,
  getTodayIsoDate,
  loadAnnouncements,
  loadPublishOverrides,
  saveAnnouncements,
  saveLocalProgress,
  savePublishOverrides,
} from '../lib/storage';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type {
  AnnouncementRecord,
  ProjectProgressRecord,
  SavedWorkspaceRecord,
  UserProgressBundle,
} from '../types/curriculum';

interface ProgressContextValue {
  progress: UserProgressBundle;
  announcements: AnnouncementRecord[];
  publishOverrides: Record<string, boolean>;
  markStepCompleted: (lessonId: string, stepNumber: number) => void;
  completeLesson: (lessonId: string, pathId: string, xpReward: number) => string[];
  recordCodeRun: () => string[];
  recordExerciseAttempt: (params: {
    exerciseId: string;
    html: string;
    css: string;
    js: string;
    passed: boolean;
    xpReward: number;
  }) => string[];
  recordQuizAttempt: (params: {
    quizId: string;
    scorePercent: number;
    passed: boolean;
    answers: Record<string, number>;
    xpReward: number;
  }) => string[];
  saveProjectProgress: (record: ProjectProgressRecord, markCompleteXp?: number) => string[];
  logLearningMinutes: (minutes: number) => void;
  toggleBookmark: (lessonId: string) => void;
  saveNote: (lessonId: string, content: string) => void;
  saveWorkspace: (workspace: Omit<SavedWorkspaceRecord, 'id' | 'updatedAt'> & { id?: string }) => SavedWorkspaceRecord;
  deleteWorkspace: (workspaceId: string) => void;
  setActiveLesson: (pathId: string, lessonId: string) => void;
  // Admin management helpers
  updateAnnouncementsList: (next: AnnouncementRecord[]) => void;
  toggleEntityPublish: (entityId: string, published: boolean) => void;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

function applyAchievementsAndSave(
  userId: string | undefined,
  nextBundle: UserProgressBundle
): { finalBundle: UserProgressBundle; unlockedTitles: string[] } {
  const newIds = evaluateNewAchievements(nextBundle);
  const unlockedTitles: string[] = [];
  if (newIds.length > 0) {
    const now = new Date().toISOString();
    let bonusXp = 0;
    const newRecords = [...nextBundle.unlockedAchievements];
    const newTx = [...nextBundle.xpTransactions];
    for (const id of newIds) {
      const def = ACHIEVEMENTS_CATALOG.find((a) => a.id === id);
      if (def) {
        unlockedTitles.push(def.title);
        bonusXp += def.xpBonus;
        newRecords.push({ achievementId: id, unlockedAt: now });
        newTx.unshift({
          id: crypto.randomUUID(),
          amount: def.xpBonus,
          sourceType: 'achievement',
          sourceId: id,
          description: `Achievement unlocked: ${def.title}`,
          createdAt: now,
        });
      }
    }
    nextBundle = {
      ...nextBundle,
      totalXp: nextBundle.totalXp + bonusXp,
      unlockedAchievements: newRecords,
      xpTransactions: newTx.slice(0, 60),
    };
  }

  const storageKey = userId || 'guest';
  saveLocalProgress(storageKey, nextBundle);
  return { finalBundle: nextBundle, unlockedTitles };
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const storageKey = user?.id || 'guest';

  const [progress, setProgress] = useState<UserProgressBundle>(() => getLocalProgress(storageKey));
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>(() => loadAnnouncements());
  const [publishOverrides, setPublishOverrides] = useState<Record<string, boolean>>(() => loadPublishOverrides());

  useEffect(() => {
    setProgress(getLocalProgress(storageKey));

    if (isSupabaseConfigured && supabase && user) {
      // Hydrate from Supabase tables when user is signed in
      (async () => {
        const [{ data: up }, { data: lp }, { data: ws }] = await Promise.all([
          supabase.from('user_progress').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('user_lesson_progress').select('*').eq('user_id', user.id),
          supabase.from('saved_workspaces').select('*').eq('user_id', user.id),
        ]);
        if (up) {
          setProgress((prev) => {
            const mergedLessons = { ...prev.lessonProgress };
            if (Array.isArray(lp)) {
              for (const row of lp) {
                mergedLessons[row.lesson_id] = {
                  lessonId: row.lesson_id,
                  status: row.status,
                  completedSteps: Array.isArray(row.completed_steps) ? row.completed_steps : [],
                  completedAt: row.completed_at || undefined,
                  updatedAt: row.updated_at,
                };
              }
            }
            const mergedWorkspaces: SavedWorkspaceRecord[] = Array.isArray(ws)
              ? ws.map((w) => ({
                  id: w.id,
                  title: w.title,
                  htmlCode: w.html_code,
                  cssCode: w.css_code,
                  jsCode: w.js_code,
                  updatedAt: w.updated_at,
                }))
              : prev.savedWorkspaces;

            const merged: UserProgressBundle = {
              ...prev,
              currentPathId: up.current_path_id || prev.currentPathId,
              currentLessonId: up.current_lesson_id || prev.currentLessonId,
              totalXp: Math.max(prev.totalXp, up.total_xp || 0),
              currentStreakDays: Math.max(prev.currentStreakDays, up.current_streak_days || 0),
              longestStreakDays: Math.max(prev.longestStreakDays, up.longest_streak_days || 0),
              lastActiveDate: up.last_active_date || prev.lastActiveDate,
              totalMinutesLearned: Math.max(prev.totalMinutesLearned, up.total_minutes_learned || 0),
              lessonProgress: mergedLessons,
              savedWorkspaces: mergedWorkspaces,
            };
            saveLocalProgress(user.id, merged);
            return merged;
          });
        }
      })();
    }
  }, [storageKey, user]);

  const commitProgress = useCallback(
    (updater: (prev: UserProgressBundle) => UserProgressBundle): string[] => {
      let unlocked: string[] = [];
      setProgress((prev) => {
        const updated = updater(prev);
        const { finalBundle, unlockedTitles } = applyAchievementsAndSave(user?.id, updated);
        unlocked = unlockedTitles;

        if (isSupabaseConfigured && supabase && user) {
          supabase
            .from('user_progress')
            .upsert({
              user_id: user.id,
              current_path_id: finalBundle.currentPathId,
              current_lesson_id: finalBundle.currentLessonId,
              total_xp: finalBundle.totalXp,
              current_streak_days: finalBundle.currentStreakDays,
              longest_streak_days: finalBundle.longestStreakDays,
              last_active_date: finalBundle.lastActiveDate,
              total_minutes_learned: finalBundle.totalMinutesLearned,
              updated_at: new Date().toISOString(),
            })
            .then(() => {});
        }
        return finalBundle;
      });
      return unlocked;
    },
    [user]
  );

  const setActiveLesson = useCallback(
    (pathId: string, lessonId: string) => {
      commitProgress((prev) => ({
        ...prev,
        currentPathId: pathId,
        currentLessonId: lessonId,
      }));
    },
    [commitProgress]
  );

  const markStepCompleted = useCallback(
    (lessonId: string, stepNumber: number) => {
      commitProgress((prev) => {
        const existing = prev.lessonProgress[lessonId] || {
          lessonId,
          status: 'in_progress' as const,
          completedSteps: [],
          updatedAt: new Date().toISOString(),
        };
        const steps = existing.completedSteps.includes(stepNumber)
          ? existing.completedSteps
          : [...existing.completedSteps, stepNumber];
        return {
          ...prev,
          lessonProgress: {
            ...prev.lessonProgress,
            [lessonId]: {
              ...existing,
              completedSteps: steps,
              updatedAt: new Date().toISOString(),
            },
          },
        };
      });
    },
    [commitProgress]
  );

  const completeLesson = useCallback(
    (lessonId: string, pathId: string, xpReward: number) => {
      return commitProgress((prev) => {
        const alreadyCompleted = prev.lessonProgress[lessonId]?.status === 'completed';
        const now = new Date().toISOString();
        const streak = computeStreakOnActivity(
          prev.lastActiveDate,
          prev.currentStreakDays,
          prev.longestStreakDays
        );
        const existingSteps = prev.lessonProgress[lessonId]?.completedSteps || [];
        const all = getAllLessons();
        const entry = all.find((l) => l.lesson.id === lessonId);
        const fullSteps = entry ? entry.lesson.breakItDownSteps.map((s) => s.stepNumber) : existingSteps;

        const nextTx = alreadyCompleted
          ? prev.xpTransactions
          : [
              {
                id: crypto.randomUUID(),
                amount: xpReward,
                sourceType: 'lesson' as const,
                sourceId: lessonId,
                description: `Completed lesson: ${entry?.lesson.title || lessonId}`,
                createdAt: now,
              },
              ...prev.xpTransactions,
            ].slice(0, 60);

        if (isSupabaseConfigured && supabase && user) {
          supabase
            .from('user_lesson_progress')
            .upsert({
              user_id: user.id,
              lesson_id: lessonId,
              status: 'completed',
              completed_steps: fullSteps,
              completed_at: now,
              updated_at: now,
            })
            .then(() => {});
        }

        return {
          ...prev,
          currentPathId: pathId,
          currentLessonId: lessonId,
          totalXp: alreadyCompleted ? prev.totalXp : prev.totalXp + xpReward,
          ...streak,
          lessonProgress: {
            ...prev.lessonProgress,
            [lessonId]: {
              lessonId,
              status: 'completed',
              completedSteps: fullSteps,
              completedAt: prev.lessonProgress[lessonId]?.completedAt || now,
              updatedAt: now,
            },
          },
          xpTransactions: nextTx,
        };
      });
    },
    [commitProgress, user]
  );

  const recordCodeRun = useCallback(() => {
    return commitProgress((prev) => ({
      ...prev,
      codeRunsCount: prev.codeRunsCount + 1,
    }));
  }, [commitProgress]);

  const recordExerciseAttempt = useCallback(
    (params: {
      exerciseId: string;
      html: string;
      css: string;
      js: string;
      passed: boolean;
      xpReward: number;
    }) => {
      return commitProgress((prev) => {
        const existing = prev.exerciseSubmissions[params.exerciseId];
        const firstPass = params.passed && !existing?.passed;
        const now = new Date().toISOString();
        const streak = params.passed
          ? computeStreakOnActivity(prev.lastActiveDate, prev.currentStreakDays, prev.longestStreakDays)
          : {
              currentStreakDays: prev.currentStreakDays,
              longestStreakDays: prev.longestStreakDays,
              lastActiveDate: prev.lastActiveDate,
            };

        return {
          ...prev,
          totalXp: firstPass ? prev.totalXp + params.xpReward : prev.totalXp,
          ...streak,
          exerciseSubmissions: {
            ...prev.exerciseSubmissions,
            [params.exerciseId]: {
              exerciseId: params.exerciseId,
              submittedHtml: params.html,
              submittedCss: params.css,
              submittedJs: params.js,
              passed: existing?.passed || params.passed,
              attempts: (existing?.attempts || 0) + 1,
              updatedAt: now,
            },
          },
          xpTransactions: firstPass
            ? [
                {
                  id: crypto.randomUUID(),
                  amount: params.xpReward,
                  sourceType: 'exercise' as const,
                  sourceId: params.exerciseId,
                  description: `Solved exercise ${params.exerciseId}`,
                  createdAt: now,
                },
                ...prev.xpTransactions,
              ].slice(0, 60)
            : prev.xpTransactions,
        };
      });
    },
    [commitProgress]
  );

  const recordQuizAttempt = useCallback(
    (params: {
      quizId: string;
      scorePercent: number;
      passed: boolean;
      answers: Record<string, number>;
      xpReward: number;
    }) => {
      return commitProgress((prev) => {
        const previouslyPassed = prev.quizAttempts.some((a) => a.quizId === params.quizId && a.passed);
        const firstPass = params.passed && !previouslyPassed;
        const now = new Date().toISOString();
        const streak = computeStreakOnActivity(
          prev.lastActiveDate,
          prev.currentStreakDays,
          prev.longestStreakDays
        );

        return {
          ...prev,
          totalXp: firstPass ? prev.totalXp + params.xpReward : prev.totalXp,
          ...streak,
          quizAttempts: [
            {
              id: crypto.randomUUID(),
              quizId: params.quizId,
              scorePercent: params.scorePercent,
              passed: params.passed,
              answers: params.answers,
              createdAt: now,
            },
            ...prev.quizAttempts,
          ],
          xpTransactions: firstPass
            ? [
                {
                  id: crypto.randomUUID(),
                  amount: params.xpReward,
                  sourceType: 'quiz' as const,
                  sourceId: params.quizId,
                  description: `Passed assessment ${params.quizId} (${params.scorePercent}%)`,
                  createdAt: now,
                },
                ...prev.xpTransactions,
              ].slice(0, 60)
            : prev.xpTransactions,
        };
      });
    },
    [commitProgress]
  );

  const saveProjectProgress = useCallback(
    (record: ProjectProgressRecord, markCompleteXp?: number) => {
      return commitProgress((prev) => {
        const previouslyCompleted = prev.projectProgress[record.projectId]?.status === 'completed';
        const firstCompletion = record.status === 'completed' && !previouslyCompleted && (markCompleteXp || 0) > 0;
        const now = new Date().toISOString();
        const streak = computeStreakOnActivity(
          prev.lastActiveDate,
          prev.currentStreakDays,
          prev.longestStreakDays
        );

        return {
          ...prev,
          totalXp: firstCompletion ? prev.totalXp + (markCompleteXp || 0) : prev.totalXp,
          ...streak,
          projectProgress: {
            ...prev.projectProgress,
            [record.projectId]: {
              ...record,
              completedAt: previouslyCompleted
                ? prev.projectProgress[record.projectId]?.completedAt
                : record.status === 'completed'
                ? now
                : undefined,
              updatedAt: now,
            },
          },
          xpTransactions: firstCompletion
            ? [
                {
                  id: crypto.randomUUID(),
                  amount: markCompleteXp || 0,
                  sourceType: 'project' as const,
                  sourceId: record.projectId,
                  description: `Completed project ${record.projectId}`,
                  createdAt: now,
                },
                ...prev.xpTransactions,
              ].slice(0, 60)
            : prev.xpTransactions,
        };
      });
    },
    [commitProgress]
  );

  const logLearningMinutes = useCallback(
    (minutes: number) => {
      if (minutes <= 0) return;
      const today = getTodayIsoDate();
      commitProgress((prev) => {
        const streak = computeStreakOnActivity(
          prev.lastActiveDate,
          prev.currentStreakDays,
          prev.longestStreakDays
        );
        const existingIdx = prev.learningSessions.findIndex((s) => s.date === today);
        const sessions = [...prev.learningSessions];
        if (existingIdx >= 0) {
          sessions[existingIdx] = {
            ...sessions[existingIdx],
            minutesSpent: sessions[existingIdx].minutesSpent + minutes,
          };
        } else {
          sessions.push({ date: today, minutesSpent: minutes });
        }
        return {
          ...prev,
          ...streak,
          totalMinutesLearned: prev.totalMinutesLearned + minutes,
          learningSessions: sessions.slice(-30),
        };
      });
    },
    [commitProgress]
  );

  const toggleBookmark = useCallback(
    (lessonId: string) => {
      commitProgress((prev) => {
        const exists = prev.bookmarks.includes(lessonId);
        return {
          ...prev,
          bookmarks: exists
            ? prev.bookmarks.filter((id) => id !== lessonId)
            : [...prev.bookmarks, lessonId],
        };
      });
    },
    [commitProgress]
  );

  const saveNote = useCallback(
    (lessonId: string, content: string) => {
      commitProgress((prev) => ({
        ...prev,
        notes: {
          ...prev.notes,
          [lessonId]: content,
        },
      }));
    },
    [commitProgress]
  );

  const saveWorkspace = useCallback(
    (workspace: Omit<SavedWorkspaceRecord, 'id' | 'updatedAt'> & { id?: string }): SavedWorkspaceRecord => {
      const record: SavedWorkspaceRecord = {
        id: workspace.id || crypto.randomUUID(),
        title: workspace.title,
        htmlCode: workspace.htmlCode,
        cssCode: workspace.cssCode,
        jsCode: workspace.jsCode,
        updatedAt: new Date().toISOString(),
      };
      commitProgress((prev) => {
        const filtered = prev.savedWorkspaces.filter((w) => w.id !== record.id);
        return {
          ...prev,
          savedWorkspaces: [record, ...filtered],
        };
      });
      if (isSupabaseConfigured && supabase && user) {
        supabase
          .from('saved_workspaces')
          .upsert({
            id: record.id,
            user_id: user.id,
            title: record.title,
            html_code: record.htmlCode,
            css_code: record.cssCode,
            js_code: record.jsCode,
            updated_at: record.updatedAt,
          })
          .then(() => {});
      }
      return record;
    },
    [commitProgress, user]
  );

  const deleteWorkspace = useCallback(
    (workspaceId: string) => {
      commitProgress((prev) => ({
        ...prev,
        savedWorkspaces: prev.savedWorkspaces.filter((w) => w.id !== workspaceId),
      }));
      if (isSupabaseConfigured && supabase && user) {
        supabase.from('saved_workspaces').delete().eq('id', workspaceId).eq('user_id', user.id).then(() => {});
      }
    },
    [commitProgress, user]
  );

  const updateAnnouncementsList = useCallback((next: AnnouncementRecord[]) => {
    setAnnouncements(next);
    saveAnnouncements(next);
  }, []);

  const toggleEntityPublish = useCallback((entityId: string, published: boolean) => {
    setPublishOverrides((prev) => {
      const next = { ...prev, [entityId]: published };
      savePublishOverrides(next);
      return next;
    });
  }, []);

  return (
    <ProgressContext.Provider
      value={{
        progress: progress || createEmptyProgressBundle(),
        announcements,
        publishOverrides,
        markStepCompleted,
        completeLesson,
        recordCodeRun,
        recordExerciseAttempt,
        recordQuizAttempt,
        saveProjectProgress,
        logLearningMinutes,
        toggleBookmark,
        saveNote,
        saveWorkspace,
        deleteWorkspace,
        setActiveLesson,
        updateAnnouncementsList,
        toggleEntityPublish,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
