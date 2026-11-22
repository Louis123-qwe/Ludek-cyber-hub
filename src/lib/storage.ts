import { supabase, isSupabaseConfigured } from './supabase';
import { ACHIEVEMENTS_CATALOG, DEFAULT_ANNOUNCEMENTS } from '../data/achievements';
import { getAllLessons } from '../data/curriculum';
import type {
  AnnouncementRecord,
  LearningPace,
  UserProfile,
  UserProgressBundle,
  UserRole,
} from '../types/curriculum';

const LOCAL_USERS_KEY = 'ludek_local_users_v1';
const LOCAL_SESSION_KEY = 'ludek_local_session_user_id_v1';
const LOCAL_PROGRESS_PREFIX = 'ludek_local_progress_v1_';
const LOCAL_ANNOUNCEMENTS_KEY = 'ludek_local_announcements_v1';
const LOCAL_PUBLISH_OVERRIDES_KEY = 'ludek_local_publish_overrides_v1';

interface LocalStoredUser {
  profile: UserProfile;
  passwordSalt: string;
  passwordHash: string;
}

export function createEmptyProgressBundle(): UserProgressBundle {
  return {
    currentPathId: 'path-0',
    currentLessonId: 'lesson-0-1-1',
    totalXp: 0,
    currentStreakDays: 0,
    longestStreakDays: 0,
    lastActiveDate: null,
    totalMinutesLearned: 0,
    codeRunsCount: 0,
    lessonProgress: {},
    exerciseSubmissions: {},
    quizAttempts: [],
    projectProgress: {},
    unlockedAchievements: [],
    xpTransactions: [],
    learningSessions: [],
    bookmarks: [],
    notes: {},
    savedWorkspaces: [],
  };
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function readLocalUsers(): LocalStoredUser[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? (JSON.parse(raw) as LocalStoredUser[]) : [];
  } catch {
    return [];
  }
}

function writeLocalUsers(users: LocalStoredUser[]): void {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

export function hasLocalAdminAccount(): boolean {
  return readLocalUsers().some((u) => u.profile.role === 'admin');
}

export function listLocalUsersForAdmin(): UserProfile[] {
  return readLocalUsers().map((u) => u.profile);
}

export function getLocalProgress(userId: string): UserProgressBundle {
  try {
    const raw = localStorage.getItem(`${LOCAL_PROGRESS_PREFIX}${userId}`);
    if (!raw) return createEmptyProgressBundle();
    return { ...createEmptyProgressBundle(), ...(JSON.parse(raw) as Partial<UserProgressBundle>) };
  } catch {
    return createEmptyProgressBundle();
  }
}

export function saveLocalProgress(userId: string, bundle: UserProgressBundle): void {
  localStorage.setItem(`${LOCAL_PROGRESS_PREFIX}${userId}`, JSON.stringify(bundle));
}

export async function signUpUser(params: {
  email: string;
  password: string;
  username: string;
  fullName: string;
  role?: UserRole;
}): Promise<{ user: UserProfile | null; needsEmailVerification?: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          username: params.username,
          full_name: params.fullName,
        },
      },
    });
    if (error) return { user: null, error: error.message };
    if (!data.user) return { user: null, error: 'Signup did not return a user record.' };

    const needsVerification = !data.session;
    const profile: UserProfile = {
      id: data.user.id,
      email: params.email,
      username: params.username,
      fullName: params.fullName,
      avatarUrl: '',
      bio: '',
      role: 'student',
      preferredPace: 'slow',
      dailyGoalMinutes: 30,
      learningGoal: 'Build my first responsive portfolio website',
      theme: 'dark',
      emailVerified: Boolean(data.user.email_confirmed_at),
      createdAt: data.user.created_at || new Date().toISOString(),
    };
    return { user: profile, needsEmailVerification: needsVerification };
  }

  // Local Development Mode
  const users = readLocalUsers();
  const normalizedEmail = params.email.toLowerCase();
  if (users.some((u) => u.profile.email.toLowerCase() === normalizedEmail)) {
    return { user: null, error: 'An account with this email already exists in Local Dev Mode.' };
  }
  if (users.some((u) => u.profile.username.toLowerCase() === params.username.toLowerCase())) {
    return { user: null, error: 'That username is already taken.' };
  }
  // Enforce: admin role can only be claimed during first-run setup when no admin exists
  const assignedRole: UserRole =
    params.role === 'admin' && !hasLocalAdminAccount() ? 'admin' : 'student';

  const salt = generateSalt();
  const hash = await hashPassword(params.password, salt);
  const profile: UserProfile = {
    id: crypto.randomUUID(),
    email: params.email,
    username: params.username,
    fullName: params.fullName,
    avatarUrl: '',
    bio: '',
    role: assignedRole,
    preferredPace: 'slow',
    dailyGoalMinutes: 30,
    learningGoal: 'Master HTML, CSS, and JavaScript from scratch',
    theme: 'dark',
    emailVerified: true,
    createdAt: new Date().toISOString(),
  };

  users.push({ profile, passwordSalt: salt, passwordHash: hash });
  writeLocalUsers(users);
  localStorage.setItem(LOCAL_SESSION_KEY, profile.id);
  return { user: profile };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: UserProfile | null; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { user: null, error: error.message };
    if (!data.user) return { user: null, error: 'Authentication failed.' };
    const profile = await fetchSupabaseProfile(data.user.id, data.user.email || email);
    return { user: profile };
  }

  const users = readLocalUsers();
  const found = users.find((u) => u.profile.email.toLowerCase() === email.toLowerCase());
  if (!found) {
    return { user: null, error: 'Invalid email or password.' };
  }
  const checkHash = await hashPassword(password, found.passwordSalt);
  if (checkHash !== found.passwordHash) {
    return { user: null, error: 'Invalid email or password.' };
  }
  localStorage.setItem(LOCAL_SESSION_KEY, found.profile.id);
  return { user: found.profile };
}

export async function logoutUser(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
    return;
  }
  localStorage.removeItem(LOCAL_SESSION_KEY);
}

export async function requestPasswordReset(email: string): Promise<{ ok: boolean; message: string }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: 'Password reset instructions sent to your email address.' };
  }

  const users = readLocalUsers();
  const exists = users.some((u) => u.profile.email.toLowerCase() === email.toLowerCase());
  return {
    ok: exists,
    message: exists
      ? 'Local Dev Mode: Use the password update form in Profile -> Account Settings while signed in.'
      : 'No local development account matches that email.',
  };
}

export async function fetchSupabaseProfile(userId: string, fallbackEmail: string): Promise<UserProfile> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized.');
  }
  const { data } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, bio, role_id, preferred_pace, daily_goal_minutes, learning_goal, theme, email_verified, created_at, roles(name)')
    .eq('id', userId)
    .maybeSingle();

  const roleRelation = data?.roles as { name?: string } | { name?: string }[] | null;
  const roleName = Array.isArray(roleRelation) ? roleRelation[0]?.name : roleRelation?.name;

  return {
    id: userId,
    email: fallbackEmail,
    username: data?.username || `learner_${userId.slice(0, 6)}`,
    fullName: data?.full_name || 'Ludek Learner',
    avatarUrl: data?.avatar_url || '',
    bio: data?.bio || '',
    role: (roleName as UserRole) || 'student',
    preferredPace: (data?.preferred_pace as LearningPace) || 'slow',
    dailyGoalMinutes: data?.daily_goal_minutes || 30,
    learningGoal: data?.learning_goal || 'Build real websites',
    theme: (data?.theme as 'dark' | 'light') || 'dark',
    emailVerified: Boolean(data?.email_verified),
    createdAt: data?.created_at || new Date().toISOString(),
  };
}

export async function getActiveUserSession(): Promise<UserProfile | null> {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) return null;
    return fetchSupabaseProfile(data.session.user.id, data.session.user.email || '');
  }

  const activeId = localStorage.getItem(LOCAL_SESSION_KEY);
  if (!activeId) return null;
  const users = readLocalUsers();
  return users.find((u) => u.profile.id === activeId)?.profile ?? null;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, 'username' | 'fullName' | 'bio' | 'avatarUrl' | 'learningGoal' | 'dailyGoalMinutes' | 'preferredPace' | 'theme'>>
): Promise<{ user: UserProfile | null; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.username !== undefined) dbUpdates.username = updates.username;
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.learningGoal !== undefined) dbUpdates.learning_goal = updates.learningGoal;
    if (updates.dailyGoalMinutes !== undefined) dbUpdates.daily_goal_minutes = updates.dailyGoalMinutes;
    if (updates.preferredPace !== undefined) dbUpdates.preferred_pace = updates.preferredPace;
    if (updates.theme !== undefined) dbUpdates.theme = updates.theme;

    const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', userId);
    if (error) return { user: null, error: error.message };
    const { data: authUser } = await supabase.auth.getUser();
    const refreshed = await fetchSupabaseProfile(userId, authUser.user?.email || '');
    return { user: refreshed };
  }

  const users = readLocalUsers();
  const idx = users.findIndex((u) => u.profile.id === userId);
  if (idx === -1) return { user: null, error: 'User not found.' };
  users[idx].profile = { ...users[idx].profile, ...updates };
  writeLocalUsers(users);
  return { user: users[idx].profile };
}

export async function updateUserPassword(newPassword: string): Promise<{ ok: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  const activeId = localStorage.getItem(LOCAL_SESSION_KEY);
  const users = readLocalUsers();
  const idx = users.findIndex((u) => u.profile.id === activeId);
  if (idx === -1) return { ok: false, error: 'Not signed in.' };
  const salt = generateSalt();
  users[idx].passwordSalt = salt;
  users[idx].passwordHash = await hashPassword(newPassword, salt);
  writeLocalUsers(users);
  return { ok: true };
}

export function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function computeStreakOnActivity(
  lastActiveDate: string | null,
  currentStreak: number,
  longestStreak: number
): { currentStreakDays: number; longestStreakDays: number; lastActiveDate: string } {
  const today = getTodayIsoDate();
  if (!lastActiveDate) {
    return { currentStreakDays: 1, longestStreakDays: Math.max(1, longestStreak), lastActiveDate: today };
  }
  if (lastActiveDate === today) {
    return { currentStreakDays: Math.max(1, currentStreak), longestStreakDays: Math.max(currentStreak, longestStreak), lastActiveDate: today };
  }
  const prev = new Date(`${lastActiveDate}T00:00:00Z`);
  const curr = new Date(`${today}T00:00:00Z`);
  const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
  const nextStreak = diffDays === 1 ? currentStreak + 1 : 1;
  return {
    currentStreakDays: nextStreak,
    longestStreakDays: Math.max(nextStreak, longestStreak),
    lastActiveDate: today,
  };
}

export function evaluateNewAchievements(bundle: UserProgressBundle): string[] {
  const unlockedIds = new Set(bundle.unlockedAchievements.map((a) => a.achievementId));
  const lessonsCompletedCount = Object.values(bundle.lessonProgress).filter((l) => l.status === 'completed').length;
  const exercisesPassedCount = Object.values(bundle.exerciseSubmissions).filter((e) => e.passed).length;
  const quizzesPassedCount = bundle.quizAttempts.filter((q) => q.passed).length;
  const projectsCompletedCount = Object.values(bundle.projectProgress).filter((p) => p.status === 'completed').length;

  const allLessons = getAllLessons();
  const htmlLessons = allLessons.filter((l) => l.path.id === 'path-1').map((l) => l.lesson.id);
  const cssLessons = allLessons.filter((l) => l.path.id === 'path-2').map((l) => l.lesson.id);
  const jsExercisesPassed = Object.values(bundle.exerciseSubmissions).some(
    (s) => s.passed && s.exerciseId.startsWith('ex-4-')
  );

  const newlyUnlocked: string[] = [];
  for (const ach of ACHIEVEMENTS_CATALOG) {
    if (unlockedIds.has(ach.id)) continue;
    let met = false;
    switch (ach.criteriaType) {
      case 'lessons_completed':
        met = lessonsCompletedCount >= ach.criteriaValue;
        break;
      case 'code_runs':
        met = bundle.codeRunsCount >= ach.criteriaValue;
        break;
      case 'exercises_passed':
        met = exercisesPassedCount >= ach.criteriaValue;
        break;
      case 'quizzes_passed':
        met = quizzesPassedCount >= ach.criteriaValue;
        break;
      case 'projects_completed':
        met = projectsCompletedCount >= ach.criteriaValue;
        break;
      case 'streak_days':
        met = bundle.currentStreakDays >= ach.criteriaValue;
        break;
      case 'js_exercises_passed':
        met = jsExercisesPassed;
        break;
      case 'path_html_completed':
        met = htmlLessons.length > 0 && htmlLessons.every((id) => bundle.lessonProgress[id]?.status === 'completed');
        break;
      case 'path_css_completed':
        met = cssLessons.length > 0 && cssLessons.every((id) => bundle.lessonProgress[id]?.status === 'completed');
        break;
    }
    if (met) newlyUnlocked.push(ach.id);
  }
  return newlyUnlocked;
}

export function loadAnnouncements(): AnnouncementRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_ANNOUNCEMENTS_KEY);
    return raw ? (JSON.parse(raw) as AnnouncementRecord[]) : DEFAULT_ANNOUNCEMENTS;
  } catch {
    return DEFAULT_ANNOUNCEMENTS;
  }
}

export function saveAnnouncements(list: AnnouncementRecord[]): void {
  localStorage.setItem(LOCAL_ANNOUNCEMENTS_KEY, JSON.stringify(list));
}

export function loadPublishOverrides(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(LOCAL_PUBLISH_OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export function savePublishOverrides(map: Record<string, boolean>): void {
  localStorage.setItem(LOCAL_PUBLISH_OVERRIDES_KEY, JSON.stringify(map));
}
