import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Eye, Save } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { InteractiveCodeWorkspace } from '../components/lab/InteractiveCodeWorkspace';
import { SandboxPreview } from '../components/lab/SandboxPreview';
import { Button, SurfaceCard } from '../components/ui/DesignSystem';
import { useToast } from '../components/ui/ToastContext';
import { useProgress } from '../contexts/ProgressContext';
import { getProjectById } from '../data/curriculum';

export function ProjectWorkspacePage() {
  const { projectId = '' } = useParams();
  const project = getProjectById(projectId);
  const { progress, saveProjectProgress, recordCodeRun } = useProgress();
  const { showToast } = useToast();

  const saved = project ? progress.projectProgress[project.id] : undefined;
  const [code, setCode] = useState({
    html: saved?.htmlCode ?? project?.starterHtml ?? '',
    css: saved?.cssCode ?? project?.starterCss ?? '',
    js: saved?.jsCode ?? project?.starterJs ?? '',
  });
  const [completedMilestones, setCompletedMilestones] = useState<string[]>(
    saved?.completedMilestones || []
  );
  const [completedChecklist, setCompletedChecklist] = useState<string[]>(
    saved?.completedChecklist || []
  );
  const [reflections, setReflections] = useState<Record<string, string>>(
    saved?.reflectionAnswers || {}
  );
  const [showReference, setShowReference] = useState(false);

  if (!project) {
    return (
      <AppShell breadcrumbs={[{ label: 'Projects', to: '/projects' }, { label: 'Not Found' }]}>
        <SurfaceCard className="p-8 text-center space-y-4">
          <h1 className="text-xl font-bold">Project Not Found</h1>
          <Link to="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </SurfaceCard>
      </AppShell>
    );
  }

  const toggleMilestone = (id: string) => {
    setCompletedMilestones((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleCheck = (item: string) => {
    setCompletedChecklist((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const handleSave = (submitComplete: boolean) => {
    if (submitComplete && completedChecklist.length < project.submissionChecklist.length) {
      showToast({
        title: 'Complete Submission Checklist',
        description: 'Verify and check off every item in the submission checklist before submitting.',
        variant: 'error',
      });
      return;
    }

    const unlocked = saveProjectProgress(
      {
        projectId: project.id,
        htmlCode: code.html,
        cssCode: code.css,
        jsCode: code.js,
        completedMilestones,
        completedChecklist,
        reflectionAnswers: reflections,
        status: submitComplete ? 'completed' : saved?.status || 'in_progress',
        updatedAt: new Date().toISOString(),
      },
      submitComplete ? project.xpReward : 0
    );

    showToast({
      title: submitComplete ? `Project Completed (+${project.xpReward} XP)` : 'Project Draft Saved',
      description: unlocked.length > 0 ? `Achievement Unlocked: ${unlocked.join(', ')}` : project.title,
      variant: 'success',
    });
  };

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Projects', to: '/projects' },
        { label: project.title },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => setShowReference((r) => !r)}>
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{showReference ? 'Hide Reference' : 'Reference Preview'}</span>
          </Button>
          <Button size="sm" variant="primary" onClick={() => handleSave(false)}>
            <Save className="h-3.5 w-3.5" />
            <span>Save Draft</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Project Brief & Milestones */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <SurfaceCard className="lg:col-span-7 p-5 space-y-4">
            <div>
              <p className="text-xs text-slate-500">
                <span>{project.difficulty}</span>
                <span aria-hidden="true"> · </span>
                <span className="font-mono tabular-nums">+{project.xpReward} XP</span>
                {saved?.status === 'completed' && (
                  <>
                    <span aria-hidden="true"> · </span>
                    <span className="text-emerald-500 font-medium">Submitted</span>
                  </>
                )}
              </p>
              <h1 className="font-display text-2xl font-bold mt-1">{project.title}</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{project.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white mb-1.5">Requirements</h2>
                <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                  {project.requirements.map((r) => (
                    <li key={r}>· {r}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white mb-1.5">Recommended Lessons</h2>
                <ul className="space-y-1">
                  {project.recommendedLessonIds.map((lid) => (
                    <li key={lid}>
                      <Link to={`/learn/${lid}`} className="text-blue-600 dark:text-cyan-400 hover:underline">
                        Open {lid}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="lg:col-span-5 p-5 space-y-3">
            <h2 className="text-sm font-semibold">Project Milestones</h2>
            <div className="space-y-2">
              {project.milestones.map((ms) => {
                const checked = completedMilestones.includes(ms.id);
                return (
                  <label
                    key={ms.id}
                    className="flex items-start gap-2.5 rounded-lg border border-slate-200 dark:border-slate-800 p-2.5 text-xs cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleMilestone(ms.id)}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{ms.title}</p>
                      <p className="text-slate-500">{ms.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </SurfaceCard>
        </div>

        {showReference && (
          <SurfaceCard className="p-5 space-y-3">
            <h2 className="text-sm font-semibold">Reference Target Preview</h2>
            <SandboxPreview
              html={project.referenceHtml}
              css={project.referenceCss}
              js={project.referenceJs}
              runTrigger={1}
              title="Reference Implementation"
              heightClass="h-[280px]"
            />
          </SurfaceCard>
        )}

        {/* Interactive Workspace */}
        <InteractiveCodeWorkspace
          key={project.id}
          initialHtml={code.html}
          initialCss={code.css}
          initialJs={code.js}
          onCodeChange={setCode}
          onRun={recordCodeRun}
        />

        {/* Submission Checklist & Reflection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SurfaceCard className="p-5 space-y-3">
            <h2 className="text-base font-semibold">Submission Checklist</h2>
            <div className="space-y-2">
              {project.submissionChecklist.map((item) => (
                <label key={item} className="flex items-center gap-2.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={completedChecklist.includes(item)}
                    onChange={() => toggleCheck(item)}
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
            <div className="pt-2">
              <Button variant="primary" onClick={() => handleSave(true)}>
                <CheckCircle2 className="h-4 w-4" />
                <span>Submit Completed Project (+{project.xpReward} XP)</span>
              </Button>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-5 space-y-3">
            <h2 className="text-base font-semibold">Engineering Reflection</h2>
            {project.reflectionQuestions.map((q) => (
              <div key={q} className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">{q}</label>
                <textarea
                  rows={2}
                  value={reflections[q] || ''}
                  onChange={(e) => setReflections((prev) => ({ ...prev, [q]: e.target.value }))}
                  placeholder="Summarize what you noticed..."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0D1017] p-2.5 text-xs"
                />
              </div>
            ))}
          </SurfaceCard>
        </div>
      </div>
    </AppShell>
  );
}
