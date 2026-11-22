import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Lightbulb, Eye, RotateCcw, ArrowUp, ArrowDown, Play } from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { SandboxPreview } from './SandboxPreview';
import { Button } from '../ui/DesignSystem';
import { validateCodeExercise, type ExerciseValidationOutcome } from '../../lib/exerciseValidator';
import { useProgress } from '../../contexts/ProgressContext';
import { useToast } from '../ui/ToastContext';
import type { Exercise } from '../../types/curriculum';

export function ExerciseRunner({ exercise }: { exercise: Exercise }) {
  const { progress, recordExerciseAttempt, recordCodeRun } = useProgress();
  const { showToast } = useToast();

  const saved = progress.exerciseSubmissions[exercise.id];
  const [html, setHtml] = useState(saved?.submittedHtml || exercise.starterHtml);
  const [css, setCss] = useState(saved?.submittedCss || exercise.starterCss);
  const [js, setJs] = useState(saved?.submittedJs || exercise.starterJs);
  const [editorTab, setEditorTab] = useState<'html' | 'css' | 'js'>(
    exercise.starterJs || exercise.solutionJs ? 'js' : exercise.starterCss && !exercise.starterHtml.includes('<!--') ? 'css' : 'html'
  );
  const [runTrigger, setRunTrigger] = useState(1);
  const [hintIndex, setHintIndex] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [checking, setChecking] = useState(false);
  const [outcome, setOutcome] = useState<ExerciseValidationOutcome | null>(null);

  // Non-code exercise state
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [orderedList, setOrderedList] = useState<string[]>(() =>
    exercise.orderedSteps ? [...exercise.orderedSteps].reverse() : []
  );
  const [matchSelections, setMatchSelections] = useState<Record<string, string>>({});

  const isCodeExercise =
    exercise.challengeType === 'write-code' ||
    exercise.challengeType === 'code-completion' ||
    exercise.challengeType === 'find-bug';

  const handleReset = () => {
    setHtml(exercise.starterHtml);
    setCss(exercise.starterCss);
    setJs(exercise.starterJs);
    setOutcome(null);
    setSelectedChoice(null);
    if (exercise.orderedSteps) setOrderedList([...exercise.orderedSteps].reverse());
    setMatchSelections({});
    setRunTrigger((r) => r + 1);
  };

  const handleCheckCode = async () => {
    setChecking(true);
    setRunTrigger((r) => r + 1);
    recordCodeRun();
    const res = await validateCodeExercise(exercise, html, css, js);
    setOutcome(res);
    setChecking(false);

    const unlocked = recordExerciseAttempt({
      exerciseId: exercise.id,
      html,
      css,
      js,
      passed: res.allPassed,
      xpReward: exercise.xpReward,
    });

    if (res.allPassed) {
      showToast({
        title: `Exercise Passed (+${exercise.xpReward} XP)`,
        description: unlocked.length > 0 ? `Unlocked: ${unlocked.join(', ')}` : exercise.title,
        variant: 'success',
      });
    }
  };

  const handleCheckNonCode = () => {
    let passed = false;
    let feedback = '';

    if (exercise.challengeType === 'multiple-choice' || exercise.challengeType === 'predict-output') {
      if (selectedChoice === null) {
        setOutcome({ allPassed: false, results: [], summaryFeedback: 'Select an option before checking your answer.' });
        return;
      }
      passed = selectedChoice === exercise.correctChoiceIndex;
      feedback = passed
        ? `Correct! ${exercise.explanation}`
        : `Not quite right. ${exercise.hints[0] || 'Review the concept breakdown above and try again.'}`;
    } else if (exercise.challengeType === 'order-steps' && exercise.orderedSteps) {
      passed = orderedList.every((step, idx) => step === exercise.orderedSteps![idx]);
      feedback = passed
        ? `Exact order verified! ${exercise.explanation}`
        : 'Some steps are out of order. Think about what must exist before the next step can run.';
    } else if (exercise.challengeType === 'match-concepts' && exercise.matchPairs) {
      passed = exercise.matchPairs.every((pair) => matchSelections[pair.term] === pair.definition);
      feedback = passed
        ? `All pairs matched accurately! ${exercise.explanation}`
        : 'At least one term is paired with the wrong definition. Check your matches and retry.';
    }

    setOutcome({ allPassed: passed, results: [], summaryFeedback: feedback });
    const unlocked = recordExerciseAttempt({
      exerciseId: exercise.id,
      html: '',
      css: '',
      js: '',
      passed,
      xpReward: exercise.xpReward,
    });
    if (passed) {
      showToast({
        title: `Challenge Solved (+${exercise.xpReward} XP)`,
        description: unlocked.length > 0 ? `Unlocked: ${unlocked.join(', ')}` : exercise.title,
        variant: 'success',
      });
    }
  };

  const moveStep = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= orderedList.length) return;
    const copy = [...orderedList];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    setOrderedList(copy);
  };

  return (
    <div
      id="exercise"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11151E] p-5 sm:p-6 space-y-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Guided Exercise</span>
            <span aria-hidden="true">·</span>
            <span>{exercise.difficulty}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">+{exercise.xpReward} XP</span>
            {saved?.passed && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Completed</span>
              </>
            )}
          </div>
          <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{exercise.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </Button>
          {exercise.hints.length > 0 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setHintIndex((h) => Math.min(exercise.hints.length, h + 1))}
            >
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              <span>{hintIndex === 0 ? 'Show Hint' : `Next Hint (${hintIndex}/${exercise.hints.length})`}</span>
            </Button>
          )}
        </div>
      </div>

      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{exercise.instructions}</p>

      {hintIndex > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-1">
          {exercise.hints.slice(0, hintIndex).map((h, i) => (
            <p key={i} className="text-xs text-amber-900 dark:text-amber-200">
              <strong>Hint {i + 1}:</strong> {h}
            </p>
          ))}
        </div>
      )}

      {isCodeExercise ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-1">
                {(['html', 'css', 'js'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setEditorTab(tab)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium uppercase ${
                      editorTab === tab
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {editorTab === 'html' && (
                <CodeEditor value={html} onChange={setHtml} language="html" minHeight="220px" />
              )}
              {editorTab === 'css' && (
                <CodeEditor value={css} onChange={setCss} language="css" minHeight="220px" />
              )}
              {editorTab === 'js' && (
                <CodeEditor value={js} onChange={setJs} language="javascript" minHeight="220px" />
              )}
            </div>
            <SandboxPreview
              html={html}
              css={css}
              js={js}
              runTrigger={runTrigger}
              showViewportControls={false}
              heightClass="h-[235px]"
              title="Exercise Preview"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="primary" onClick={handleCheckCode} disabled={checking}>
                <Play className="h-4 w-4" />
                <span>{checking ? 'Checking...' : 'Check Solution'}</span>
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setRunTrigger((r) => r + 1);
                  recordCodeRun();
                }}
              >
                Run Preview Only
              </Button>
            </div>
            <button
              type="button"
              onClick={() => setShowSolution((s) => !s)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>{showSolution ? 'Hide Solution' : 'Reveal Solution'}</span>
            </button>
          </div>

          {showSolution && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0E14] p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Reference Solution</p>
              {exercise.solutionHtml && (
                <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto">{exercise.solutionHtml}</pre>
              )}
              {exercise.solutionCss && (
                <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto">{exercise.solutionCss}</pre>
              )}
              {exercise.solutionJs && (
                <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto">{exercise.solutionJs}</pre>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {(exercise.challengeType === 'multiple-choice' || exercise.challengeType === 'predict-output') &&
            exercise.choices && (
              <div className="space-y-2">
                {exercise.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedChoice(idx)}
                    className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition-colors ${
                      selectedChoice === idx
                        ? 'border-blue-500 bg-blue-600/10 text-blue-700 dark:text-blue-300 font-medium'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            )}

          {exercise.challengeType === 'order-steps' && (
            <div className="space-y-2">
              {orderedList.map((step, idx) => (
                <div
                  key={step}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0E14] px-4 py-2.5 text-sm"
                >
                  <span className="font-mono text-xs text-slate-500 mr-2">{idx + 1}.</span>
                  <span className="flex-1">{step}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveStep(idx, -1)}
                      disabled={idx === 0}
                      aria-label="Move step up"
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStep(idx, 1)}
                      disabled={idx === orderedList.length - 1}
                      aria-label="Move step down"
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {exercise.challengeType === 'match-concepts' && exercise.matchPairs && (
            <div className="space-y-3">
              {exercise.matchPairs.map((pair) => (
                <div
                  key={pair.term}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center rounded-lg border border-slate-200 dark:border-slate-800 p-3"
                >
                  <span className="font-mono text-sm font-medium">{pair.term}</span>
                  <select
                    aria-label={`Select definition for ${pair.term}`}
                    value={matchSelections[pair.term] || ''}
                    onChange={(e) =>
                      setMatchSelections((prev) => ({ ...prev, [pair.term]: e.target.value }))
                    }
                    className="min-h-[42px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1017] px-3 text-sm"
                  >
                    <option value="">Choose matching definition...</option>
                    {exercise.matchPairs!.map((opt) => (
                      <option key={opt.definition} value={opt.definition}>
                        {opt.definition}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <Button variant="primary" onClick={handleCheckNonCode}>
            Check Answer
          </Button>
        </div>
      )}

      {outcome && (
        <div
          className={`rounded-lg border p-4 space-y-2 ${
            outcome.allPassed
              ? 'border-emerald-500/40 bg-emerald-500/10'
              : 'border-rose-500/40 bg-rose-500/10'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {outcome.allPassed ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            )}
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {outcome.summaryFeedback}
            </p>
          </div>
          {outcome.results.length > 0 && (
            <ul className="space-y-1 pl-7 text-xs">
              {outcome.results.map((r) => (
                <li
                  key={r.id}
                  className={r.passed ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}
                >
                  {r.passed ? 'PASS' : 'NEEDS FIX'} — {r.description}: {r.feedback}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
