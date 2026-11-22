import { path0Fundamentals } from './path0_fundamentals';
import { path1Html } from './path1_html';
import { path2Css } from './path2_css';
import { path3Networking } from './path3_networking';
import { path4Javascript } from './path4_javascript';
import { path5Git, path6Responsive, path7Apis, path8Workflow } from './path5_to_8';
import { PROJECTS_DATA } from '../projects';
import type { Exercise, LearningPath, Lesson, Module, Project, Quiz } from '../../types/curriculum';

export const LEARNING_PATHS: LearningPath[] = [
  path0Fundamentals,
  path1Html,
  path2Css,
  path3Networking,
  path4Javascript,
  path5Git,
  path6Responsive,
  path7Apis,
  path8Workflow,
];

export interface FlattenedLessonEntry {
  lesson: Lesson;
  module: Module;
  path: LearningPath;
}

export function getAllLessons(): FlattenedLessonEntry[] {
  const result: FlattenedLessonEntry[] = [];
  for (const path of LEARNING_PATHS) {
    for (const course of path.courses) {
      for (const mod of course.modules) {
        for (const lesson of mod.lessons) {
          result.push({ lesson, module: mod, path });
        }
      }
    }
  }
  return result;
}

export function getLessonEntryById(lessonId: string): FlattenedLessonEntry | undefined {
  return getAllLessons().find((entry) => entry.lesson.id === lessonId);
}

export function getLessonNeighbors(lessonId: string): {
  prev: FlattenedLessonEntry | null;
  next: FlattenedLessonEntry | null;
} {
  const all = getAllLessons();
  const idx = all.findIndex((item) => item.lesson.id === lessonId);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}

export function getExerciseById(exerciseId: string): { exercise: Exercise; module: Module; path: LearningPath } | undefined {
  for (const path of LEARNING_PATHS) {
    for (const course of path.courses) {
      for (const mod of course.modules) {
        const ex = mod.exercises.find((e) => e.id === exerciseId);
        if (ex) return { exercise: ex, module: mod, path };
      }
    }
  }
  return undefined;
}

export function getAllQuizzes(): { quiz: Quiz; module: Module; path: LearningPath }[] {
  const list: { quiz: Quiz; module: Module; path: LearningPath }[] = [];
  for (const path of LEARNING_PATHS) {
    for (const course of path.courses) {
      for (const mod of course.modules) {
        if (mod.quiz) list.push({ quiz: mod.quiz, module: mod, path });
      }
    }
  }
  return list;
}

export function getQuizById(quizId: string): { quiz: Quiz; module: Module; path: LearningPath } | undefined {
  return getAllQuizzes().find((item) => item.quiz.id === quizId);
}

export function getProjectById(projectId: string): Project | undefined {
  return PROJECTS_DATA.find((p) => p.id === projectId);
}

export interface SearchResultItem {
  id: string;
  kind: 'path' | 'lesson' | 'project' | 'quiz' | 'exercise';
  title: string;
  subtitle: string;
  href: string;
  difficulty?: string;
}

export function searchCurriculum(query: string, kindFilter: string = 'all'): SearchResultItem[] {
  const q = query.trim().toLowerCase();
  const items: SearchResultItem[] = [];

  for (const path of LEARNING_PATHS) {
    if (kindFilter === 'all' || kindFilter === 'path') {
      items.push({
        id: path.id,
        kind: 'path',
        title: path.title,
        subtitle: path.description,
        href: `/curriculum?path=${path.id}`,
        difficulty: path.difficulty,
      });
    }
    for (const course of path.courses) {
      for (const mod of course.modules) {
        for (const lesson of mod.lessons) {
          if (kindFilter === 'all' || kindFilter === 'lesson') {
            items.push({
              id: lesson.id,
              kind: 'lesson',
              title: lesson.title,
              subtitle: `${path.title} · ${mod.title}`,
              href: `/learn/${lesson.id}`,
              difficulty: path.difficulty,
            });
          }
        }
        for (const ex of mod.exercises) {
          if (kindFilter === 'all' || kindFilter === 'exercise') {
            items.push({
              id: ex.id,
              kind: 'exercise',
              title: ex.title,
              subtitle: `${mod.title} · ${ex.challengeType}`,
              href: ex.lessonId ? `/learn/${ex.lessonId}#exercise` : `/curriculum?path=${path.id}`,
              difficulty: ex.difficulty,
            });
          }
        }
        if (mod.quiz && (kindFilter === 'all' || kindFilter === 'quiz')) {
          items.push({
            id: mod.quiz.id,
            kind: 'quiz',
            title: mod.quiz.title,
            subtitle: `${path.title} · Assessment (${mod.quiz.questions.length} questions)`,
            href: `/assessments/${mod.quiz.id}`,
            difficulty: path.difficulty,
          });
        }
      }
    }
  }

  for (const proj of PROJECTS_DATA) {
    if (kindFilter === 'all' || kindFilter === 'project') {
      items.push({
        id: proj.id,
        kind: 'project',
        title: proj.title,
        subtitle: proj.description,
        href: `/projects/${proj.id}`,
        difficulty: proj.difficulty,
      });
    }
  }

  if (!q) return items;
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.kind.toLowerCase().includes(q)
  );
}

export const CODE_LAB_TEMPLATES = [
  {
    id: 'starter-blank',
    name: 'Clean HTML5 Starter',
    html: '<main class="card">\n  <h1>Hello, Ludek Tech Hub!</h1>\n  <p>Edit this HTML, CSS, or JavaScript and watch the preview update safely.</p>\n  <button id="greet-btn">Say Hello</button>\n  <p id="output"></p>\n</main>',
    css: 'body {\n  font-family: system-ui, sans-serif;\n  background: #0f172a;\n  color: #f8fafc;\n  padding: 24px;\n}\n.card {\n  max-width: 480px;\n  margin: 0 auto;\n  background: #1e293b;\n  padding: 24px;\n  border-radius: 12px;\n}\nbutton {\n  background: #2563eb;\n  color: white;\n  border: none;\n  padding: 10px 16px;\n  border-radius: 8px;\n  cursor: pointer;\n}',
    js: 'const btn = document.getElementById("greet-btn");\nconst output = document.getElementById("output");\nbtn.addEventListener("click", () => {\n  console.log("Button clicked at " + new Date().toLocaleTimeString());\n  output.textContent = "Your JavaScript just updated the DOM!";\n});',
  },
  {
    id: 'starter-flex-grid',
    name: 'Responsive Card Grid',
    html: '<section class="grid">\n  <article class="tile"><h2>01. Semantic HTML</h2><p>Accessible document landmarks.</p></article>\n  <article class="tile"><h2>02. CSS Grid</h2><p>Fluid multi-column layouts.</p></article>\n  <article class="tile"><h2>03. Safe DOM JS</h2><p>Interactive state without XSS.</p></article>\n</section>',
    css: '.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));\n  gap: 16px;\n}\n.tile {\n  border: 1px solid #cbd5e1;\n  border-radius: 10px;\n  padding: 18px;\n  background: #f8fafc;\n}\n.tile h2 { font-size: 1rem; margin-bottom: 6px; }',
    js: 'console.log("Loaded", document.querySelectorAll(".tile").length, "grid cards");',
  },
  {
    id: 'starter-fetch-demo',
    name: 'Async State Pattern',
    html: '<div class="box">\n  <h2>Safe Data Fetcher</h2>\n  <button id="load">Load Sample Courses</button>\n  <ul id="list"></ul>\n</div>',
    css: '.box { font-family: system-ui, sans-serif; max-width: 400px; } button { padding: 8px 14px; background: #0284c7; color: white; border: none; border-radius: 6px; cursor: pointer; }',
    js: 'const SAMPLE = ["HTML Foundations", "CSS Layout Mastery", "JavaScript From Zero"];\ndocument.getElementById("load").addEventListener("click", () => {\n  const list = document.getElementById("list");\n  list.replaceChildren();\n  SAMPLE.forEach(title => {\n    const li = document.createElement("li");\n    li.textContent = title;\n    list.appendChild(li);\n  });\n  console.info("Rendered", SAMPLE.length, "items safely.");\n});',
  },
];
