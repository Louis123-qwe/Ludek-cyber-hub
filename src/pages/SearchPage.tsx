import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Button, EmptyState, SurfaceCard } from '../components/ui/DesignSystem';
import { searchCurriculum } from '../data/curriculum';

const SUGGESTED_QUERIES = ['flexbox', 'semantic html', 'dns', 'async', 'grid', 'git', 'forms'];
const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'path', label: 'Paths' },
  { id: 'lesson', label: 'Lessons' },
  { id: 'exercise', label: 'Exercises' },
  { id: 'quiz', label: 'Assessments' },
  { id: 'project', label: 'Projects' },
] as const;

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const kind = searchParams.get('kind') || 'all';

  const results = useMemo(() => searchCurriculum(query, kind), [query, kind]);

  const updateQuery = (nextQ: string) => {
    const next = new URLSearchParams(searchParams);
    if (nextQ) next.set('q', nextQ);
    else next.delete('q');
    setSearchParams(next, { replace: true });
  };

  const updateKind = (nextKind: string) => {
    const next = new URLSearchParams(searchParams);
    if (nextKind === 'all') next.delete('kind');
    else next.set('kind', nextKind);
    setSearchParams(next, { replace: true });
  };

  return (
    <AppShell breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Search' }]}>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Search Curriculum &amp; Projects
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Find any lesson, interactive exercise, module quiz, learning path, or portfolio project.
          </p>
        </div>

        <SurfaceCard className="p-5 space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              placeholder="Search by topic, tag, or skill (e.g. box model, fetch, flexbox, forms)..."
              aria-label="Search curriculum and projects"
              className="w-full min-h-[44px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1017] pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter results by type">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  role="tab"
                  aria-selected={kind === opt.id}
                  onClick={() => updateKind(opt.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    kind === opt.id
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <span className="text-xs font-mono tabular-nums text-slate-500">
              {results.length} matching {results.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500">Quick topics:</span>
            {SUGGESTED_QUERIES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => updateQuery(term)}
                className="rounded-md border border-slate-200 dark:border-slate-800 px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:border-blue-500 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </SurfaceCard>

        {results.length === 0 ? (
          <EmptyState
            icon={<Search className="h-8 w-8" />}
            title="No curriculum matches found"
            description={`No lessons, exercises, or projects matched "${query}". Try a broader term or switch to All categories.`}
            action={
              <Button
                variant="secondary"
                onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}
              >
                Clear Search &amp; Filters
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.slice(0, 60).map((item) => (
              <SurfaceCard key={`${item.kind}-${item.id}`} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <p className="text-[11px] uppercase tracking-wider font-medium text-blue-600 dark:text-cyan-400">
                    {item.kind}
                    {item.difficulty ? ` · ${item.difficulty}` : ''}
                  </p>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {item.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {item.subtitle}
                  </p>
                </div>
                <Link
                  to={item.href}
                  className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-medium hover:border-blue-500 transition-colors"
                >
                  <span>Open</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </SurfaceCard>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
