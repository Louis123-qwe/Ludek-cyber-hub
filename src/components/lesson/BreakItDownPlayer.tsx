import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Button, ProgressBar } from '../ui/DesignSystem';
import type { BreakItDownStep } from '../../types/curriculum';

interface BreakItDownPlayerProps {
  steps: BreakItDownStep[];
  completedStepNumbers: number[];
  onStepCompleted: (stepNumber: number) => void;
  defaultDepth?: 'beginner' | 'deeper';
}

export function BreakItDownPlayer({
  steps,
  completedStepNumbers,
  onStepCompleted,
  defaultDepth = 'beginner',
}: BreakItDownPlayerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [depth, setDepth] = useState<'beginner' | 'deeper'>(defaultDepth);
  const [autoPlay, setAutoPlay] = useState(false);

  const currentStep = steps[activeIndex];

  useEffect(() => {
    if (currentStep) {
      onStepCompleted(currentStep.stepNumber);
    }
  }, [activeIndex, currentStep, onStepCompleted]);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => {
        if (prev >= steps.length - 1) {
          setAutoPlay(false);
          return prev;
        }
        return prev + 1;
      });
    }, 6500);
    return () => window.clearInterval(timer);
  }, [autoPlay, steps.length]);

  if (!currentStep) return null;

  return (
    <section
      aria-label="Break It Down Slow Learning Mode"
      className="rounded-xl border border-blue-500/30 bg-white dark:bg-[#11151E] p-5 sm:p-6 space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-blue-600 dark:text-cyan-400">
            Break It Down · Slow Learning Mode
          </p>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-0.5">
            Step {currentStep.stepNumber} of {steps.length}: {currentStep.title}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800/80 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setDepth('beginner')}
              className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap ${
                depth === 'beginner'
                  ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Simpler
            </button>
            <button
              type="button"
              onClick={() => setDepth('deeper')}
              className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap ${
                depth === 'deeper'
                  ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Deeper
            </button>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => setAutoPlay((p) => !p)}
            aria-label={autoPlay ? 'Pause auto pacing' : 'Start auto pacing'}
          >
            {autoPlay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{autoPlay ? 'Pause' : 'Auto-Pace'}</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setAutoPlay(false);
              setActiveIndex(0);
            }}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Replay</span>
          </Button>
        </div>
      </div>

      <ProgressBar
        value={activeIndex + 1}
        max={steps.length}
        label={`Step ${activeIndex + 1} of ${steps.length}`}
      />

      {/* Step completion indicators */}
      <div className="flex flex-wrap gap-1.5">
        {steps.map((s, idx) => {
          const done = completedStepNumbers.includes(s.stepNumber);
          const active = idx === activeIndex;
          return (
            <button
              key={s.stepNumber}
              type="button"
              onClick={() => {
                setAutoPlay(false);
                setActiveIndex(idx);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : done
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {done && <CheckCircle2 className="h-3 w-3" />}
              <span>Step {s.stepNumber}</span>
            </button>
          );
        })}
      </div>

      {/* Step Explanation Body */}
      <div className="space-y-4 rounded-xl bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 p-5">
        <p className="text-base text-slate-900 dark:text-slate-100 leading-relaxed">
          {currentStep.plainExplanation}
        </p>

        {depth === 'deeper' && currentStep.deeperExplanation && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs font-semibold text-blue-600 dark:text-cyan-400 mb-1">
              Under the Hood
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentStep.deeperExplanation}
            </p>
          </div>
        )}

        {currentStep.analogy && (
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3.5">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Everyday Analogy</p>
            <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">{currentStep.analogy}</p>
          </div>
        )}

        {currentStep.codeSnippet && (
          <pre className="rounded-lg bg-[#07090D] border border-slate-800 p-4 font-mono text-xs sm:text-sm text-slate-100 overflow-x-auto">
            <code>{currentStep.codeSnippet}</code>
          </pre>
        )}

        {(currentStep.whatIfMissing || currentStep.whyItMatters) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {currentStep.whatIfMissing && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  What happens if it is missing?
                </p>
                <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {currentStep.whatIfMissing}
                </p>
              </div>
            )}
            {currentStep.whyItMatters && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Why this matters in real development
                </p>
                <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {currentStep.whyItMatters}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pacing Controls */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          disabled={activeIndex === 0}
          onClick={() => {
            setAutoPlay(false);
            setActiveIndex((i) => Math.max(0, i - 1));
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous Step</span>
        </Button>

        <Button
          variant="primary"
          disabled={activeIndex >= steps.length - 1}
          onClick={() => {
            setAutoPlay(false);
            setActiveIndex((i) => Math.min(steps.length - 1, i + 1));
          }}
        >
          <span>{activeIndex >= steps.length - 1 ? 'All Steps Reviewed' : 'Next Step'}</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
