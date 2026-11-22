import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Bookmark, CheckCircle2, FolderGit2, KeyRound, Moon, Sun, User } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Button, SurfaceCard, TextInput } from '../components/ui/DesignSystem';
import { useToast } from '../components/ui/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { useTheme } from '../contexts/ThemeContext';
import { ACHIEVEMENTS_CATALOG } from '../data/achievements';
import { getLessonEntryById } from '../data/curriculum';
import { PROJECTS_DATA } from '../data/projects';
import { profileUpdateSchema } from '../lib/validation';
import type { LearningPace } from '../types/curriculum';

export function ProfilePage() {
  const { user, authMode, updateProfile, changePassword } = useAuth();
  const { progress } = useProgress();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [username, setUsername] = useState(user?.username || '');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [learningGoal, setLearningGoal] = useState(
    user?.learningGoal || 'Build responsive websites from scratch'
  );
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(user?.dailyGoalMinutes || 30);
  const [preferredPace, setPreferredPace] = useState<LearningPace>(user?.preferredPace || 'slow');
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrors({});

    const parsed = profileUpdateSchema.safeParse({
      username,
      fullName,
      bio,
      learningGoal,
      dailyGoalMinutes: Number(dailyGoalMinutes),
      preferredPace,
    });

    if (!parsed.success) {
      const nextErr: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] || 'form');
        nextErr[key] = issue.message;
      }
      setProfileErrors(nextErr);
      return;
    }

    setSavingProfile(true);
    const res = await updateProfile({
      ...parsed.data,
      theme,
    });
    setSavingProfile(false);

    if (!res.ok) {
      showToast({ title: 'Could not update profile', description: res.error, variant: 'error' });
      return;
    }
    showToast({ title: 'Profile & learning preferences saved', variant: 'success' });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast({ title: 'Password must be at least 8 characters', variant: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast({ title: 'Passwords do not match', variant: 'error' });
      return;
    }
    setSavingPassword(true);
    const res = await changePassword(newPassword);
    setSavingPassword(false);
    if (!res.ok) {
      showToast({ title: 'Password update failed', description: res.error, variant: 'error' });
      return;
    }
    setNewPassword('');
    setConfirmPassword('');
    showToast({ title: 'Password updated successfully', variant: 'success' });
  };

  const completedProjects = PROJECTS_DATA.filter(
    (p) => progress.projectProgress[p.id]?.status === 'completed'
  );

  return (
    <AppShell breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Profile & Settings' }]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              Learner Profile &amp; Preferences
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Customize your learning pace, daily goal, appearance, and account security ({authMode === 'supabase' ? 'Supabase Account' : 'Local Dev Mode'}).
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono tabular-nums">
            Role: {user?.role || 'student'} · {progress.totalXp} XP
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Profile Form */}
          <SurfaceCard className="lg:col-span-7 p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <User className="h-4 w-4 text-blue-500" />
              <h2 className="text-base font-semibold">Profile &amp; Learning Pace</h2>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextInput
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  error={profileErrors.fullName}
                />
                <TextInput
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  error={profileErrors.username}
                />
              </div>

              <TextInput
                label="Email Address"
                value={user?.email || ''}
                disabled
                helperText="Email cannot be changed directly from profile preferences."
              />

              <TextInput
                label="Primary Learning Goal"
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
                error={profileErrors.learningGoal}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="preferred-pace" className="block text-sm font-medium text-slate-800 dark:text-slate-200">
                    Preferred Learning Pace
                  </label>
                  <select
                    id="preferred-pace"
                    value={preferredPace}
                    onChange={(e) => setPreferredPace(e.target.value as LearningPace)}
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0D1017] px-3 text-sm"
                  >
                    <option value="slow">Slow &amp; Guided (Opens Break It Down automatically)</option>
                    <option value="standard">Standard Pace</option>
                    <option value="accelerated">Accelerated (Opens Deeper Concept Notes)</option>
                  </select>
                </div>

                <TextInput
                  label="Daily Goal (Minutes)"
                  type="number"
                  min={5}
                  max={480}
                  value={dailyGoalMinutes}
                  onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
                  error={profileErrors.dailyGoalMinutes}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="bio" className="block text-sm font-medium text-slate-800 dark:text-slate-200">
                  Short Bio
                </label>
                <textarea
                  id="bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share what motivated you to learn web engineering..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0D1017] p-3 text-sm focus:border-blue-500 focus:outline-none"
                />
                {profileErrors.bio && <p className="text-xs text-rose-500">{profileErrors.bio}</p>}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={theme === 'dark' ? 'primary' : 'secondary'}
                    onClick={() => {
                      setTheme('dark');
                      if (user) updateProfile({ theme: 'dark' });
                    }}
                  >
                    <Moon className="h-3.5 w-3.5" />
                    <span>Dark Mode</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={theme === 'light' ? 'primary' : 'secondary'}
                    onClick={() => {
                      setTheme('light');
                      if (user) updateProfile({ theme: 'light' });
                    }}
                  >
                    <Sun className="h-3.5 w-3.5" />
                    <span>Light Mode</span>
                  </Button>
                </div>

                <Button type="submit" disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </form>
          </SurfaceCard>

          {/* Right Column: Password, Portfolio & Bookmarks */}
          <div className="lg:col-span-5 space-y-6">
            <SurfaceCard className="p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <KeyRound className="h-4 w-4 text-blue-500" />
                <h2 className="text-base font-semibold">Change Password</h2>
              </div>
              <form onSubmit={handlePasswordChange} className="space-y-3">
                <TextInput
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
                <TextInput
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                />
                <Button type="submit" variant="secondary" disabled={savingPassword}>
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </SurfaceCard>

            <SurfaceCard className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-blue-500" />
                <h2 className="text-base font-semibold">Saved Bookmarks</h2>
              </div>
              {progress.bookmarks.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No bookmarked lessons yet. Click the bookmark button inside any lesson to save it here.
                </p>
              ) : (
                <ul className="space-y-2 text-xs">
                  {progress.bookmarks.map((lid) => {
                    const entry = getLessonEntryById(lid);
                    return (
                      <li key={lid}>
                        <Link
                          to={`/learn/${lid}`}
                          className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 hover:border-blue-500"
                        >
                          <span className="truncate font-medium">{entry?.lesson.title || lid}</span>
                          <span className="text-blue-500 shrink-0">Open</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </SurfaceCard>

            <SurfaceCard className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <FolderGit2 className="h-4 w-4 text-emerald-500" />
                <h2 className="text-base font-semibold">Completed Portfolio Projects</h2>
              </div>
              {completedProjects.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Complete projects inside Portfolio Project Studio to showcase your work here.
                </p>
              ) : (
                <ul className="space-y-2 text-xs">
                  {completedProjects.map((proj) => (
                    <li key={proj.id}>
                      <Link
                        to={`/projects/${proj.id}`}
                        className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2"
                      >
                        <span className="font-medium flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          {proj.title}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400">View Code</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </SurfaceCard>
          </div>
        </div>

        {/* Full Achievements Gallery */}
        <SurfaceCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <h2 className="text-base font-semibold">Achievements Progress</h2>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {progress.unlockedAchievements.length}/{ACHIEVEMENTS_CATALOG.length} unlocked
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ACHIEVEMENTS_CATALOG.map((ach) => {
              const unlocked = progress.unlockedAchievements.find((u) => u.achievementId === ach.id);
              return (
                <div
                  key={ach.id}
                  className={`rounded-lg border p-3.5 text-xs space-y-1 ${
                    unlocked
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-slate-200 dark:border-slate-800 opacity-65'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span>{ach.title}</span>
                    <span className="font-mono tabular-nums">+{ach.xpBonus} XP</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{ach.description}</p>
                  {unlocked && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                      Unlocked {new Date(unlocked.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}
