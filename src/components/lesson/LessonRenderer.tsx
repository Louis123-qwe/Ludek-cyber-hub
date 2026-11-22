import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, AlertTriangle, Lightbulb } from 'lucide-react';
import { VisualizerRegistry } from '../visualizers/VisualizerRegistry';
import type { LessonBlock } from '../../types/curriculum';

function RenderFormattedParagraphs({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-2.5 text-sm sm:text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
      {lines.map((line, i) => {
        if (!line.trim()) return null;
        // Safe inline bold/code formatting without raw innerHTML
        const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
        return (
          <p key={i}>
            {parts.map((part, idx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={idx} className="font-semibold text-slate-900 dark:text-white">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              if (part.startsWith('`') && part.endsWith('`')) {
                return (
                  <code
                    key={idx}
                    className="rounded bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[13px] text-blue-700 dark:text-cyan-300"
                  >
                    {part.slice(1, -1)}
                  </code>
                );
              }
              return <React.Fragment key={idx}>{part}</React.Fragment>;
            })}
          </p>
        );
      })}
    </div>
  );
}

function TabsBlock({
  title,
  tabs,
}: {
  title: string;
  tabs: { label: string; body: string; code?: string; language?: string }[];
}) {
  const [active, setActive] = useState(0);
  const curr = tabs[active];
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11151E] overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 px-4 py-3 bg-slate-50 dark:bg-[#0D1017]">
        <span className="text-sm font-semibold text-slate-900 dark:text-white">{title}</span>
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab, idx) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActive(idx)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                active === idx
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{curr.body}</p>
        {curr.code && (
          <pre className="rounded-lg bg-[#0B0E14] border border-slate-800 p-3 font-mono text-xs text-slate-100 overflow-x-auto">
            <code>{curr.code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}

function RevealBlock({
  prompt,
  answerTitle,
  answerBody,
  code,
}: {
  prompt: string;
  answerTitle: string;
  answerBody: string;
  code?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11151E] p-4 space-y-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <span className="text-sm font-semibold text-slate-900 dark:text-white">{prompt}</span>
        {open ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
      </button>
      {open && (
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <p className="text-xs font-semibold text-blue-600 dark:text-cyan-400">{answerTitle}</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">{answerBody}</p>
          {code && (
            <pre className="rounded-lg bg-[#0B0E14] p-3 font-mono text-xs text-slate-100 overflow-x-auto">
              <code>{code}</code>
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export function LessonRenderer({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'markdown':
            return (
              <div key={index} className="space-y-2.5">
                {block.heading && (
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {block.heading}
                  </h3>
                )}
                <RenderFormattedParagraphs text={block.body} />
              </div>
            );
          case 'callout':
            return (
              <div
                key={index}
                className={`rounded-xl border p-4 flex items-start gap-3 ${
                  block.variant === 'warning'
                    ? 'border-amber-500/30 bg-amber-500/10'
                    : block.variant === 'tip'
                    ? 'border-emerald-500/30 bg-emerald-500/10'
                    : 'border-blue-500/30 bg-blue-500/10'
                }`}
              >
                {block.variant === 'warning' ? (
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                ) : block.variant === 'tip' ? (
                  <Lightbulb className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{block.title}</p>
                  <RenderFormattedParagraphs text={block.body} />
                </div>
              </div>
            );
          case 'code':
            return (
              <div
                key={index}
                className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-[#0D1017] border-b border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{block.title}</span>
                  <span className="font-mono text-slate-500 uppercase">{block.language}</span>
                </div>
                <pre className="bg-[#0B0E14] p-4 font-mono text-xs sm:text-sm text-slate-100 overflow-x-auto">
                  <code>{block.code}</code>
                </pre>
                {block.caption && (
                  <p className="px-4 py-2 text-xs text-slate-500 bg-slate-50 dark:bg-[#0D1017]">
                    {block.caption}
                  </p>
                )}
              </div>
            );
          case 'tabs':
            return <TabsBlock key={index} title={block.title} tabs={block.tabs} />;
          case 'reveal':
            return (
              <RevealBlock
                key={index}
                prompt={block.prompt}
                answerTitle={block.answerTitle}
                answerBody={block.answerBody}
                code={block.code}
              />
            );
          case 'visualizer':
            return (
              <div
                key={index}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11151E] p-5 space-y-3"
              >
                <div>
                  <p className="text-xs font-medium text-blue-600 dark:text-cyan-400">
                    Interactive Visualizer
                  </p>
                  <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                    {block.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {block.description}
                  </p>
                </div>
                <VisualizerRegistry id={block.visualizerId} />
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
