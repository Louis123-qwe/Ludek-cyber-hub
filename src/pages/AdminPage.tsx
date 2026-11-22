import React, { useEffect, useState } from 'react';
import { BookOpen, Megaphone, ShieldCheck, Trash2, Users } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Button, SurfaceCard, TextInput } from '../components/ui/DesignSystem';
import { useToast } from '../components/ui/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { LEARNING_PATHS, getAllLessons, getAllQuizzes } from '../data/curriculum';
import { PROJECTS_DATA } from '../data/projects';
import { listLocalUsersForAdmin } from '../lib/storage';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { announcementSchema } from '../lib/validation';
import type { UserProfile } from '../types/curriculum';

export function AdminPage() {
  const { authMode } = useAuth();
  const {
    announcements,
    publishOverrides,
    updateAnnouncementsList,
    toggleEntityPublish,
  } = useProgress();
  const { showToast } = useToast();

  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annPublished, setAnnPublished] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadLearners() {
      setLoadingUsers(true);
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('profiles')
          .select('id, username, full_name, preferred_pace, daily_goal_minutes, learning_goal, theme, email_verified, created_at, roles(name)')
          .order('created_at', { ascending: false })
          .limit(50);

        if (active && Array.isArray(data)) {
          setUsersList(
            data.map((row) => {
              const roleRel = row.roles as { name?: string } | { name?: string }[] | null;
              const roleName = Array.isArray(roleRel) ? roleRel[0]?.name : roleRel?.name;
              return {
                id: row.id,
                email: 'Protected by auth.users',
                username: row.username || 'learner',
                fullName: row.full_name || 'Learner',
                avatarUrl: '',
                bio: '',
                role: (roleName as UserProfile['role']) || 'student',
                preferredPace: (row.preferred_pace as UserProfile['preferredPace']) || 'slow',
                dailyGoalMinutes: row.daily_goal_minutes || 30,
                learningGoal: row.learning_goal || '',
                theme: (row.theme as 'dark' | 'light') || 'dark',
                emailVerified: Boolean(row.email_verified),
                createdAt: row.created_at || new Date().toISOString(),
              };
            })
          );
          setLoadingUsers(false);
          return;
        }
      }

      if (active) {
        setUsersList(listLocalUsersForAdmin());
        setLoadingUsers(false);
      }
    }

    loadLearners();
    return () => {
      active = false;
    };
  }, []);

  const allLessons = getAllLessons();
  const allQuizzes = getAllQuizzes();
  const totalExercises = LEARNING_PATHS.reduce(
    (sum, p) => sum + p.courses.reduce((cSum, c) => cSum + c.modules.reduce((mSum, m) => mSum + m.exercises.length, 0), 0),
    0
  );

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = announcementSchema.safeParse({
      title: annTitle,
      body: annBody,
      published: annPublished,
    });
    if (!parsed.success) {
      showToast({
        title: 'Invalid announcement',
        description: parsed.error.issues[0]?.message,
        variant: 'error',
      });
      return;
    }

    const next = [
      {
        id: `ann-${crypto.randomUUID().slice(0, 8)}`,
        title: parsed.data.title,
        body: parsed.data.body,
        published: parsed.data.published,
        createdAt: new Date().toISOString(),
      },
      ...announcements,
    ];
    updateAnnouncementsList(next);
    setAnnTitle('');
    setAnnBody('');
    showToast({ title: 'Announcement published to learner dashboard', variant: 'success' });
  };

  return (
    <AppShell breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Admin Studio' }]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-2.5">
              <ShieldCheck className="h-6 w-6 text-blue-500" />
              <span>Academy Admin Studio</span>
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Manage curriculum visibility, learner accounts, and platform announcements ({authMode === 'supabase' ? 'Supabase RLS Enforced' : 'Local Dev Mode'}).
            </p>
          </div>
        </div>

        {/* Real Platform Inventory Counts */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SurfaceCard className="p-4">
            <p className="text-xs text-slate-500">Learning Paths</p>
            <p className="text-2xl font-bold font-mono tabular-nums mt-1">{LEARNING_PATHS.length}</p>
          </SurfaceCard>
          <SurfaceCard className="p-4">
            <p className="text-xs text-slate-500">Published Lessons</p>
            <p className="text-2xl font-bold font-mono tabular-nums mt-1">{allLessons.length}</p>
          </SurfaceCard>
          <SurfaceCard className="p-4">
            <p className="text-xs text-slate-500">Exercises &amp; Quizzes</p>
            <p className="text-2xl font-bold font-mono tabular-nums mt-1">
              {totalExercises} / {allQuizzes.length}
            </p>
          </SurfaceCard>
          <SurfaceCard className="p-4">
            <p className="text-xs text-slate-500">Registered Accounts</p>
            <p className="text-2xl font-bold font-mono tabular-nums mt-1">{usersList.length}</p>
          </SurfaceCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Path & Project Publishing Controls */}
          <SurfaceCard className="lg:col-span-7 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <h2 className="text-base font-semibold">Curriculum &amp; Project Publishing</h2>
            </div>

            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Learning Paths
              </h3>
              {LEARNING_PATHS.map((p) => {
                const isPublished = publishOverrides[p.id] ?? p.published;
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{p.title}</p>
                      <p className="text-slate-500">
                        {p.courses.reduce((s, c) => s + c.modules.reduce((ms, m) => ms + m.lessons.length, 0), 0)} lessons · {p.difficulty}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={isPublished ? 'secondary' : 'primary'}
                      onClick={() => {
                        toggleEntityPublish(p.id, !isPublished);
                        showToast({
                          title: !isPublished ? `Published ${p.title}` : `Unpublished ${p.title}`,
                          variant: 'info',
                        });
                      }}
                    >
                      {isPublished ? 'Published (Hide)' : 'Hidden (Publish)'}
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Guided Portfolio Projects ({PROJECTS_DATA.length})
              </h3>
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {PROJECTS_DATA.map((proj) => {
                  const isPublished = publishOverrides[proj.id] ?? proj.published;
                  return (
                    <div
                      key={proj.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs"
                    >
                      <span className="truncate font-medium">{proj.title}</span>
                      <Button
                        size="sm"
                        variant={isPublished ? 'secondary' : 'primary'}
                        onClick={() => toggleEntityPublish(proj.id, !isPublished)}
                      >
                        {isPublished ? 'Published' : 'Unpublished'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </SurfaceCard>

          {/* Announcements Creator */}
          <SurfaceCard className="lg:col-span-5 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Megaphone className="h-4 w-4 text-blue-500" />
              <h2 className="text-base font-semibold">Learner Announcements</h2>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3">
              <TextInput
                label="Announcement Title"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="e.g. Path 7 API Challenges Updated"
              />
              <div className="space-y-1.5">
                <label htmlFor="ann-body" className="block text-sm font-medium text-slate-800 dark:text-slate-200">
                  Message
                </label>
                <textarea
                  id="ann-body"
                  rows={3}
                  value={annBody}
                  onChange={(e) => setAnnBody(e.target.value)}
                  placeholder="Share study reminders or curriculum updates..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0D1017] p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={annPublished}
                  onChange={(e) => setAnnPublished(e.target.checked)}
                />
                <span>Publish immediately to learner dashboards</span>
              </label>
              <Button type="submit" size="sm">
                Publish Announcement
              </Button>
            </form>

            <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0D1017] p-3 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{ann.title}</span>
                    <button
                      type="button"
                      aria-label={`Delete ${ann.title}`}
                      onClick={() => updateAnnouncementsList(announcements.filter((a) => a.id !== ann.id))}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{ann.body}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>

        {/* Registered Learners Table */}
        <SurfaceCard className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <h2 className="text-base font-semibold">Learner Directory</h2>
          </div>
          {loadingUsers ? (
            <p className="text-xs text-slate-500">Loading learners...</p>
          ) : usersList.length === 0 ? (
            <p className="text-xs text-slate-500">No learner records returned yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Username</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Pace</th>
                    <th className="py-2 pr-4">Daily Goal</th>
                    <th className="py-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.id} className="border-b border-slate-200 dark:border-slate-800/60">
                      <td className="py-2.5 pr-4 font-medium">{u.fullName}</td>
                      <td className="py-2.5 pr-4 font-mono">{u.username}</td>
                      <td className="py-2.5 pr-4 uppercase">{u.role}</td>
                      <td className="py-2.5 pr-4">{u.preferredPace}</td>
                      <td className="py-2.5 pr-4 font-mono tabular-nums">{u.dailyGoalMinutes} min</td>
                      <td className="py-2.5 font-mono">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SurfaceCard>
      </div>
    </AppShell>
  );
}
