import React, { useMemo, useState } from 'react';
import { Button } from '../ui/DesignSystem';

export function DomTreeVisualizer() {
  const [nodes, setNodes] = useState([
    { id: 'h1', tag: 'h1', text: 'Ludek Tech Hub' },
    { id: 'p1', tag: 'p', text: 'Every tag becomes a node in memory.' },
  ]);
  const [selectedId, setSelectedId] = useState('h1');
  const [newTag, setNewTag] = useState<'h2' | 'p' | 'button'>('p');
  const [newText, setNewText] = useState('New child element');

  const addNode = () => {
    if (!newText.trim()) return;
    const id = `${newTag}_${Date.now()}`;
    setNodes((prev) => [...prev, { id, tag: newTag, text: newText.trim() }]);
    setSelectedId(id);
    setNewText('');
  };

  const selected = nodes.find((n) => n.id === selectedId) || nodes[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0E14] p-4 space-y-2 font-mono text-xs">
          <div className="text-slate-500">document</div>
          <div className="pl-4 text-slate-500">└── &lt;html&gt;</div>
          <div className="pl-8 text-slate-500">└── &lt;body&gt;</div>
          <div className="pl-12 space-y-1.5">
            {nodes.map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() => setSelectedId(node.id)}
                className={`block w-full text-left px-2.5 py-1.5 rounded border transition-colors ${
                  selected?.id === node.id
                    ? 'border-blue-500 bg-blue-600/15 text-blue-600 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                &lt;{node.tag}&gt; <span className="opacity-75">"{node.text}"</span> &lt;/{node.tag}&gt;
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-3">
          <p className="text-xs font-medium text-slate-500">Selected DOM Node Inspector</p>
          {selected && (
            <div className="text-sm space-y-1">
              <p>
                <strong>Tag Name:</strong> <code className="font-mono">&lt;{selected.tag}&gt;</code>
              </p>
              <p>
                <strong>Parent Node:</strong> <code className="font-mono">&lt;body&gt;</code>
              </p>
              <p>
                <strong>textContent:</strong> "{selected.text}"
              </p>
            </div>
          )}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2">
            <select
              aria-label="Choose HTML tag to append"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value as 'h2' | 'p' | 'button')}
              className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1017] px-2 py-1.5 text-xs"
            >
              <option value="h2">&lt;h2&gt;</option>
              <option value="p">&lt;p&gt;</option>
              <option value="button">&lt;button&gt;</option>
            </select>
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Text inside tag..."
              className="flex-1 min-w-[120px] rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1017] px-2.5 py-1.5 text-xs"
            />
            <Button size="sm" onClick={addNode}>
              Append Node
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SemanticBuilderVisualizer() {
  const [regions, setRegions] = useState({
    header: true,
    nav: true,
    main: true,
    aside: true,
    footer: true,
  });

  const toggle = (key: keyof typeof regions) =>
    setRegions((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(regions) as (keyof typeof regions)[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            className={`px-3 py-1.5 rounded-md text-xs font-mono border transition-colors ${
              regions[key]
                ? 'border-blue-500 bg-blue-600/15 text-blue-600 dark:text-blue-300'
                : 'border-slate-300 dark:border-slate-700 text-slate-500'
            }`}
          >
            &lt;{key}&gt;: {regions[key] ? 'ON' : 'OFF'}
          </button>
        ))}
      </div>
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-2 bg-slate-50 dark:bg-[#0B0E14] font-mono text-xs">
        {regions.header && (
          <div className="rounded border border-blue-500/40 bg-blue-500/10 p-3">
            &lt;header&gt; Top Site Banner
            {regions.nav && (
              <div className="mt-2 rounded border border-cyan-500/40 bg-cyan-500/10 p-2">
                &lt;nav&gt; Home · Curriculum · Projects
              </div>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {regions.main && (
            <div className={`${regions.aside ? 'sm:col-span-2' : 'sm:col-span-3'} rounded border border-emerald-500/40 bg-emerald-500/10 p-4`}>
              &lt;main&gt; Primary Unique Page Content (&lt;article&gt;)
            </div>
          )}
          {regions.aside && (
            <div className="rounded border border-amber-500/40 bg-amber-500/10 p-4">
              &lt;aside&gt; Related Links
            </div>
          )}
        </div>
        {regions.footer && (
          <div className="rounded border border-slate-400/40 bg-slate-500/10 p-3">
            &lt;footer&gt; Copyright &amp; Legal Links
          </div>
        )}
      </div>
    </div>
  );
}

export function FormBuilderVisualizer() {
  const [inputType, setInputType] = useState<'email' | 'text' | 'number' | 'date'>('email');
  const [required, setRequired] = useState(true);
  const [value, setValue] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const testSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(`Valid ${inputType} input submitted: "${value || '(empty)'}"`);
  };

  return (
    <form onSubmit={testSubmit} className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs font-medium flex items-center gap-2">
          Input type:
          <select
            value={inputType}
            onChange={(e) => {
              setInputType(e.target.value as 'email' | 'text' | 'number' | 'date');
              setMessage(null);
            }}
            className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1017] px-2 py-1 text-xs"
          >
            <option value="email">email</option>
            <option value="text">text</option>
            <option value="number">number</option>
            <option value="date">date</option>
          </select>
        </label>
        <label className="text-xs font-medium flex items-center gap-2">
          <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} />
          <span>required attribute</span>
        </label>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type={inputType}
          required={required}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`Test ${inputType} input...`}
          className="flex-1 min-h-[42px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1017] px-3 text-sm"
        />
        <Button type="submit" size="sm">Test Native Validation</Button>
      </div>
      <pre className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#0B0E14] p-3 rounded-lg overflow-x-auto">
        {`<label for="demo">Field</label>\n<input id="demo" type="${inputType}"${required ? ' required' : ''} />`}
      </pre>
      {message && <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{message}</p>}
    </form>
  );
}

export function BoxModelVisualizer() {
  const [contentW, setContentW] = useState(180);
  const [padding, setPadding] = useState(20);
  const [border, setBorder] = useState(4);
  const [margin, setMargin] = useState(16);
  const [boxSizing, setBoxSizing] = useState<'border-box' | 'content-box'>('border-box');

  const totalRenderedWidth =
    boxSizing === 'border-box' ? contentW : contentW + padding * 2 + border * 2;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-3">
          <div className="flex gap-2">
            {(['border-box', 'content-box'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setBoxSizing(mode)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono ${
                  boxSizing === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          {[
            { label: `Declared width: ${contentW}px`, val: contentW, min: 120, max: 260, set: setContentW },
            { label: `Padding: ${padding}px`, val: padding, min: 0, max: 40, set: setPadding },
            { label: `Border: ${border}px`, val: border, min: 0, max: 14, set: setBorder },
            { label: `Margin: ${margin}px`, val: margin, min: 0, max: 36, set: setMargin },
          ].map((ctrl) => (
            <label key={ctrl.label} className="block text-xs space-y-1">
              <span className="font-mono text-slate-700 dark:text-slate-300">{ctrl.label}</span>
              <input
                type="range"
                min={ctrl.min}
                max={ctrl.max}
                value={ctrl.val}
                onChange={(e) => ctrl.set(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </label>
          ))}
          <p className="text-xs font-mono text-blue-600 dark:text-cyan-400 tabular-nums">
            Total visible box width (excl. margin): {totalRenderedWidth}px
          </p>
        </div>

        <div className="flex items-center justify-center rounded-xl bg-slate-100 dark:bg-[#0B0E14] p-6 overflow-auto min-h-[220px]">
          <div
            style={{ padding: `${margin}px` }}
            className="border border-dashed border-amber-500/70 bg-amber-500/10 rounded"
          >
            <div
              style={{
                width: `${contentW}px`,
                padding: `${padding}px`,
                borderWidth: `${border}px`,
                boxSizing,
              }}
              className="border-solid border-blue-500 bg-emerald-500/15 text-center transition-all duration-150"
            >
              <div className="bg-white dark:bg-[#11151E] py-3 px-2 text-xs font-mono rounded">
                Content
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FlexboxVisualizer() {
  const [direction, setDirection] = useState<'row' | 'column'>('row');
  const [justify, setJustify] = useState<'flex-start' | 'center' | 'space-between' | 'space-around'>('space-between');
  const [align, setAlign] = useState<'stretch' | 'flex-start' | 'center' | 'flex-end'>('center');
  const [gap, setGap] = useState(12);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <label className="space-y-1">
          <span className="text-slate-500">flex-direction</span>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as 'row' | 'column')}
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1017] p-2"
          >
            <option value="row">row</option>
            <option value="column">column</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-slate-500">justify-content</span>
          <select
            value={justify}
            onChange={(e) => setJustify(e.target.value as typeof justify)}
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1017] p-2"
          >
            <option value="flex-start">flex-start</option>
            <option value="center">center</option>
            <option value="space-between">space-between</option>
            <option value="space-around">space-around</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-slate-500">align-items</span>
          <select
            value={align}
            onChange={(e) => setAlign(e.target.value as typeof align)}
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1017] p-2"
          >
            <option value="stretch">stretch</option>
            <option value="flex-start">flex-start</option>
            <option value="center">center</option>
            <option value="flex-end">flex-end</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-slate-500 font-mono">gap: {gap}px</span>
          <input
            type="range"
            min={0}
            max={32}
            value={gap}
            onChange={(e) => setGap(Number(e.target.value))}
            className="w-full accent-blue-600 mt-2"
          />
        </label>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: direction,
          justifyContent: justify,
          alignItems: align,
          gap: `${gap}px`,
        }}
        className="min-h-[160px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0E14] p-4"
      >
        {['Item 1', 'Item 2', 'Item 3'].map((label) => (
          <div
            key={label}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-mono font-semibold text-white"
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function GridVisualizer() {
  const [cols, setCols] = useState(3);
  const [gap, setGap] = useState(12);
  const [spanFirst, setSpanFirst] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <label className="flex items-center gap-2 font-mono">
          Columns: {cols}
          <input
            type="range"
            min={1}
            max={4}
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
            className="accent-blue-600"
          />
        </label>
        <label className="flex items-center gap-2 font-mono">
          Gap: {gap}px
          <input
            type="range"
            min={4}
            max={28}
            value={gap}
            onChange={(e) => setGap(Number(e.target.value))}
            className="accent-blue-600"
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={spanFirst}
            onChange={(e) => setSpanFirst(e.target.checked)}
          />
          <span>Span Box 1 across 2 columns</span>
        </label>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: `${gap}px`,
        }}
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0E14] p-4"
      >
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            style={n === 1 && spanFirst && cols > 1 ? { gridColumn: 'span 2' } : undefined}
            className={`rounded-lg border px-3 py-4 text-center text-xs font-mono ${
              n === 1
                ? 'border-blue-500 bg-blue-600/20 text-blue-600 dark:text-blue-300 font-semibold'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#141923]'
            }`}
          >
            Box {n}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PositioningVisualizer() {
  const [mode, setMode] = useState<'static' | 'relative' | 'absolute' | 'sticky'>('absolute');
  const [topOffset, setTopOffset] = useState(16);
  const [leftOffset, setLeftOffset] = useState(24);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {(['static', 'relative', 'absolute', 'sticky'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 rounded-md font-mono ${
              mode === m
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            position: {m}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 text-xs font-mono">
        <label>
          top: {topOffset}px
          <input type="range" min={0} max={80} value={topOffset} onChange={(e) => setTopOffset(Number(e.target.value))} className="w-full accent-blue-600" />
        </label>
        <label>
          left: {leftOffset}px
          <input type="range" min={0} max={140} value={leftOffset} onChange={(e) => setLeftOffset(Number(e.target.value))} className="w-full accent-blue-600" />
        </label>
      </div>
      <div className="relative h-44 overflow-y-auto rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0E14] p-4">
        <div
          style={{
            position: mode,
            top: mode === 'static' ? undefined : `${topOffset}px`,
            left: mode === 'static' ? undefined : `${leftOffset}px`,
          }}
          className="inline-block rounded-lg bg-blue-600 px-3 py-2 text-xs font-mono text-white shadow z-10"
        >
          Target ({mode})
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Parent container uses <code>position: relative</code>. Scroll inside this box to observe how <code>sticky</code> stays pinned compared to <code>absolute</code> or <code>static</code>.
        </p>
        <div className="h-36" />
      </div>
    </div>
  );
}

function relativeLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const toLin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

export function ColorContrastVisualizer() {
  const [fg, setFg] = useState('#F8FAFC');
  const [bg, setBg] = useState('#0F172A');

  const ratio = useMemo(() => {
    const l1 = relativeLuminance(fg);
    const l2 = relativeLuminance(bg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
  }, [fg, bg]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
      <div className="space-y-3 text-xs">
        <label className="flex items-center justify-between gap-3">
          <span>Text Color ({fg})</span>
          <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-9 w-16 rounded cursor-pointer" />
        </label>
        <label className="flex items-center justify-between gap-3">
          <span>Background Color ({bg})</span>
          <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-9 w-16 rounded cursor-pointer" />
        </label>
        <div className="font-mono text-sm tabular-nums">
          Contrast Ratio: <strong>{ratio}:1</strong> ·{' '}
          <span className={ratio >= 4.5 ? 'text-emerald-500' : 'text-rose-500'}>
            {ratio >= 7 ? 'WCAG AAA Pass' : ratio >= 4.5 ? 'WCAG AA Pass' : 'Fails AA (< 4.5:1)'}
          </span>
        </div>
      </div>
      <div style={{ backgroundColor: bg, color: fg }} className="rounded-xl p-6 border border-slate-700/40">
        <h4 className="text-base font-bold">Accessible Contrast Preview</h4>
        <p className="mt-1 text-sm">Readable text ensures every learner can study comfortably.</p>
      </div>
    </div>
  );
}

export function TypographyVisualizer() {
  const [size, setSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [measure, setMeasure] = useState(60);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
        <label>
          font-size: {size}px
          <input type="range" min={12} max={24} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-blue-600" />
        </label>
        <label>
          line-height: {lineHeight}
          <input type="range" min={1.0} max={2.2} step={0.1} value={lineHeight} onChange={(e) => setLineHeight(Number(e.target.value))} className="w-full accent-blue-600" />
        </label>
        <label>
          max-width: {measure}ch
          <input type="range" min={30} max={90} value={measure} onChange={(e) => setMeasure(Number(e.target.value))} className="w-full accent-blue-600" />
        </label>
      </div>
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0E14] p-5">
        <p style={{ fontSize: `${size}px`, lineHeight, maxWidth: `${measure}ch` }}>
          Great web typography balances font size, generous vertical line height, and comfortable line width so readers never lose their place when scanning back to the left edge.
        </p>
      </div>
    </div>
  );
}

export function ResponsiveBreakpointsVisualizer() {
  const [width, setWidth] = useState(375);

  const activeBp =
    width >= 1024 ? 'lg (>= 1024px) · 3 Columns' : width >= 640 ? 'sm/md (>= 640px) · 2 Columns' : 'Base Mobile (< 640px) · 1 Column';

  const cols = width >= 1024 ? 3 : width >= 640 ? 2 : 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex-1 min-w-[220px] text-xs font-mono space-y-1">
          <span>Simulated Viewport Width: {width}px</span>
          <input
            type="range"
            min={320}
            max={1200}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
        </label>
        <div className="flex gap-1.5">
          {[375, 768, 1080].map((preset) => (
            <Button key={preset} size="sm" variant="secondary" onClick={() => setWidth(preset)}>
              {preset}px
            </Button>
          ))}
        </div>
      </div>
      <p className="text-xs font-mono text-blue-600 dark:text-cyan-400">{activeBp}</p>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0B0E14] p-4">
        <div
          style={{ width: `${width}px`, maxWidth: '100%', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          className="grid gap-3 rounded-lg border border-blue-500/40 bg-white dark:bg-[#11151E] p-3 mx-auto transition-all duration-150"
        >
          {['Card A', 'Card B', 'Card C'].map((c) => (
            <div key={c} className="rounded bg-slate-100 dark:bg-slate-800 p-3 text-xs font-mono text-center">
              {c}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
