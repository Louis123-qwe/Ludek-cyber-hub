# Ludek Tech Hub

**Learn. Understand. Build. Become.**

Ludek Tech Hub is an interactive front-end engineering academy designed to take absolute beginners from zero technical background to building real, responsive, accessible websites and web applications.

---

## Key Capabilities

- **Break It Down (Slow Learning Mode)**: Progressive step-by-step concept breakdowns with manual pacing, optional auto-pacing, analogies, "what happens if missing" diagnostics, and beginner vs. deeper explanations.
- **9 Structured Learning Paths**:
  - Path 0: Computer & Web Fundamentals
  - Path 1: HTML Foundations
  - Path 2: CSS Foundations
  - Path 3: Networking & How the Web Works
  - Path 4: JavaScript From Zero
  - Path 5: Git & GitHub
  - Path 6: Responsive Web Design
  - Path 7: APIs & Real-World Frontend (with resilient fallback datasets)
  - Path 8: Front-End Development Workflow
- **Interactive Code Lab & Sandboxed Execution**: CodeMirror 6 editor (HTML, CSS, JavaScript) paired with an isolated `sandbox="allow-scripts"` iframe preview, live console, error capture, viewport resizer, starter templates, and workspace persistence.
- **Interactive Visualizers & Simulators**: Box Model Explorer, Flexbox & Grid Playgrounds, Positioning & Z-Index, DOM Tree Explorer, JS Loop/Array/Async Visualizers, 11-Stage URL-to-Website Simulator, DNS Lookup & HTTP Request Builder, and an interactive Git Terminal & Commit Graph.
- **12 Guided Portfolio Projects**: Progressive real-world builds with milestones, starter files, live preview, submission checklist, and reflection questions.
- **Module Assessments & Contextual Tutor**: Randomized quizzes with hidden answers pre-submission, detailed review feedback, and **"Ask Your Tutor"** (a truthful curriculum-grounded contextual assistant).
- **Dual Persistence Modes**:
  - **Local Development Mode** (zero setup required out of the box)
  - **Supabase Production Mode** (real Supabase Auth, PostgreSQL persistence, and Row Level Security)

---

## Quick Start (Local Development Mode)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server** (runs on port `3000`):
   ```bash
   npm run dev
   ```

3. **Open the app**: Navigate to `http://localhost:3000`.
   - When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are not configured, Ludek Tech Hub automatically enters **Local Development Mode** (clearly indicated in Auth and Settings). You can register a local learner account or use the first-run local admin setup flow to test all features including progress persistence, exercises, projects, quizzes, and the Admin Studio.

---

## Configuring Supabase (Production Mode)

1. Create a new project at [supabase.com](https://supabase.com).
2. Run the SQL migrations in order inside the Supabase SQL Editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/seed.sql`
3. Copy `.env.example` to `.env.local` and supply your public project credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
4. **Never** put `SUPABASE_SERVICE_ROLE_KEY` or `GEMINI_API_KEY` in any `VITE_*` variable. Keep privileged keys strictly on your backend/CLI environment.

### Seeding an Admin Account Safely

No privileged admin credentials are hardcoded in the application.
- **Supabase Mode**: Register a standard account via `/auth`, then run the following inside your Supabase SQL Editor using your user's UUID:
  ```sql
  UPDATE public.profiles SET role_id = 3 WHERE id = '<YOUR_USER_UUID>';
  ```
- **Local Development Mode**: On first run before any local admin exists, the `/auth` or `/admin` screen provides an inline **First-Run Admin Setup** form so you can choose your own local admin email and password (stored salted & hashed via Web Crypto SHA-256).

---

## Coding Sandbox Security Model & Documented Limitations

- **Iframe Isolation**: Learner HTML, CSS, and JavaScript execute inside an `<iframe sandbox="allow-scripts">` **without** `allow-same-origin`. Because the iframe is assigned an opaque unique origin, learner scripts cannot read `window.parent`, `localStorage`, `sessionStorage`, cookies, Supabase tokens, or React application state.
- **No Main-Window `eval()`**: The host React application never calls `eval()` or `new Function()` on learner code.
- **Origin-Validated Bridge**: Console output (`log`, `warn`, `error`) and sandboxed JS test assertions communicate strictly over `window.postMessage` with explicit `event.source === iframe.contentWindow` verification and structured payload validation.
- **Documented Limitations**:
  1. Learner code runs inside the user's own browser tab; infinite loops (e.g. `while(true){}`) can freeze the iframe's browsing context until reset or closed.
  2. External network calls (`fetch`) inside learner code are subject to standard browser CORS and CSP policies.
  3. Local Development Mode stores local dev user data in browser `localStorage` and is intended strictly for single-browser local development, never multi-user production security.

---

## Testing & Verification

Run type-checking, unit/integration tests, and production build:

```bash
npm run lint
npm run test
npm run build
```
