import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Monitor, Smartphone, Tablet, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import { buildSandboxedSrcDoc, type SandboxConsoleEntry } from '../../lib/sandbox';

interface SandboxPreviewProps {
  html: string;
  css: string;
  js: string;
  runTrigger: number;
  title?: string;
  showViewportControls?: boolean;
  onConsoleLogsChange?: (logs: SandboxConsoleEntry[]) => void;
  heightClass?: string;
}

export function SandboxPreview({
  html,
  css,
  js,
  runTrigger,
  title = 'Live Output',
  showViewportControls = true,
  onConsoleLogsChange,
  heightClass = 'h-[320px] sm:h-[380px]',
}: SandboxPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [fullscreen, setFullscreen] = useState(false);
  const [logs, setLogs] = useState<SandboxConsoleEntry[]>([]);

  const runToken = useMemo(() => `run_${runTrigger}_${Math.random().toString(36).slice(2, 8)}`, [runTrigger]);

  const srcDoc = useMemo(() => {
    return buildSandboxedSrcDoc({
      html,
      css,
      js,
      runToken,
    });
  }, [html, css, js, runToken]);

  useEffect(() => {
    setLogs([]);
  }, [runToken]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data;
      if (!data || data.source !== 'ludek-sandbox' || data.token !== runToken) return;
      if (data.type === 'console') {
        const entry: SandboxConsoleEntry = {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          level: data.level || 'log',
          message: String(data.message ?? ''),
          timestamp: new Date().toLocaleTimeString(),
        };
        setLogs((prev) => {
          const next = [...prev.slice(-49), entry];
          onConsoleLogsChange?.(next);
          return next;
        });
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [runToken, onConsoleLogsChange]);

  const frameWidth =
    viewportMode === 'mobile' ? '375px' : viewportMode === 'tablet' ? '768px' : '100%';

  return (
    <div
      className={`${
        fullscreen
          ? 'fixed inset-0 z-50 flex flex-col bg-white dark:bg-[#090B10] p-4'
          : 'flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0C0F16] overflow-hidden'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11151E] px-3 py-2">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{title}</span>
        <div className="flex items-center gap-1.5">
          {showViewportControls && (
            <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800/80 p-0.5">
              <button
                type="button"
                onClick={() => setViewportMode('mobile')}
                title="Mobile viewport (375px)"
                aria-label="Mobile viewport 375px"
                className={`p-1.5 rounded-md ${
                  viewportMode === 'mobile'
                    ? 'bg-white dark:bg-[#1E293B] text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewportMode('tablet')}
                title="Tablet viewport (768px)"
                aria-label="Tablet viewport 768px"
                className={`p-1.5 rounded-md ${
                  viewportMode === 'tablet'
                    ? 'bg-white dark:bg-[#1E293B] text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                <Tablet className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewportMode('desktop')}
                title="Desktop viewport (100%)"
                aria-label="Desktop full width viewport"
                className={`p-1.5 rounded-md ${
                  viewportMode === 'desktop'
                    ? 'bg-white dark:bg-[#1E293B] text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setFullscreen((f) => !f)}
            aria-label={fullscreen ? 'Exit fullscreen preview' : 'Fullscreen preview'}
            className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <div
        className={`flex-1 flex justify-center overflow-auto bg-slate-200/70 dark:bg-[#07090D] p-2 sm:p-3 ${
          fullscreen ? 'min-h-0' : heightClass
        }`}
      >
        <iframe
          ref={iframeRef}
          key={runToken}
          title={title}
          sandbox="allow-scripts"
          srcDoc={srcDoc}
          style={{ width: frameWidth, maxWidth: '100%' }}
          className="h-full rounded-lg border border-slate-300 dark:border-slate-800 bg-white transition-all duration-200"
        />
      </div>

      {logs.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-[#0B0E14] px-3 py-2 max-h-32 overflow-y-auto">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono text-slate-400">Console Output ({logs.length})</span>
            <button
              type="button"
              onClick={() => setLogs([])}
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
            >
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          </div>
          <div className="space-y-1 font-mono text-xs">
            {logs.map((entry) => (
              <div
                key={entry.id}
                className={
                  entry.level === 'error'
                    ? 'text-rose-400'
                    : entry.level === 'warn'
                    ? 'text-amber-300'
                    : 'text-emerald-300'
                }
              >
                <span className="text-slate-500 mr-2">[{entry.level}]</span>
                <span>{entry.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
