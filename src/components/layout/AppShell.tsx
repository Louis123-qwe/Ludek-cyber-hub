import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Code2,
  Compass,
  FolderGit2,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useProgress } from '../../contexts/ProgressContext';

interface AppShellProps {
  breadcrumbs: { label: string; to?: string }[];
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ breadcrumbs, actions, children }: AppShellProps) {
  const { user, logout, authMode } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { progress } = useProgress();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    setMobileOpen(false);
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/curriculum', label: 'Curriculum', icon: BookOpen },
    { to: `/learn/${progress.currentLessonId || 'lesson-0-1-1'}`, label: 'Active Lesson', icon: Compass },
    { to: '/lab', label: 'Code Lab', icon: Code2 },
    { to: '/visualizers', label: 'Visualizers', icon: Compass },
    { to: '/projects', label: 'Projects', icon: FolderGit2 },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/profile', label: 'Profile & Settings', icon: Settings },
  ];

  if (user?.role === 'admin') {
    navItems.push({ to: '/admin', label: 'Admin Studio', icon: ShieldCheck });
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#090B10] text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0C0F16]">
        <div className="flex h-16 items-center px-6 border-b border-slate-200 dark:border-slate-800/80">
          <Link
            to="/"
            className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap"
          >
            Ludek Tech Hub
          </Link>
        </div>

        <form onSubmit={handleQuickSearch} className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search lessons..."
              aria-label="Search curriculum"
              className="w-full min-h-[38px] rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#11151E] pl-9 pr-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </form>

        <nav className="flex-1 space-y-1 px-3 overflow-y-auto" aria-label="Academy navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 dark:border-slate-800/80 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="truncate">{user ? user.username : 'Guest Mode'}</span>
            <span className="font-mono tabular-nums">{progress.totalXp} XP</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex-1 min-h-[38px] inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            {user ? (
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  navigate('/');
                }}
                aria-label="Sign out"
                className="min-h-[38px] px-3 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 hover:text-rose-500"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            ) : (
              <Link
                to="/auth"
                className="min-h-[38px] px-3 inline-flex items-center justify-center rounded-lg bg-blue-600 text-xs font-medium text-white hover:bg-blue-500"
              >
                Sign In
              </Link>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-500">
            {authMode === 'supabase' ? 'Connected to Supabase' : 'Local Dev Mode'}
          </p>
        </div>
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-white dark:bg-[#0C0F16] border-r border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <Link to="/" className="font-display text-lg font-bold" onClick={() => setMobileOpen(false)}>
                Ludek Tech Hub
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-4 flex-1 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 min-h-[44px] text-sm font-medium ${
                        isActive
                          ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400'
                          : 'text-slate-700 dark:text-slate-300'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex-1 min-h-[44px] rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium"
              >
                {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
              </button>
              {user && (
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    setMobileOpen(false);
                    navigate('/');
                  }}
                  className="min-h-[44px] px-4 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-rose-500"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#090B10]/95 backdrop-blur px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden min-h-[44px] min-w-[44px] -ml-2 inline-flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300"
            >
              <Menu className="h-5 w-5" />
            </button>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm min-w-0 overflow-hidden">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-slate-400" aria-hidden="true">/</span>}
                  {crumb.to ? (
                    <Link
                      to={crumb.to}
                      className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white truncate whitespace-nowrap"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
