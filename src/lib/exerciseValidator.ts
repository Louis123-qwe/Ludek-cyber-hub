import type { Exercise, ExerciseTestRule } from '../types/curriculum';
import { buildSandboxedSrcDoc } from './sandbox';

export interface ExerciseTestResult {
  id: string;
  description: string;
  passed: boolean;
  feedback: string;
}

export interface ExerciseValidationOutcome {
  allPassed: boolean;
  results: ExerciseTestResult[];
  summaryFeedback: string;
}

function evaluateStaticRule(
  rule: ExerciseTestRule,
  html: string,
  css: string
): ExerciseTestResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<!doctype html><html><body>${html}</body></html>`, 'text/html');

  switch (rule.assertionType) {
    case 'dom-exists': {
      const el = doc.querySelector(rule.target);
      const passed = el !== null;
      return {
        id: rule.id,
        description: rule.description,
        passed,
        feedback: passed ? 'Element found.' : rule.failureFeedback,
      };
    }
    case 'dom-text': {
      const el = doc.querySelector(rule.target);
      if (!el) {
        return {
          id: rule.id,
          description: rule.description,
          passed: false,
          feedback: `Missing <${rule.target}> element. ${rule.failureFeedback}`,
        };
      }
      const normalizedActual = (el.textContent || '').trim().toLowerCase();
      const normalizedExpected = rule.expected.trim().toLowerCase();
      const passed = normalizedActual.includes(normalizedExpected) && normalizedActual.length > 0;
      return {
        id: rule.id,
        description: rule.description,
        passed,
        feedback: passed
          ? 'Text content matches expectation.'
          : `${rule.failureFeedback} (Found "${(el.textContent || '').trim() || 'empty'}")`,
      };
    }
    case 'dom-attr': {
      const [selector, attr] = rule.target.split('@');
      const el = doc.querySelector(selector);
      if (!el) {
        return {
          id: rule.id,
          description: rule.description,
          passed: false,
          feedback: `Element "${selector}" not found. ${rule.failureFeedback}`,
        };
      }
      const attrVal = el.getAttribute(attr) ?? '';
      const passed =
        rule.expected === '*'
          ? attrVal.trim().length > 0
          : attrVal.trim().toLowerCase().includes(rule.expected.trim().toLowerCase());
      return {
        id: rule.id,
        description: rule.description,
        passed,
        feedback: passed ? `Attribute "${attr}" verified.` : rule.failureFeedback,
      };
    }
    case 'css-contains': {
      const cleanCss = css.replace(/\s+/g, ' ').toLowerCase();
      const regex = new RegExp(rule.expected, 'i');
      const passed = regex.test(cleanCss);
      return {
        id: rule.id,
        description: rule.description,
        passed,
        feedback: passed ? 'CSS rule verified.' : rule.failureFeedback,
      };
    }
    case 'html-regex': {
      const regex = new RegExp(rule.expected, 'i');
      const passed = regex.test(html);
      return {
        id: rule.id,
        description: rule.description,
        passed,
        feedback: passed ? 'Markup pattern verified.' : rule.failureFeedback,
      };
    }
    default:
      return {
        id: rule.id,
        description: rule.description,
        passed: false,
        feedback: rule.failureFeedback,
      };
  }
}

/**
 * Validates HTML/CSS statically via inert DOMParser, and executes any JS assertions
 * strictly inside a temporary sandboxed iframe (`allow-scripts` only, no `allow-same-origin`).
 */
export async function validateCodeExercise(
  exercise: Exercise,
  html: string,
  css: string,
  js: string
): Promise<ExerciseValidationOutcome> {
  const staticRules = exercise.tests.filter((t) => t.assertionType !== 'js-eval');
  const jsRules = exercise.tests.filter((t) => t.assertionType === 'js-eval');

  const staticResults = staticRules.map((rule) => evaluateStaticRule(rule, html, css));

  let jsResults: ExerciseTestResult[] = [];
  if (jsRules.length > 0) {
    jsResults = await runJsAssertionsInSandbox(html, css, js, jsRules);
  }

  const combined = [...staticResults, ...jsResults];
  const allPassed = combined.length > 0 && combined.every((r) => r.passed);
  const passedCount = combined.filter((r) => r.passed).length;

  return {
    allPassed,
    results: combined,
    summaryFeedback: allPassed
      ? `All ${combined.length} checks passed. ${exercise.explanation}`
      : `${passedCount} of ${combined.length} checks passed. Review the feedback below and try again.`,
  };
}

function runJsAssertionsInSandbox(
  html: string,
  css: string,
  js: string,
  jsRules: ExerciseTestRule[]
): Promise<ExerciseTestResult[]> {
  return new Promise((resolve) => {
    const token = `val_${Math.random().toString(36).slice(2)}`;
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.style.display = 'none';

    let settled = false;
    const timeout = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(
        jsRules.map((r) => ({
          id: r.id,
          description: r.description,
          passed: false,
          feedback: 'Execution timed out inside the sandbox. Check for infinite loops.',
        }))
      );
    }, 2500);

    function onMessage(event: MessageEvent) {
      if (event.source !== iframe.contentWindow) return;
      const data = event.data;
      if (!data || data.source !== 'ludek-sandbox' || data.token !== token) return;
      if (data.type === 'test-results' && Array.isArray(data.results)) {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(data.results as ExerciseTestResult[]);
      }
    }

    function cleanup() {
      window.clearTimeout(timeout);
      window.removeEventListener('message', onMessage);
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }

    window.addEventListener('message', onMessage);
    iframe.srcdoc = buildSandboxedSrcDoc({
      html,
      css,
      js,
      runToken: token,
      jsAssertions: jsRules.map((r) => ({
        id: r.id,
        expression: r.target,
        expected: r.expected,
        description: r.description,
        failureFeedback: r.failureFeedback,
      })),
    });
    document.body.appendChild(iframe);
  });
}
