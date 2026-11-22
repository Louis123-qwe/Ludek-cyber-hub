import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Code2, Layers, Menu, Shield, Sparkles, X } from 'lucide-react';
import { InteractiveCodeWorkspace } from '../components/lab/InteractiveCodeWorkspace';
import { Button } from '../components/ui/DesignSystem';
import { LEARNING_PATHS } from '../data/curriculum';
import { PROJECTS_DATA } from '../data/projects';
import { useAuth } from '../contexts/AuthContext';

const FAQ_ITEMS = [
  {
    q: 'Do I need any prior coding experience or expensive laptop?',
    a: 'No. Path 0 starts with files, folders, file extensions, and how browsers work. Every lesson runs directly inside your desktop or mobile browser with zero software installation required.',
  },
  {
    q: 'What makes "Break It Down" mode different from normal tutorials?',
    a: 'Instead of dumping dense paragraphs and technical jargon, Break It Down presents one idea per step with everyday analogies, highlighted code, and clear explanations of what breaks if a piece is missing.',
  },
  {
    q: 'Can I write and run real JavaScript safely inside the browser?',
    a: 'Yes. The Code Lab executes HTML, CSS, and JavaScript inside an isolated sandboxed iframe without same-origin access to your session tokens or application state.',
  },
  {
    q: 'Does Ludek Tech Hub work without creating a Supabase project?',
    a: 'Yes. Out of the box, the platform runs in Local Development Mode so you can sign up, track progress, save workspaces, and build projects locally. When Supabase credentials are added, real database persistence and authentication activate automatically.',
  },
];

export function LandingPage() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#090B10] dark:text-slate-100">
      {/* Top Bar Contract: 3 exact zones separated by gap-8 */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#090B10]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
          >
            Ludek Tech Hub
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link to="/curriculum" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Curriculum
            </Link>
            <Link to="/lab" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Code Lab
            </Link>
            <Link to="/visualizers" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Visualizers
            </Link>
            <Link to="/projects" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Projects
            </Link>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to={user ? '/dashboard' : '/auth'}
              className="hidden sm:inline-flex min-h-[40px] items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors whitespace-nowrap shrink-0"
            >
              {user ? 'Open Dashboard' : 'Start Learning'}
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenu((m) => !m)}
              aria-label="Toggle menu"
              className="md:hidden min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300"
            >
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C0F16] px-4 py-4 space-y-2">
            <Link to="/curriculum" className="block py-2 text-sm font-medium" onClick={() => setMobileMenu(false)}>Curriculum</Link>
            <Link to="/lab" className="block py-2 text-sm font-medium" onClick={() => setMobileMenu(false)}>Code Lab</Link>
            <Link to="/visualizers" className="block py-2 text-sm font-medium" onClick={() => setMobileMenu(false)}>Visualizers</Link>
            <Link to="/projects" className="block py-2 text-sm font-medium" onClick={() => setMobileMenu(false)}>Projects</Link>
            <Link
              to={user ? '/dashboard' : '/auth'}
              className="mt-2 flex min-h-[44px] items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white"
              onClick={() => setMobileMenu(false)}
            >
              {user ? 'Open Dashboard' : 'Start Learning'}
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <p className="text-xs font-semibold tracking-wide text-blue-600 dark:text-cyan-400">
              Learn. Understand. Build. Become.
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              From zero coding experience to building real websites.
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
              Ludek Tech Hub breaks complex front-end concepts into calm, step-by-step explanations paired with interactive visualizers, a sandboxed Code Lab, and real portfolio projects.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link to={user ? '/dashboard' : '/learn/lesson-0-1-1'}>
                <Button size="lg" variant="primary">
                  <span>Start Learning Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/curriculum">
                <Button size="lg" variant="secondary">
                  Explore Curriculum
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400 pt-2">
              <span>9 Structured Paths</span>
              <span aria-hidden="true">·</span>
              <span>21 Interactive Visualizers</span>
              <span aria-hidden="true">·</span>
              <span>12 Guided Projects</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full min-h-[280px] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900">
              <img
                src="/src/assets/images/academy_workspace_hero_1795337257303.jpg"
                alt="Minimalist developer workstation displaying code and wireframe layout"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Live Interactive Coding Preview right on Homepage */}
      <section className="border-y border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0C0F16] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold text-blue-600 dark:text-cyan-400">
              Live Interactive Preview
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Write real HTML, CSS, and JavaScript right now.
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Change the heading text, adjust the button color, or click Run to test our isolated browser sandbox.
            </p>
          </div>

          <InteractiveCodeWorkspace
            compact
            initialHtml={'<main class="welcome">\n  <h1>Hello from Ludek Tech Hub</h1>\n  <p>Edit this HTML or CSS and click Run to watch the page update.</p>\n  <button id="demo-btn">Test Click Counter: 0</button>\n</main>'}
            initialCss={'.welcome {\n  font-family: system-ui, sans-serif;\n  padding: 20px;\n}\nh1 {\n  color: #0f172a;\n  margin-bottom: 8px;\n}\nbutton {\n  margin-top: 12px;\n  padding: 10px 18px;\n  background: #2563eb;\n  color: white;\n  border: none;\n  border-radius: 8px;\n  font-weight: 600;\n  cursor: pointer;\n}'}
            initialJs={'let clicks = 0;\nconst btn = document.getElementById("demo-btn");\nbtn.addEventListener("click", () => {\n  clicks += 1;\n  btn.textContent = `Test Click Counter: ${clicks}`;\n  console.log("Interactive click recorded:", clicks);\n});'}
          />
        </div>
      </section>

      {/* Methodology & Architecture */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#11151E]">
            <img
              src="/src/assets/images/curriculum_architecture_blueprint_1795337257029.jpg"
              alt="Architectural diagram showing HTML structure, CSS layout, and JavaScript logic layers"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Built for learners who want concepts explained clearly, never rushed.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-600 dark:text-cyan-400 font-semibold text-sm">
                  <Layers className="h-4 w-4" />
                  <span>Break It Down Mode</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Step through tough ideas one clear sentence at a time with analogies, deeper toggles, and missing-code diagnostics.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-600 dark:text-cyan-400 font-semibold text-sm">
                  <Code2 className="h-4 w-4" />
                  <span>Guided Validation</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Exercises explain exactly what went wrong and offer progressive hints instead of a blunt error.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-600 dark:text-cyan-400 font-semibold text-sm">
                  <Sparkles className="h-4 w-4" />
                  <span>Visual Simulators</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Explore Flexbox, Grid, the Box Model, JS loops, DNS lookup, HTTP requests, and Git branches visually.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-600 dark:text-cyan-400 font-semibold text-sm">
                  <Shield className="h-4 w-4" />
                  <span>Sandboxed Security</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Learner code executes inside an isolated iframe origin, keeping authentication and private notes protected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Roadmap */}
      <section className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0C0F16] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Complete Front-End Progression Roadmap
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Follow a structured sequence from understanding computer files to deploying real API-powered web applications.
              </p>
            </div>
            <Link to="/curriculum">
              <Button variant="secondary">View Full Curriculum</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LEARNING_PATHS.map((path) => {
              const firstLessonId = path.courses[0]?.modules[0]?.lessons[0]?.id || 'lesson-0-1-1';
              return (
                <Link
                  key={path.id}
                  to={`/learn/${firstLessonId}`}
                  className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#11151E] p-5 hover:border-blue-500/60 transition-colors flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      <span>{path.difficulty}</span>
                      <span aria-hidden="true"> · </span>
                      <span className="font-mono tabular-nums">{path.estimatedHours} hrs</span>
                    </p>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                      {path.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {path.description}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-cyan-400">
                    Start path <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Project Showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Build 12 real projects for your developer portfolio.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Every project includes starter files, milestone checklists, live mobile/desktop preview, and self-reflection prompts—progressing from a Semantic Biography Page to a Resilient API Weather Dashboard and Expense Tracker.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PROJECTS_DATA.slice(0, 6).map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="flex items-center gap-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11151E] px-3.5 py-2.5 text-xs font-medium hover:border-blue-500/60 transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                  <span className="truncate">{p.title}</span>
                </Link>
              ))}
            </div>
            <Link to="/projects" className="inline-block pt-1">
              <Button variant="primary">Open Project Workspace</Button>
            </Link>
          </div>
          <div className="lg:col-span-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#11151E]">
            <img
              src="/src/assets/images/project_studio_preview_1795337256556.jpg"
              alt="Responsive portfolio project rendered on laptop and mobile phone"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0C0F16] py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 space-y-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#11151E]">
            {FAQ_ITEMS.map((item, idx) => (
              <div key={item.q} className="p-4 sm:p-5">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 text-left text-sm font-semibold text-slate-900 dark:text-white"
                >
                  <span>{item.q}</span>
                  {openFaq === idx ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
                </button>
                {openFaq === idx && (
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>Ludek Tech Hub · Learn. Understand. Build. Become.</p>
          <div className="flex items-center gap-5">
            <Link to="/curriculum" className="hover:text-slate-900 dark:hover:text-white">Curriculum</Link>
            <Link to="/lab" className="hover:text-slate-900 dark:hover:text-white">Code Lab</Link>
            <Link to="/visualizers" className="hover:text-slate-900 dark:hover:text-white">Visualizers</Link>
            <Link to="/projects" className="hover:text-slate-900 dark:hover:text-white">Projects</Link>
            <Link to="/auth" className="hover:text-slate-900 dark:hover:text-white">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
