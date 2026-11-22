import React, { useState } from 'react';
import { Play, RotateCcw, Copy, Check, Download, Terminal } from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { SandboxPreview } from './SandboxPreview';
import { Button } from '../ui/DesignSystem';
import type { SandboxConsoleEntry } from '../../lib/sandbox';

interface InteractiveCodeWorkspaceProps {
  initialHtml: string;
  initialCss: string;
  initialJs: string;
  onCodeChange?: (code: { html: string; css: string; js: string }) => void;
  onRun?: () => void;
  compact?: boolean;
}

export function InteractiveCodeWorkspace({
  initialHtml,
  initialCss,
  initialJs,
  onCodeChange,
  onRun,
  compact = false,
}: InteractiveCodeWorkspaceProps) {
  const [html, setHtml] = useState(initialHtml);
  const [css, setCss] = useState(initialCss);
  const [js, setJs] = useState(initialJs);
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js' | 'preview' | 'console'>('html');
  const [runTrigger, setRunTrigger] = useState(1);
  const [copied, setCopied] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<SandboxConsoleEntry[]>([]);

  const updateHtml = (val: string) => {
    setHtml(val);
    onCodeChange?.({ html: val, css, js });
  };
  const updateCss = (val: string) => {
    setCss(val);
    onCodeChange?.({ html, css: val, js });
  };
  const updateJs = (val: string) => {
    setJs(val);
    onCodeChange?.({ html, css, js: val });
  };

  const handleRun = () => {
    setRunTrigger((c) => c + 1);
    onRun?.();
  };

  const handleReset = () => {
    setHtml(initialHtml);
    setCss(initialCss);
    setJs(initialJs);
    onCodeChange?.({ html: initialHtml, css: initialCss, js: initialJs });
    setRunTrigger((c) => c + 1);
  };

  const handleCopy = async () => {
    const bundle = `<!-- HTML -->\n${html}\n\n/* CSS */\n${css}\n\n// JS\n${js}`;
    await navigator.clipboard.writeText(bundle);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    const fullDoc = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="UTF-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n<title>Ludek Tech Hub Export</title>\n<style>\n${css}\n</style>\n</head>\n<body>\n${html}\n<script>\n${js}\n</script>\n</body>\n</html>`;
    const blob = new Blob([fullDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ludek-project.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs: { id: 'html' | 'css' | 'js' | 'preview' | 'console'; label: string }[] = [
    { id: 'html', label: 'HTML' },
    { id: 'css', label: 'CSS' },
    { id: 'js', label: 'JavaScript' },
    { id: 'preview', label: 'Preview' },
    { id: 'console', label: `Console (${consoleLogs.length})` },
  ];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11151E] overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 px-3 py-2.5 bg-slate-50 dark:bg-[#0D1017]">
        <div className="flex items-center gap-1 overflow-x-auto" role="tablist" aria-label="Workspace panels">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={activeTab === t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                activeTab === t.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800'
              } ${t.id === 'preview' ? 'lg:hidden' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button size="sm" variant="ghost" onClick={handleCopy} title="Copy all code">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDownload} title="Download HTML file">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          <Button size="sm" variant="secondary" onClick={handleReset} title="Reset code">
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
          <Button size="sm" variant="primary" onClick={handleRun}>
            <Play className="h-3.5 w-3.5" />
            <span>Run</span>
          </Button>
        </div>
      </div>

      {/* Responsive Split: Stacked on mobile via tab, Side-by-side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        <div className="p-3 min-w-0">
          {activeTab === 'html' && (
            <CodeEditor value={html} onChange={updateHtml} language="html" minHeight={compact ? '240px' : '340px'} />
          )}
          {activeTab === 'css' && (
            <CodeEditor value={css} onChange={updateCss} language="css" minHeight={compact ? '240px' : '340px'} />
          )}
          {activeTab === 'js' && (
            <CodeEditor value={js} onChange={updateJs} language="javascript" minHeight={compact ? '240px' : '340px'} />
          )}
          {activeTab === 'preview' && (
            <div className="lg:hidden">
              <SandboxPreview
                html={html}
                css={css}
                js={js}
                runTrigger={runTrigger}
                onConsoleLogsChange={setConsoleLogs}
                heightClass="h-[320px]"
              />
            </div>
          )}
          {activeTab === 'console' && (
            <div className="min-h-[260px] max-h-[360px] overflow-y-auto rounded-lg bg-[#0B0E14] p-4 font-mono text-xs space-y-2 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 pb-2 border-b border-slate-800">
                <Terminal className="h-4 w-4" />
                <span>Sandboxed Console Output</span>
              </div>
              {consoleLogs.length === 0 ? (
                <p className="text-slate-500">No console messages yet. Use console.log(...) in JavaScript and click Run.</p>
              ) : (
                consoleLogs.map((log) => (
                  <div
                    key={log.id}
                    className={
                      log.level === 'error'
                        ? 'text-rose-400'
                        : log.level === 'warn'
                        ? 'text-amber-300'
                        : 'text-emerald-300'
                    }
                  >
                    <span className="text-slate-500 mr-2">{log.timestamp}</span>
                    <span>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Persistent Desktop Live Preview */}
        <div className="hidden lg:block p-3 min-w-0">
          <SandboxPreview
            html={html}
            css={css}
            js={js}
            runTrigger={runTrigger}
            onConsoleLogsChange={setConsoleLogs}
            heightClass={compact ? 'h-[280px]' : 'h-[360px]'}
          />
        </div>
      </div>
    </div>
  );
}
