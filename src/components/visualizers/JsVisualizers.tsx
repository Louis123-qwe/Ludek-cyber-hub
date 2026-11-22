import React, { useState } from 'react';
import { Play, RotateCcw, StepForward } from 'lucide-react';
import { Button } from '../ui/DesignSystem';

export function JsVariablesVisualizer() {
  const [keyword, setKeyword] = useState<'const' | 'let'>('let');
  const [rawVal, setRawVal] = useState('"Ada Lovelace"');

  const evaluated = (() => {
    const trimmed = rawVal.trim();
    if (trimmed === 'true' || trimmed === 'false') return { type: 'boolean', display: trimmed };
    if (trimmed === 'null') return { type: 'object (null)', display: 'null' };
    if (trimmed === 'undefined' || trimmed === '') return { type: 'undefined', display: 'undefined' };
    if (!Number.isNaN(Number(trimmed)) && !trimmed.startsWith('"') && !trimmed.startsWith("'")) {
      return { type: 'number', display: trimmed };
    }
    return { type: 'string', display: trimmed };
  })();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center text-xs">
        {(['const', 'let'] as const).map((kw) => (
          <button
            key={kw}
            type="button"
            onClick={() => setKeyword(kw)}
            className={`px-3 py-1.5 rounded-md font-mono ${
              keyword === kw ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
            }`}
          >
            {kw}
          </button>
        ))}
        <span className="font-mono text-slate-500">userValue =</span>
        <input
          type="text"
          value={rawVal}
          onChange={(e) => setRawVal(e.target.value)}
          aria-label="Variable value"
          className="flex-1 min-w-[160px] rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1017] px-3 py-1.5 font-mono text-xs"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-[#0B0E14]">
          <p className="text-slate-500">Memory Box</p>
          <p className="mt-1 font-mono font-semibold text-sm">{evaluated.display}</p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-[#0B0E14]">
          <p className="text-slate-500">typeof userValue</p>
          <p className="mt-1 font-mono text-blue-600 dark:text-cyan-400 font-semibold text-sm">"{evaluated.type}"</p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-[#0B0E14]">
          <p className="text-slate-500">Can Reassign?</p>
          <p className="mt-1 font-mono font-semibold text-sm">{keyword === 'let' ? 'Yes (let)' : 'No (const)'}</p>
        </div>
      </div>
    </div>
  );
}

export function JsConditionsVisualizer() {
  const presets = [
    { label: 'Number: 85', val: 85, truthy: true },
    { label: 'Number: 0', val: 0, truthy: false },
    { label: 'String: "hi"', val: '"hi"', truthy: true },
    { label: 'Empty String: ""', val: '""', truthy: false },
    { label: 'null', val: 'null', truthy: false },
    { label: 'Empty Array: []', val: '[]', truthy: true },
  ];
  const [selectedIdx, setSelectedIdx] = useState(0);
  const current = presets[selectedIdx];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {presets.map((p, idx) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setSelectedIdx(idx)}
            className={`px-3 py-1.5 rounded-md text-xs font-mono ${
              selectedIdx === idx ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
        <div
          className={`rounded-lg border p-4 ${
            current.truthy
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
              : 'border-slate-200 dark:border-slate-800 opacity-45'
          }`}
        >
          if (value) &#123; /* RUNS when Truthy */ &#125;
        </div>
        <div
          className={`rounded-lg border p-4 ${
            !current.truthy
              ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300'
              : 'border-slate-200 dark:border-slate-800 opacity-45'
          }`}
        >
          else &#123; /* RUNS when Falsy */ &#125;
        </div>
      </div>
    </div>
  );
}

export function JsLoopsVisualizer() {
  const [step, setStep] = useState(0);
  const maxIterations = 5;
  const i = step === 0 ? 1 : Math.min(step, maxIterations + 1);
  const sum = Array.from({ length: Math.min(step, maxIterations) }, (_, k) => k + 1).reduce((a, b) => a + b, 0);
  const finished = step > maxIterations;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => setStep((s) => Math.min(maxIterations + 1, s + 1))} disabled={finished}>
          <StepForward className="h-3.5 w-3.5" />
          <span>{step === 0 ? 'Start Loop' : finished ? 'Loop Finished' : 'Next Iteration'}</span>
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setStep(0)}>
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-3 text-xs font-mono">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
          <span className="text-slate-500">Counter i</span>
          <p className="text-lg font-bold tabular-nums mt-1">{i}</p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
          <span className="text-slate-500">i &lt;= 5 ?</span>
          <p className={`text-lg font-bold mt-1 ${finished ? 'text-rose-500' : 'text-emerald-500'}`}>
            {finished ? 'false (exit)' : 'true'}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
          <span className="text-slate-500">sum</span>
          <p className="text-lg font-bold tabular-nums mt-1">{sum}</p>
        </div>
      </div>
    </div>
  );
}

export function JsArraysVisualizer() {
  const [items, setItems] = useState([12, 25, 8, 40, 15]);
  const [op, setOp] = useState<'filter' | 'map' | 'reduce'>('filter');

  const result =
    op === 'filter'
      ? JSON.stringify(items.filter((n) => n >= 15))
      : op === 'map'
      ? JSON.stringify(items.map((n) => n * 2))
      : String(items.reduce((acc, n) => acc + n, 0));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => setItems((prev) => [...prev, Math.floor(Math.random() * 50) + 1])}>
          .push(random)
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setItems((prev) => prev.slice(0, -1))} disabled={items.length <= 1}>
          .pop()
        </Button>
        {(['filter', 'map', 'reduce'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setOp(m)}
            className={`px-3 py-1.5 rounded-md text-xs font-mono ${
              op === m ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
            }`}
          >
            .{m}()
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
          <p className="text-slate-500 mb-1">Original Array</p>
          <p>[{items.join(', ')}]</p>
        </div>
        <div className="rounded-lg border border-blue-500/40 bg-blue-500/10 p-3">
          <p className="text-blue-600 dark:text-cyan-400 mb-1">
            {op === 'filter' ? 'items.filter(n => n >= 15)' : op === 'map' ? 'items.map(n => n * 2)' : 'items.reduce((a, b) => a + b, 0)'}
          </p>
          <p className="font-semibold">{result}</p>
        </div>
      </div>
    </div>
  );
}

export function JsEventsVisualizer() {
  const [stopProp, setStopProp] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const handleParent = () => setLog((prev) => [...prev, '2. Parent <div> received bubbled click']);
  const handleChild = (e: React.MouseEvent) => {
    if (stopProp) e.stopPropagation();
    setLog(['1. Child <button> clicked directly' + (stopProp ? ' (stopPropagation blocked parent!)' : '')]);
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" checked={stopProp} onChange={(e) => setStopProp(e.target.checked)} />
        <span>Call <code>event.stopPropagation()</code> on Child Button</span>
      </label>
      <div
        onClick={handleParent}
        className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-[#0B0E14] p-5 cursor-pointer"
      >
        <p className="text-xs font-mono text-slate-500 mb-3">Parent &lt;div&gt; (has click listener)</p>
        <Button size="sm" onClick={handleChild}>
          Click Child &lt;button&gt;
        </Button>
      </div>
      {log.length > 0 && (
        <div className="rounded-lg bg-[#0B0E14] text-emerald-300 font-mono text-xs p-3 space-y-1">
          {log.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export function JsAsyncTimelineVisualizer() {
  const [step, setStep] = useState(0);
  const stages = [
    { stack: ['console.log("1. Start")'], webApi: [], micro: [], macro: [], output: ['1. Start'] },
    { stack: ['setTimeout(cb, 0)'], webApi: ['Timer (0ms)'], micro: [], macro: [], output: ['1. Start'] },
    { stack: ['Promise.resolve().then(cb)'], webApi: [], micro: ['Promise .then()'], macro: ['Timer callback'], output: ['1. Start'] },
    { stack: ['console.log("2. Sync End")'], webApi: [], micro: ['Promise .then()'], macro: ['Timer callback'], output: ['1. Start', '2. Sync End'] },
    { stack: ['Promise .then()'], webApi: [], micro: [], macro: ['Timer callback'], output: ['1. Start', '2. Sync End', '3. Microtask Promise'] },
    { stack: ['Timer callback'], webApi: [], micro: [], macro: [], output: ['1. Start', '2. Sync End', '3. Microtask Promise', '4. Macrotask setTimeout'] },
  ];
  const curr = stages[step];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => setStep((s) => Math.min(stages.length - 1, s + 1))} disabled={step === stages.length - 1}>
          <Play className="h-3.5 w-3.5" />
          <span>Step Event Loop ({step + 1}/{stages.length})</span>
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setStep(0)}>
          Reset
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
          <p className="text-slate-500 mb-1">Call Stack</p>
          <p className="text-blue-500">{curr.stack[0] || '(empty)'}</p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
          <p className="text-slate-500 mb-1">Microtask Queue</p>
          <p className="text-cyan-400">{curr.micro[0] || '(empty)'}</p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
          <p className="text-slate-500 mb-1">Macrotask Queue</p>
          <p className="text-amber-400">{curr.macro[0] || '(empty)'}</p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
          <p className="text-slate-500 mb-1">Console Output</p>
          {curr.output.map((o) => (
            <div key={o} className="text-emerald-400">{o}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
