export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type UserRole = 'student' | 'instructor' | 'admin';
export type LearningPace = 'slow' | 'standard' | 'accelerated';

export type VisualizerId =
  | 'dom-tree'
  | 'semantic-builder'
  | 'form-builder'
  | 'box-model'
  | 'flexbox'
  | 'grid'
  | 'positioning'
  | 'color-contrast'
  | 'typography'
  | 'responsive-breakpoints'
  | 'js-variables'
  | 'js-conditions'
  | 'js-loops'
  | 'js-arrays'
  | 'js-events'
  | 'js-async'
  | 'url-lifecycle'
  | 'dns-lookup'
  | 'http-builder'
  | 'client-server'
  | 'git-playground';

export interface BreakItDownStep {
  stepNumber: number;
  title: string;
  plainExplanation: string;
  deeperExplanation?: string;
  analogy?: string;
  codeSnippet?: string;
  codeLanguage?: 'html' | 'css' | 'javascript' | 'bash' | 'http';
  whatIfMissing?: string;
  whyItMatters?: string;
}

export type LessonBlock =
  | { type: 'markdown'; heading?: string; body: string }
  | { type: 'callout'; variant: 'tip' | 'note' | 'warning'; title: string; body: string }
  | { type: 'code'; title: string; language: 'html' | 'css' | 'javascript' | 'bash' | 'http'; code: string; caption?: string }
  | { type: 'tabs'; title: string; tabs: { label: string; body: string; code?: string; language?: 'html' | 'css' | 'javascript' }[] }
  | { type: 'reveal'; prompt: string; answerTitle: string; answerBody: string; code?: string }
  | { type: 'visualizer'; visualizerId: VisualizerId; title: string; description: string };

export interface CommonMistake {
  mistake: string;
  whyItHappens: string;
  fix: string;
}

export type ExerciseChallengeType =
  | 'write-code'
  | 'code-completion'
  | 'find-bug'
  | 'predict-output'
  | 'multiple-choice'
  | 'order-steps'
  | 'match-concepts';

export interface ExerciseTestRule {
  id: string;
  description: string;
  assertionType: 'dom-exists' | 'dom-text' | 'dom-attr' | 'css-contains' | 'js-eval' | 'html-regex';
  target: string;
  expected: string;
  failureFeedback: string;
}

export interface Exercise {
  id: string;
  moduleId: string;
  lessonId?: string;
  title: string;
  difficulty: DifficultyLevel;
  challengeType: ExerciseChallengeType;
  instructions: string;
  objectives: string[];
  starterHtml: string;
  starterCss: string;
  starterJs: string;
  solutionHtml: string;
  solutionCss: string;
  solutionJs: string;
  hints: string[];
  tests: ExerciseTestRule[];
  explanation: string;
  xpReward: number;
  // Optional fields for non-editor challenge types
  choices?: string[];
  correctChoiceIndex?: number;
  orderedSteps?: string[];
  matchPairs?: { term: string; definition: string }[];
}

export interface QuizQuestion {
  id: string;
  questionType: 'multiple-choice' | 'true-false' | 'output-prediction';
  prompt: string;
  codeSnippet?: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  passingScorePercent: number;
  xpReward: number;
  questions: QuizQuestion[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  orderIndex: number;
  title: string;
  durationMinutes: number;
  xpReward: number;
  published: boolean;
  objectives: string[];
  prerequisites: string[];
  intro: string;
  breakItDownSteps: BreakItDownStep[];
  contentBlocks: LessonBlock[];
  commonMistakes: CommonMistake[];
  summary: string;
  keyTakeaways: string[];
  exerciseId?: string;
  quizId?: string;
  glossaryTerms?: { term: string; plainDefinition: string }[];
}

export interface Module {
  id: string;
  courseId: string;
  orderIndex: number;
  title: string;
  summary: string;
  published: boolean;
  lessons: Lesson[];
  exercises: Exercise[];
  quiz?: Quiz;
}

export interface Course {
  id: string;
  learningPathId: string;
  slug: string;
  orderIndex: number;
  title: string;
  description: string;
  published: boolean;
  modules: Module[];
}

export interface LearningPath {
  id: string;
  slug: string;
  orderIndex: number;
  title: string;
  subtitle: string;
  description: string;
  difficulty: DifficultyLevel;
  estimatedHours: number;
  published: boolean;
  courses: Course[];
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
}

export interface Project {
  id: string;
  learningPathId: string;
  title: string;
  difficulty: DifficultyLevel;
  description: string;
  requirements: string[];
  learningOutcomes: string[];
  recommendedLessonIds: string[];
  starterHtml: string;
  starterCss: string;
  starterJs: string;
  referenceHtml: string;
  referenceCss: string;
  referenceJs: string;
  milestones: ProjectMilestone[];
  submissionChecklist: string[];
  reflectionQuestions: string[];
  hints: string[];
  xpReward: number;
  published: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  role: UserRole;
  preferredPace: LearningPace;
  dailyGoalMinutes: number;
  learningGoal: string;
  theme: 'dark' | 'light';
  emailVerified: boolean;
  createdAt: string;
}

export interface LessonProgressRecord {
  lessonId: string;
  status: 'in_progress' | 'completed';
  completedSteps: number[];
  completedAt?: string;
  updatedAt: string;
}

export interface ExerciseSubmissionRecord {
  exerciseId: string;
  submittedHtml: string;
  submittedCss: string;
  submittedJs: string;
  passed: boolean;
  attempts: number;
  updatedAt: string;
}

export interface QuizAttemptRecord {
  id: string;
  quizId: string;
  scorePercent: number;
  passed: boolean;
  answers: Record<string, number>;
  createdAt: string;
}

export interface ProjectProgressRecord {
  projectId: string;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  completedMilestones: string[];
  completedChecklist: string[];
  reflectionAnswers: Record<string, string>;
  status: 'in_progress' | 'completed';
  completedAt?: string;
  updatedAt: string;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  criteriaType: string;
  criteriaValue: number;
  xpBonus: number;
}

export interface UserAchievementRecord {
  achievementId: string;
  unlockedAt: string;
}

export interface XpTransactionRecord {
  id: string;
  amount: number;
  sourceType: 'lesson' | 'exercise' | 'quiz' | 'project' | 'achievement';
  sourceId: string;
  description: string;
  createdAt: string;
}

export interface LearningSessionRecord {
  date: string; // YYYY-MM-DD
  minutesSpent: number;
}

export interface SavedWorkspaceRecord {
  id: string;
  title: string;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  updatedAt: string;
}

export interface AnnouncementRecord {
  id: string;
  title: string;
  body: string;
  published: boolean;
  createdAt: string;
}

export interface UserProgressBundle {
  currentPathId: string;
  currentLessonId: string;
  totalXp: number;
  currentStreakDays: number;
  longestStreakDays: number;
  lastActiveDate: string | null;
  totalMinutesLearned: number;
  codeRunsCount: number;
  lessonProgress: Record<string, LessonProgressRecord>;
  exerciseSubmissions: Record<string, ExerciseSubmissionRecord>;
  quizAttempts: QuizAttemptRecord[];
  projectProgress: Record<string, ProjectProgressRecord>;
  unlockedAchievements: UserAchievementRecord[];
  xpTransactions: XpTransactionRecord[];
  learningSessions: LearningSessionRecord[];
  bookmarks: string[];
  notes: Record<string, string>;
  savedWorkspaces: SavedWorkspaceRecord[];
}
