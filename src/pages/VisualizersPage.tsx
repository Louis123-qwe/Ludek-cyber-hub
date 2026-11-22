import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { SurfaceCard } from '../components/ui/DesignSystem';
import { VisualizerRegistry } from '../components/visualizers/VisualizerRegistry';
import type { VisualizerId } from '../types/curriculum';

const VISUALIZER_CATALOG: {
  id: VisualizerId;
  category: 'HTML' | 'CSS' | 'JavaScript' | 'Networking' | 'Git';
  title: string;
  description: string;
}[] = [
  { id: 'dom-tree', category: 'HTML', title: 'DOM Tree Explorer', description: 'Inspect parent-child HTML tag trees and append new DOM nodes live.' },
  { id: 'semantic-builder', category: 'HTML', title: 'Semantic Structure Builder', description: 'Toggle header, nav, main, aside, and footer landmarks.' },
  { id: 'form-builder', category: 'HTML', title: 'Accessible Form Tester', description: 'Test input types and native browser constraint validation.' },
  { id: 'box-model', category: 'CSS', title: 'Box Model Explorer', description: 'Manipulate content, padding, border, margin, and box-sizing.' },
  { id: 'flexbox', category: 'CSS', title: 'Flexbox Playground', description: 'Control flex-direction, justify-content, align-items, and gap.' },
  { id: 'grid', category: 'CSS', title: 'CSS Grid Playground', description: 'Adjust column tracks, gaps, and multi-column item spans.' },
  { id: 'positioning', category: 'CSS', title: 'Positioning & Z-Index', description: 'Compare static, relative, absolute, and sticky behavior.' },
  { id: 'color-contrast', category: 'CSS', title: 'WCAG Color Contrast Picker', description: 'Calculate exact AA/AAA contrast ratios between foreground and background.' },
  { id: 'typography', category: 'CSS', title: 'Typography & Measure', description: 'Experiment with font size, line-height, and ch reading width.' },
  { id: 'responsive-breakpoints', category: 'CSS', title: 'Responsive Breakpoints', description: 'Resize a simulated viewport from 320px phone to 1200px desktop.' },
  { id: 'js-variables', category: 'JavaScript', title: 'Variable & Data Type Box', description: 'Compare const vs let mutability and inspect typeof results.' },
  { id: 'js-conditions', category: 'JavaScript', title: 'Condition & Truthy/Falsy', description: 'Test 0, "", null, and [] through if/else branches.' },
  { id: 'js-loops', category: 'JavaScript', title: 'Loop Step-by-Step Tracer', description: 'Watch loop counters and running sums change iteration by iteration.' },
  { id: 'js-arrays', category: 'JavaScript', title: 'Array Methods (.map/.filter/.reduce)', description: 'Push/pop items and observe functional transformations.' },
  { id: 'js-events', category: 'JavaScript', title: 'Event Bubbling Simulator', description: 'Trigger nested DOM clicks and test event.stopPropagation().' },
  { id: 'js-async', category: 'JavaScript', title: 'Async Event Loop Timeline', description: 'Step through Call Stack, Promise Microtasks, and Timer Macrotasks.' },
  { id: 'url-lifecycle', category: 'Networking', title: '11-Stage URL-to-Website Simulator', description: 'Follow every stage from URL parsing and DNS to TLS and rendering.' },
  { id: 'dns-lookup', category: 'Networking', title: 'DNS Resolution Simulator', description: 'Trace domain names through Resolver, Root, TLD, and A Records.' },
  { id: 'http-builder', category: 'Networking', title: 'HTTP Request Builder', description: 'Construct GET/POST/PATCH/DELETE requests and inspect responses.' },
  { id: 'client-server', category: 'Networking', title: 'Client-Server & CDN Cache', description: 'Observe cache hits vs origin server fetches.' },
  { id: 'git-playground', category: 'Git', title: 'Interactive Git Terminal', description: 'Run git init, add, commit, branch, checkout, log, and push.' },
];

export function VisualizersPage() {
  const [category, setCategory] = useState<'ALL' | 'HTML' | 'CSS' | 'JavaScript' | 'Networking' | 'Git'>('ALL');
  const [activeId, setActiveId] = useState<VisualizerId>('url-lifecycle');

  const filtered =
    category === 'ALL'
      ? VISUALIZER_CATALOG
      : VISUALIZER_CATALOG.filter((v) => v.category === category);

  const activeMeta = VISUALIZER_CATALOG.find((v) => v.id === activeId) || VISUALIZER_CATALOG[0];

  return (
    <AppShell breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Interactive Visualizers' }]}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              Interactive Visual Explainers &amp; Simulators
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              See abstract web concepts in motion—manipulate sliders, simulate network lifecycles, and run Git commands safely.
            </p>
          </div>
          <div className="flex flex-wrap gap-1 rounded-lg bg-slate-200/70 dark:bg-[#11151E] border border-slate-200 dark:border-slate-800 p-1 text-xs">
            {(['ALL', 'HTML', 'CSS', 'JavaScript', 'Networking', 'Git'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap ${
                  category === cat ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveId(item.id)}
                className={`w-full text-left rounded-xl border p-3.5 transition-colors ${
                  activeId === item.id
                    ? 'border-blue-500 bg-blue-600/10'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11151E] hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <p className="text-[11px] font-mono text-blue-600 dark:text-cyan-400">{item.category}</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{item.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.description}</p>
              </button>
            ))}
          </div>

          <SurfaceCard className="lg:col-span-8 p-5 sm:p-6 space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <p className="text-xs font-mono text-blue-600 dark:text-cyan-400">{activeMeta.category}</p>
              <h2 className="font-display text-xl font-bold">{activeMeta.title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activeMeta.description}</p>
            </div>
            <VisualizerRegistry id={activeId} />
          </SurfaceCard>
        </div>
      </div>
    </AppShell>
  );
}
