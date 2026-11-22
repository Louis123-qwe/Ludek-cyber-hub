export interface SandboxConsoleEntry {
  id: string;
  level: 'log' | 'info' | 'warn' | 'error' | 'system';
  message: string;
  timestamp: string;
}

export interface SandboxBuildOptions {
  html: string;
  css: string;
  js: string;
  runToken: string;
  /** Optional test assertions to execute inside the isolated iframe */
  jsAssertions?: { id: string; expression: string; expected: string; description: string; failureFeedback: string }[];
}

/**
 * Generates an isolated HTML document for `<iframe sandbox="allow-scripts">`.
 * Notice `allow-same-origin` is intentionally omitted on the iframe so learner scripts
 * run under an opaque origin and cannot access parent cookies, localStorage, or tokens.
 */
export function buildSandboxedSrcDoc(options: SandboxBuildOptions): string {
  const safeCss = options.css.replace(/<\/style>/gi, '<\\/style>');
  const safeJs = options.js.replace(/<\/script>/gi, '<\\/script>');
  const serializedAssertions = JSON.stringify(options.jsAssertions ?? []);
  const serializedToken = JSON.stringify(options.runToken);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src https: data: blob:; script-src 'unsafe-inline'; connect-src https:;" />
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 16px;
      font-family: system-ui, -apple-system, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.5;
    }
    ${safeCss}
  </style>
</head>
<body>
  ${options.html}
  <script>
    (function() {
      var TOKEN = ${serializedToken};
      function formatArg(val) {
        if (val === undefined) return 'undefined';
        if (val === null) return 'null';
        if (typeof val === 'string') return val;
        if (val instanceof Error) return val.name + ': ' + val.message;
        try { return JSON.stringify(val, null, 2); } catch (e) { return String(val); }
      }
      function emit(level, args) {
        try {
          var text = Array.prototype.slice.call(args).map(formatArg).join(' ');
          window.parent.postMessage({
            source: 'ludek-sandbox',
            token: TOKEN,
            type: 'console',
            level: level,
            message: text
          }, '*');
        } catch (e) {}
      }
      console.log = function() { emit('log', arguments); };
      console.info = function() { emit('info', arguments); };
      console.warn = function() { emit('warn', arguments); };
      console.error = function() { emit('error', arguments); };

      window.addEventListener('error', function(event) {
        emit('error', [event.message + (event.lineno ? ' (line ' + event.lineno + ')' : '')]);
      });
      window.addEventListener('unhandledrejection', function(event) {
        emit('error', ['Unhandled Promise Rejection: ' + formatArg(event.reason)]);
      });

      try {
        ${safeJs}
      } catch (err) {
        emit('error', [err && err.message ? err.name + ': ' + err.message : String(err)]);
      }

      var assertions = ${serializedAssertions};
      if (assertions && assertions.length > 0) {
        var results = assertions.map(function(test) {
          try {
            var fn = new Function('return (' + test.expression + ')');
            var actual = fn();
            var passed = String(actual) === String(test.expected);
            return {
              id: test.id,
              description: test.description,
              passed: passed,
              feedback: passed ? 'Passed' : test.failureFeedback + ' (Got: ' + formatArg(actual) + ')'
            };
          } catch (err) {
            return {
              id: test.id,
              description: test.description,
              passed: false,
              feedback: test.failureFeedback + ' (' + (err && err.message ? err.message : 'Evaluation error') + ')'
            };
          }
        });
        window.parent.postMessage({
          source: 'ludek-sandbox',
          token: TOKEN,
          type: 'test-results',
          results: results
        }, '*');
      }
    })();
  </script>
</body>
</html>`;
}
