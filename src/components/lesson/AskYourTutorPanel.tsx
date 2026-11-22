import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '../ui/DesignSystem';
import type { Exercise, Lesson } from '../../types/curriculum';

interface TutorMessage {
  id: string;
  sender: 'learner' | 'tutor';
  text: string;
  code?: string;
}

function generateContextualTutorResponse(
  prompt: string,
  lesson: Lesson,
  exercise?: Exercise
): { text: string; code?: string } {
  const q = prompt.toLowerCase();

  if (q.includes('simpler') || q.includes('simple')) {
    const firstStep = lesson.breakItDownSteps[0];
    return {
      text: `Let us strip away all jargon for "${lesson.title}": ${
        firstStep?.plainExplanation || lesson.intro
      }${firstStep?.analogy ? ` Think of it this way: ${firstStep.analogy}` : ''}`,
    };
  }

  if (q.includes('line by line') || q.includes('explain this code')) {
    const stepWithCode = lesson.breakItDownSteps.find((s) => s.codeSnippet);
    if (stepWithCode?.codeSnippet) {
      const lines = stepWithCode.codeSnippet.split('\n');
      const breakdown = lines
        .map((line, i) => `Line ${i + 1}: "${line.trim()}" — ${i === 0 ? 'Sets up the opening rule/tag.' : 'Supplies content or closing structure.'}`)
        .join(' ');
      return {
        text: `${stepWithCode.plainExplanation} ${breakdown}`,
        code: stepWithCode.codeSnippet,
      };
    }
    return {
      text: `Here is the key pattern from this lesson: ${lesson.summary}`,
    };
  }

  if (q.includes('example')) {
    const stepWithCode = lesson.breakItDownSteps.find((s) => s.codeSnippet);
    return {
      text: stepWithCode?.whyItMatters || `Here is a clean, minimal example for ${lesson.title}:`,
      code: stepWithCode?.codeSnippet || exercise?.solutionHtml || exercise?.solutionCss || exercise?.solutionJs,
    };
  }

  if (q.includes('hint')) {
    if (exercise && exercise.hints.length > 0) {
      return {
        text: `Exercise Hint for "${exercise.title}": ${exercise.hints.join(' ')}`,
      };
    }
    return {
      text: `Key Focus: ${lesson.keyTakeaways[0] || lesson.summary}`,
    };
  }

  if (q.includes('failing') || q.includes('error') || q.includes('bug')) {
    const common = lesson.commonMistakes[0];
    if (common) {
      return {
        text: `Most beginners hit this issue here: "${common.mistake}". Why it happens: ${common.whyItHappens} How to fix it: ${common.fix}`,
      };
    }
    return {
      text: 'Check for three frequent issues: (1) unclosed tags or missing semicolons, (2) mismatched quotes or spelling in selectors/IDs, and (3) forgot to click Check Solution after editing.',
    };
  }

  if (q.includes('test') || q.includes('understanding')) {
    return {
      text: `Quick Check on "${lesson.title}": Before moving on, can you explain in one sentence: ${
        lesson.objectives[0] || lesson.summary
      } Try answering or completing the Guided Exercise below to verify!`,
    };
  }

  // Glossary keyword match
  const matchedGlossary = lesson.glossaryTerms?.find((g) => q.includes(g.term.toLowerCase()));
  if (matchedGlossary) {
    return {
      text: `${matchedGlossary.term}: ${matchedGlossary.plainDefinition}`,
    };
  }

  return {
    text: `In "${lesson.title}", remember: ${lesson.summary} Key takeaway: ${
      lesson.keyTakeaways[0] || lesson.intro
    }`,
  };
}

export function AskYourTutorPanel({
  lesson,
  exercise,
}: {
  lesson: Lesson;
  exercise?: Exercise;
}) {
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      id: 'welcome',
      sender: 'tutor',
      text: `I am your built-in Curriculum Tutor for "${lesson.title}". Pick a quick question below or ask about any term in this lesson.`,
    },
  ]);
  const [input, setInput] = useState('');

  const suggestedQuestions = [
    'Explain this more simply.',
    'Explain this code line by line.',
    'Give me an example.',
    'Give me a hint.',
    'Why is my code failing?',
    'Test my understanding.',
  ];

  const ask = (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed) return;
    const reply = generateContextualTutorResponse(trimmed, lesson, exercise);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), sender: 'learner', text: trimmed },
      { id: crypto.randomUUID(), sender: 'tutor', text: reply.text, code: reply.code },
    ]);
    setInput('');
  };

  return (
    <aside
      aria-label="Ask Your Tutor Panel"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11151E] p-5 space-y-4"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Ask Your Tutor</h3>
        </div>
        <span className="text-[11px] text-slate-500">Contextual Curriculum Guide</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {suggestedQuestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => ask(q)}
            className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0D1017] px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="max-h-72 overflow-y-auto space-y-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0E14] p-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-lg p-3 text-xs leading-relaxed ${
              m.sender === 'learner'
                ? 'ml-6 bg-blue-600 text-white'
                : 'mr-4 bg-white dark:bg-[#141923] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
            }`}
          >
            <p>{m.text}</p>
            {m.code && (
              <pre className="mt-2 rounded bg-[#07090D] p-2.5 font-mono text-[11px] text-slate-100 overflow-x-auto">
                <code>{m.code}</code>
              </pre>
            )}
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this lesson..."
          aria-label="Ask your tutor a question"
          className="flex-1 min-h-[40px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1017] px-3 text-xs"
        />
        <Button type="submit" size="sm" aria-label="Send question">
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </aside>
  );
}
