import React, { useEffect, useRef } from 'react';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { bracketMatching, indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { useTheme } from '../../contexts/ThemeContext';

interface CodeEditorProps {
  value: string;
  onChange: (next: string) => void;
  language: 'html' | 'css' | 'javascript';
  minHeight?: string;
  readOnly?: boolean;
  ariaLabel?: string;
}

export function CodeEditor({
  value,
  onChange,
  language,
  minHeight = '260px',
  readOnly = false,
  ariaLabel,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const langCompartment = useRef(new Compartment());
  const themeCompartment = useRef(new Compartment());
  const { theme } = useTheme();

  const getLanguageExt = (lang: 'html' | 'css' | 'javascript') => {
    if (lang === 'html') return html();
    if (lang === 'css') return css();
    return javascript();
  };

  const getThemeExt = (mode: 'dark' | 'light') => {
    if (mode === 'dark') {
      return [
        oneDark,
        EditorView.theme(
          {
            '&': { backgroundColor: '#0B0E14', fontSize: '13.5px' },
            '.cm-gutters': { backgroundColor: '#0B0E14', borderRight: '1px solid #1E293B', color: '#64748B' },
          },
          { dark: true }
        ),
      ];
    }
    return [
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      EditorView.theme({
        '&': { backgroundColor: '#FFFFFF', color: '#0F172A', fontSize: '13.5px' },
        '.cm-gutters': { backgroundColor: '#F8FAFC', borderRight: '1px solid #E2E8F0', color: '#64748B' },
      }),
    ];
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        bracketMatching(),
        indentOnInput(),
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        EditorView.lineWrapping,
        EditorState.readOnly.of(readOnly),
        langCompartment.current.of(getLanguageExt(language)),
        themeCompartment.current.of(getThemeExt(theme)),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
        EditorView.contentAttributes.of({
          'aria-label': ariaLabel || `${language.toUpperCase()} code editor`,
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Initialize once on mount; external prop updates synced below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: langCompartment.current.reconfigure(getLanguageExt(language)),
    });
  }, [language]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: themeCompartment.current.reconfigure(getThemeExt(theme)),
    });
  }, [theme]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (value !== current) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      style={{ minHeight }}
      className="w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 [&_.cm-editor]:min-h-[260px] [&_.cm-editor]:outline-none [&_.cm-scroller]:font-mono"
    />
  );
}
