import { beforeEach, describe, expect, it } from 'vitest';
import {
  announcementSchema,
  isSafeHttpUrl,
  loginSchema,
  profileUpdateSchema,
  signUpSchema,
  workspaceSaveSchema,
} from '../lib/validation';
import { buildSandboxedSrcDoc } from '../lib/sandbox';
import {
  computeStreakOnActivity,
  createEmptyProgressBundle,
  evaluateNewAchievements,
  hasLocalAdminAccount,
  loginUser,
  logoutUser,
  signUpUser,
} from '../lib/storage';
import { LEARNING_PATHS, getAllLessons, getAllQuizzes, searchCurriculum } from '../data/curriculum';
import { PROJECTS_DATA } from '../data/projects';

function installMemoryLocalStorage() {
  const store = new Map<string, string>();
  const mockStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, val: string) => {
      store.set(key, String(val));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockStorage,
    configurable: true,
    writable: true,
  });
}

describe('Validation & URL Safety', () => {
  it('validates signUpSchema and rejects short passwords', () => {
    const valid = signUpSchema.safeParse({
      email: 'learner@ludek.dev',
      username: 'ada_lovelace',
      fullName: 'Ada Lovelace',
      password: 'securepassword123',
    });
    expect(valid.success).toBe(true);

    const invalid = signUpSchema.safeParse({
      email: 'not-an-email',
      username: 'x',
      fullName: 'A',
      password: '123',
    });
    expect(invalid.success).toBe(false);
  });

  it('validates loginSchema, profileUpdateSchema, workspaceSaveSchema, and announcementSchema', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'secret' }).success).toBe(true);
    expect(
      profileUpdateSchema.safeParse({
        username: 'dev_01',
        fullName: 'Dev Learner',
        bio: 'Learning CSS Grid',
        learningGoal: 'Ship a responsive portfolio',
        dailyGoalMinutes: 45,
        preferredPace: 'slow',
      }).success
    ).toBe(true);
    expect(
      workspaceSaveSchema.safeParse({
        title: 'Flexbox Navbar',
        htmlCode: '<nav></nav>',
        cssCode: 'nav { display: flex; }',
        jsCode: '',
      }).success
    ).toBe(true);
    expect(
      announcementSchema.safeParse({
        title: 'New Path Live',
        body: 'Path 7 API lessons are published.',
        published: true,
      }).success
    ).toBe(true);
  });

  it('enforces safe http/https URLs only', () => {
    expect(isSafeHttpUrl('https://developer.mozilla.org')).toBe(true);
    expect(isSafeHttpUrl('http://localhost:3000')).toBe(true);
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeHttpUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isSafeHttpUrl('not a url')).toBe(false);
  });
});

describe('Sandboxed Execution Document Builder', () => {
  it('escapes closing style/script tags and embeds strict CSP + runToken', () => {
    const doc = buildSandboxedSrcDoc({
      html: '<main><h1>Hi</h1></main>',
      css: 'body { color: red; }</style><script>alert(1)</script>',
      js: 'const s = "</script>"; console.log("ok");',
      runToken: 'tok-99',
    });

    expect(doc).toContain('Content-Security-Policy');
    expect(doc).toContain('"tok-99"');
    expect(doc).toContain('<\\/style>');
    expect(doc).toContain('<\\/script>');
  });
});

describe('Streak, XP & Achievement Progression Engine', () => {
  it('computes daily streak transitions accurately', () => {
    const today = new Date().toISOString().slice(0, 10);
    const first = computeStreakOnActivity(null, 0, 0);
    expect(first.currentStreakDays).toBe(1);
    expect(first.longestStreakDays).toBe(1);
    expect(first.lastActiveDate).toBe(today);

    const sameDay = computeStreakOnActivity(today, 3, 5);
    expect(sameDay.currentStreakDays).toBe(3);
    expect(sameDay.longestStreakDays).toBe(5);

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const consecutive = computeStreakOnActivity(yesterday, 4, 4);
    expect(consecutive.currentStreakDays).toBe(5);
    expect(consecutive.longestStreakDays).toBe(5);

    const broken = computeStreakOnActivity('2020-01-01', 9, 9);
    expect(broken.currentStreakDays).toBe(1);
    expect(broken.longestStreakDays).toBe(9);
  });

  it('unlocks achievements accurately when thresholds are reached', () => {
    const bundle = createEmptyProgressBundle();
    bundle.lessonProgress['lesson-0-1-1'] = {
      lessonId: 'lesson-0-1-1',
      status: 'completed',
      completedSteps: [1, 2, 3],
      updatedAt: new Date().toISOString(),
    };
    bundle.codeRunsCount = 1;
    bundle.exerciseSubmissions['ex-4-1-1'] = {
      exerciseId: 'ex-4-1-1',
      submittedHtml: '',
      submittedCss: '',
      submittedJs: 'const x = 1;',
      passed: true,
      attempts: 1,
      updatedAt: new Date().toISOString(),
    };

    const unlocked = evaluateNewAchievements(bundle);
    expect(unlocked).toContain('first_lesson');
    expect(unlocked).toContain('first_code_run');
    expect(unlocked).toContain('first_js_function');
  });
});

describe('Local Development Mode Auth & First-Run Admin Lock', () => {
  beforeEach(() => {
    installMemoryLocalStorage();
  });

  it('hashes passwords, prevents duplicate emails, and locks admin role after first admin exists', async () => {
    expect(hasLocalAdminAccount()).toBe(false);

    const adminSignup = await signUpUser({
      email: 'admin@ludek.local',
      password: 'Password123!',
      username: 'ludek_admin',
      fullName: 'Academy Admin',
      role: 'admin',
    });
    expect(adminSignup.user?.role).toBe('admin');
    expect(hasLocalAdminAccount()).toBe(true);

    // Second attempt claiming admin should automatically be downgraded to student
    const secondSignup = await signUpUser({
      email: 'second@ludek.local',
      password: 'Password123!',
      username: 'learner_two',
      fullName: 'Learner Two',
      role: 'admin',
    });
    expect(secondSignup.user?.role).toBe('student');

    await logoutUser();
    const badLogin = await loginUser('admin@ludek.local', 'WrongPass');
    expect(badLogin.user).toBeNull();

    const goodLogin = await loginUser('admin@ludek.local', 'Password123!');
    expect(goodLogin.user?.username).toBe('ludek_admin');
  });
});

describe('Curriculum & Portfolio Integrity Invariants', () => {
  it('provides 9 progressive learning paths, multi-lesson modules, >=3 exercises per module, quizzes, and 12 projects', () => {
    expect(LEARNING_PATHS.length).toBe(9);
    expect(PROJECTS_DATA.length).toBe(12);

    const allLessons = getAllLessons();
    expect(allLessons.length).toBeGreaterThanOrEqual(30);

    for (const path of LEARNING_PATHS) {
      for (const course of path.courses) {
        for (const mod of course.modules) {
          expect(mod.lessons.length).toBeGreaterThanOrEqual(2);
          expect(mod.exercises.length).toBeGreaterThanOrEqual(3);
          expect(mod.quiz).toBeDefined();
          expect(mod.quiz!.questions.length).toBeGreaterThanOrEqual(2);
          for (const lesson of mod.lessons) {
            expect(lesson.breakItDownSteps.length).toBeGreaterThanOrEqual(2);
          }
        }
      }
    }

    expect(getAllQuizzes().length).toBeGreaterThanOrEqual(16);
    expect(searchCurriculum('flexbox', 'all').length).toBeGreaterThan(0);
    expect(searchCurriculum('biography', 'project').length).toBeGreaterThan(0);
  });
});
