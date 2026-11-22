import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ClipboardCheck, RotateCcw, XCircle } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Button, SurfaceCard } from '../components/ui/DesignSystem';
import { useToast } from '../components/ui/ToastContext';
import { useProgress } from '../contexts/ProgressContext';
import { getQuizById } from '../data/curriculum';

function shuffleQuestions<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = seed + 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = s % (i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

export function AssessmentPage() {
  const { quizId = '' } = useParams();
  const entry = getQuizById(quizId);
  const { progress, recordQuizAttempt } = useProgress();
  const { showToast } = useToast();

  const [attemptNonce, setAttemptNonce] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submittedResult, setSubmittedResult] = useState<{
    scorePercent: number;
    passed: boolean;
    correctCount: number;
    total: number;
  } | null>(null);

  const orderedQuestions = useMemo(() => {
    if (!entry) return [];
    return shuffleQuestions(entry.quiz.questions, attemptNonce + entry.quiz.id.length);
  }, [entry, attemptNonce]);

  if (!entry) {
    return (
      <AppShell breadcrumbs={[{ label: 'Curriculum', to: '/curriculum' }, { label: 'Assessment Not Found' }]}>
        <SurfaceCard className="p-8 text-center space-y-4">
          <h1 className="text-xl font-bold">Assessment Not Found</h1>
          <p className="text-sm text-slate-500">That module assessment ID could not be located.</p>
          <Link to="/curriculum">
            <Button>Back to Curriculum</Button>
          </Link>
        </SurfaceCard>
      </AppShell>
    );
  }

  const { quiz, module, path } = entry;
  const pastAttempts = progress.quizAttempts.filter((a) => a.quizId === quiz.id);
  const allAnswered = orderedQuestions.every((q) => typeof selectedAnswers[q.id] === 'number');
  const firstLesson = module.lessons[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allAnswered) {
      showToast({
        title: 'Answer Every Question',
        description: 'Please select an answer for every question before submitting.',
        variant: 'error',
      });
      return;
    }

    const total = orderedQuestions.length;
    const correctCount = orderedQuestions.reduce(
      (acc, q) => (selectedAnswers[q.id] === q.correctOptionIndex ? acc + 1 : acc),
      0
    );
    const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const passed = scorePercent >= quiz.passingScorePercent;

    const unlocked = recordQuizAttempt({
      quizId: quiz.id,
      scorePercent,
      passed,
      answers: selectedAnswers,
      xpReward: quiz.xpReward,
    });

    setSubmittedResult({ scorePercent, passed, correctCount, total });
    showToast({
      title: passed ? `Assessment Passed (${scorePercent}%)` : `Score: ${scorePercent}% — Review & Retry`,
      description:
        unlocked.length > 0
          ? `Achievement Unlocked: ${unlocked.join(', ')}`
          : passed
          ? `Passing score is ${quiz.passingScorePercent}%.`
          : `You need ${quiz.passingScorePercent}% to pass.`,
      variant: passed ? 'success' : 'info',
    });
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setSubmittedResult(null);
    setAttemptNonce((n) => n + 1);
  };

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Curriculum', to: '/curriculum' },
        { label: path.title, to: `/curriculum?path=${path.id}` },
        { label: quiz.title },
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <SurfaceCard className="p-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>{module.title}</span>
            <span className="font-mono tabular-nums">
              Pass: {quiz.passingScorePercent}% · +{quiz.xpReward} XP
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <ClipboardCheck className="h-6 w-6 text-blue-500 shrink-0" />
            <span>{quiz.title}</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">{quiz.description}</p>
        </SurfaceCard>

        {submittedResult && (
          <SurfaceCard className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                {submittedResult.passed ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-6 w-6 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {submittedResult.passed ? 'Assessment Passed' : 'Needs Review'}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-mono tabular-nums">
                    Score: {submittedResult.correctCount}/{submittedResult.total} ({submittedResult.scorePercent}% — Required {quiz.passingScorePercent}%)
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={handleRetry}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Retry Shuffled Quiz</span>
                </Button>
                {firstLesson && (
                  <Link to={`/learn/${firstLesson.id}`}>
                    <Button size="sm" variant="primary">
                      <span>Return to Module</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </SurfaceCard>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {orderedQuestions.map((q, qIdx) => {
            const picked = selectedAnswers[q.id];
            const isSubmitted = submittedResult !== null;
            const isCorrect = picked === q.correctOptionIndex;

            return (
              <SurfaceCard key={q.id} className="p-5 sm:p-6 space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-mono tabular-nums text-slate-500">
                    Question {qIdx + 1} of {orderedQuestions.length}
                  </p>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white leading-snug">
                    {q.prompt}
                  </h2>
                  {q.codeSnippet && (
                    <pre className="rounded-lg bg-[#0D1017] text-slate-100 p-3.5 text-xs font-mono overflow-x-auto border border-slate-800">
                      <code>{q.codeSnippet}</code>
                    </pre>
                  )}
                </div>

                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const selected = picked === optIdx;
                    let borderClass =
                      'border-slate-200 dark:border-slate-800 hover:border-blue-500/60';
                    if (isSubmitted) {
                      if (optIdx === q.correctOptionIndex) {
                        borderClass = 'border-emerald-500 bg-emerald-500/10';
                      } else if (selected && optIdx !== q.correctOptionIndex) {
                        borderClass = 'border-rose-500 bg-rose-500/10';
                      }
                    } else if (selected) {
                      borderClass = 'border-blue-600 bg-blue-600/10';
                    }

                    return (
                      <label
                        key={optIdx}
                        className={`flex items-center gap-3 min-h-[44px] rounded-lg border px-4 py-2.5 text-sm cursor-pointer transition-colors ${borderClass}`}
                      >
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          checked={selected}
                          disabled={isSubmitted}
                          onChange={() =>
                            setSelectedAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                          }
                        />
                        <span className="text-slate-800 dark:text-slate-200">{opt}</span>
                      </label>
                    );
                  })}
                </div>

                {isSubmitted && (
                  <div
                    className={`rounded-lg border p-3.5 text-xs ${
                      isCorrect
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
                        : 'border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-200'
                    }`}
                  >
                    <p className="font-semibold mb-1">
                      {isCorrect ? 'Correct' : `Correct answer: ${q.options[q.correctOptionIndex]}`}
                    </p>
                    <p>{q.explanation}</p>
                  </div>
                )}
              </SurfaceCard>
            );
          })}

          {!submittedResult && (
            <div className="flex items-center justify-between gap-4 pt-2">
              <p className="text-xs text-slate-500 font-mono tabular-nums">
                {Object.keys(selectedAnswers).length}/{orderedQuestions.length} answered
              </p>
              <Button type="submit" size="lg">
                Submit Assessment
              </Button>
            </div>
          )}
        </form>

        {pastAttempts.length > 0 && (
          <SurfaceCard className="p-5 space-y-3">
            <h3 className="text-sm font-semibold">Previous Attempts</h3>
            <ul className="space-y-2 text-xs">
              {pastAttempts.slice(0, 5).map((att) => (
                <li
                  key={att.id}
                  className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/70 pb-1.5"
                >
                  <span className="text-slate-600 dark:text-slate-400">
                    {new Date(att.createdAt).toLocaleString()}
                  </span>
                  <span
                    className={`font-mono tabular-nums font-medium ${
                      att.passed ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  >
                    {att.scorePercent}% ({att.passed ? 'Passed' : 'Retry'})
                  </span>
                </li>
              ))}
            </ul>
          </SurfaceCard>
        )}
      </div>
    </AppShell>
  );
}
