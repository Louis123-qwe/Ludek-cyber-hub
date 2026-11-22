import React, { useState } from 'react';
import { FolderOpen, Plus, Save, Trash2 } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { InteractiveCodeWorkspace } from '../components/lab/InteractiveCodeWorkspace';
import { Button, SurfaceCard, TextInput } from '../components/ui/DesignSystem';
import { useToast } from '../components/ui/ToastContext';
import { useProgress } from '../contexts/ProgressContext';
import { CODE_LAB_TEMPLATES } from '../data/curriculum';
import { workspaceSaveSchema } from '../lib/validation';

export function CodeLabPage() {
  const { progress, saveWorkspace, deleteWorkspace, recordCodeRun } = useProgress();
  const { showToast } = useToast();

  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState('My Sandbox Experiment');
  const [code, setCode] = useState({
    html: CODE_LAB_TEMPLATES[0].html,
    css: CODE_LAB_TEMPLATES[0].css,
    js: CODE_LAB_TEMPLATES[0].js,
  });
  const [workspaceKey, setWorkspaceKey] = useState(1);

  const loadTemplate = (templateId: string) => {
    const found = CODE_LAB_TEMPLATES.find((t) => t.id === templateId);
    if (!found) return;
    setActiveId(undefined);
    setTitle(found.name);
    setCode({ html: found.html, css: found.css, js: found.js });
    setWorkspaceKey((k) => k + 1);
  };

  const loadSaved = (wsId: string) => {
    const found = progress.savedWorkspaces.find((w) => w.id === wsId);
    if (!found) return;
    setActiveId(found.id);
    setTitle(found.title);
    setCode({ html: found.htmlCode, css: found.cssCode, js: found.jsCode });
    setWorkspaceKey((k) => k + 1);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = workspaceSaveSchema.safeParse({
      title,
      htmlCode: code.html,
      cssCode: code.css,
      jsCode: code.js,
    });
    if (!parsed.success) {
      showToast({
        title: 'Cannot Save Workspace',
        description: parsed.error.issues[0]?.message,
        variant: 'error',
      });
      return;
    }
    const saved = saveWorkspace({ id: activeId, ...parsed.data });
    setActiveId(saved.id);
    showToast({ title: 'Workspace Saved', description: saved.title, variant: 'success' });
  };

  return (
    <AppShell
      breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Interactive Code Lab' }]}
      actions={
        <Button
          size="sm"
          variant="secondary"
          onClick={() => loadTemplate('starter-blank')}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Blank</span>
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">Interactive Code Lab</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Experiment freely with HTML, CSS, and JavaScript inside an isolated browser sandbox.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {CODE_LAB_TEMPLATES.map((tpl) => (
              <Button key={tpl.id} size="sm" variant="secondary" onClick={() => loadTemplate(tpl.id)}>
                {tpl.name}
              </Button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div className="flex-1 max-w-md">
            <TextInput
              label="Workspace Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Name your workspace..."
            />
          </div>
          <Button type="submit" variant="primary">
            <Save className="h-4 w-4" />
            <span>{activeId ? 'Update Saved Workspace' : 'Save Workspace'}</span>
          </Button>
        </form>

        <InteractiveCodeWorkspace
          key={workspaceKey}
          initialHtml={code.html}
          initialCss={code.css}
          initialJs={code.js}
          onCodeChange={setCode}
          onRun={() => {
            const unlocked = recordCodeRun();
            if (unlocked.length > 0) {
              showToast({
                title: `Achievement Unlocked: ${unlocked.join(', ')}`,
                variant: 'success',
              });
            }
          }}
        />

        <SurfaceCard className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-blue-500" />
            <h2 className="text-base font-semibold">Saved Workspaces ({progress.savedWorkspaces.length})</h2>
          </div>
          {progress.savedWorkspaces.length === 0 ? (
            <p className="text-xs text-slate-500">
              No saved workspaces yet. Give your project a title above and click Save Workspace.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {progress.savedWorkspaces.map((ws) => (
                <div
                  key={ws.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-800 p-3 text-xs"
                >
                  <button
                    type="button"
                    onClick={() => loadSaved(ws.id)}
                    className="text-left min-w-0 flex-1 hover:text-blue-500"
                  >
                    <p className="font-semibold truncate">{ws.title}</p>
                    <p className="text-slate-500 font-mono text-[11px]">
                      {new Date(ws.updatedAt).toLocaleDateString()}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteWorkspace(ws.id)}
                    aria-label={`Delete ${ws.title}`}
                    className="p-1.5 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </SurfaceCard>
      </div>
    </AppShell>
  );
}
