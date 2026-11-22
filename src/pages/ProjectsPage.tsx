import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { SurfaceCard } from '../components/ui/DesignSystem';
import { useProgress } from '../contexts/ProgressContext';
import { PROJECTS_DATA } from '../data/projects';

export function ProjectsPage() {
  const [difficulty, setDifficulty] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');
  const { progress, publishOverrides } = useProgress();

  const publishedProjects = PROJECTS_DATA.filter((p) => publishOverrides[p.id] ?? p.published);
  const filtered =
    difficulty === 'All'
      ? publishedProjects
      : publishedProjects.filter((p) => p.difficulty === difficulty);

  return (
    <AppShell breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Projects' }]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              Portfolio Project Studio
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Apply what you learned across 12 guided projects with starter files, milestones, live preview, and reflection prompts.
            </p>
          </div>
          <div className="flex rounded-lg bg-slate-200/70 dark:bg-[#11151E] border border-slate-200 dark:border-slate-800 p-0.5 text-xs">
            {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap ${
                  difficulty === d ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((project) => {
            const prog = progress.projectProgress[project.id];
            const completed = prog?.status === 'completed';
            return (
              <SurfaceCard key={project.id} className="p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <span>{project.difficulty}</span>
                    <span aria-hidden="true"> · </span>
                    <span className="font-mono tabular-nums">+{project.xpReward} XP</span>
                    {completed && (
                      <>
                        <span aria-hidden="true"> · </span>
                        <span className="text-emerald-500 font-medium">Completed</span>
                      </>
                    )}
                  </p>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    {completed && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                    <span>{project.title}</span>
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono tabular-nums">
                    {project.milestones.length} milestones
                  </span>
                  <Link
                    to={`/projects/${project.id}`}
                    className="inline-flex items-center gap-1 font-medium text-blue-600 dark:text-cyan-400 hover:underline"
                  >
                    <span>{prog ? 'Resume Project' : 'Open Workspace'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </SurfaceCard>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
