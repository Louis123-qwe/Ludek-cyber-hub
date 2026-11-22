import React, { useState } from 'react';
import { Globe, Play, RotateCcw, Send, Terminal } from 'lucide-react';
import { Button } from '../ui/DesignSystem';

const URL_STAGES = [
  { id: 1, title: 'URL Parsing', detail: 'Browser splits protocol (https), host (ludek.dev), port (443), and path (/courses).' },
  { id: 2, title: 'DNS Lookup', detail: 'Browser checks local cache, then asks a DNS Resolver to locate the domain.' },
  { id: 3, title: 'IP Address Resolution', detail: 'DNS returns server IPv4/IPv6 address (e.g. 104.21.48.192).' },
  { id: 4, title: 'TCP Connection', detail: 'Client and server complete the 3-way TCP handshake (SYN -> SYN-ACK -> ACK).' },
  { id: 5, title: 'TLS Handshake', detail: 'Server presents its SSL/TLS certificate; encrypted session keys are negotiated.' },
  { id: 6, title: 'HTTP Request', detail: 'Browser transmits GET /courses HTTP/1.1 with Accept and User-Agent headers.' },
  { id: 7, title: 'Server Processing', detail: 'Web server routes the request, checks auth/cache, and prepares HTML or JSON.' },
  { id: 8, title: 'HTTP Response', detail: 'Server replies with status 200 OK, Content-Type headers, and HTML body.' },
  { id: 9, title: 'Browser Parsing', detail: 'Browser tokenizes HTML into the DOM tree and CSS into the CSSOM tree.' },
  { id: 10, title: 'Rendering & Paint', detail: 'Layout calculates element boxes; Paint draws pixels onto screen layers.' },
  { id: 11, title: 'Page Interactive', detail: 'JavaScript executes, attaches event listeners, and the user can click and type.' },
];

export function UrlLifecycleVisualizer() {
  const [url, setUrl] = useState('https://ludektech.dev/courses');
  const [activeStage, setActiveStage] = useState(0);

  let parsedHost = 'ludektech.dev';
  let parsedPath = '/courses';
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    parsedHost = u.hostname;
    parsedPath = u.pathname || '/';
  } catch {
    // keep default
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1017] px-3">
          <Globe className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            aria-label="Simulate URL"
            className="w-full py-2 bg-transparent font-mono text-xs focus:outline-none"
          />
        </div>
        <Button size="sm" onClick={() => setActiveStage((s) => Math.min(URL_STAGES.length - 1, s + 1))}>
          <Play className="h-3.5 w-3.5" />
          <span>Next Stage</span>
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setActiveStage(0)}>
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-1.5">
        {URL_STAGES.map((stage, idx) => (
          <button
            key={stage.id}
            type="button"
            onClick={() => setActiveStage(idx)}
            className={`text-left rounded-lg border p-2 text-[11px] transition-colors ${
              idx === activeStage
                ? 'border-blue-500 bg-blue-600/15 text-blue-600 dark:text-blue-300 font-semibold'
                : idx < activeStage
                ? 'border-emerald-500/40 bg-emerald-500/5 text-slate-700 dark:text-slate-300'
                : 'border-slate-200 dark:border-slate-800 text-slate-500'
            }`}
          >
            <span className="font-mono">{stage.id}.</span> {stage.title}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0E14] p-4 space-y-1.5">
        <p className="text-sm font-semibold">
          Stage {URL_STAGES[activeStage].id}: {URL_STAGES[activeStage].title}
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {URL_STAGES[activeStage].detail}
        </p>
        <p className="text-[11px] font-mono text-blue-500 pt-1">
          Host: {parsedHost} · Path: {parsedPath} · Port: 443 (HTTPS)
        </p>
      </div>
    </div>
  );
}

export function DnsLookupVisualizer() {
  const records: Record<string, { ip: string; ttl: number; ns: string }> = {
    'ludektech.dev': { ip: '104.21.48.192', ttl: 300, ns: 'ns1.ludekdns.net' },
    'developer.mozilla.org': { ip: '34.117.65.55', ttl: 600, ns: 'ns-cloud.googledomains.com' },
    'github.com': { ip: '140.82.121.4', ttl: 60, ns: 'dns1.p08.nsone.net' },
  };
  const [domain, setDomain] = useState('ludektech.dev');
  const info = records[domain] || { ip: '93.184.216.34', ttl: 300, ns: 'ns1.exampledns.org' };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value.toLowerCase())}
          aria-label="Domain name to resolve"
          className="flex-1 min-w-[200px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1017] px-3 py-2 font-mono text-xs"
        />
        {Object.keys(records).map((d) => (
          <Button key={d} size="sm" variant="secondary" onClick={() => setDomain(d)}>
            {d}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
          <p className="text-slate-500">1. Recursive Resolver</p>
          <p className="mt-1">Query: {domain}</p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
          <p className="text-slate-500">2. Root &amp; TLD</p>
          <p className="mt-1">.{domain.split('.').pop() || 'dev'} Registry</p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
          <p className="text-slate-500">3. Authoritative NS</p>
          <p className="mt-1 truncate">{info.ns}</p>
        </div>
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3">
          <p className="text-emerald-600 dark:text-emerald-400">4. A Record Result</p>
          <p className="mt-1 font-bold">{info.ip} (TTL {info.ttl}s)</p>
        </div>
      </div>
    </div>
  );
}

export function HttpBuilderVisualizer() {
  const [method, setMethod] = useState<'GET' | 'POST' | 'PATCH' | 'DELETE'>('GET');
  const [endpoint, setEndpoint] = useState('/api/courses');
  const [body, setBody] = useState('{\n  "title": "Responsive Grids"\n}');
  const [response, setResponse] = useState<{ status: string; payload: string } | null>(null);

  const sendSimulated = () => {
    if (endpoint.includes('admin')) {
      setResponse({
        status: '403 Forbidden',
        payload: JSON.stringify({ error: 'Admin role required for this endpoint.' }, null, 2),
      });
      return;
    }
    if (endpoint.includes('missing')) {
      setResponse({
        status: '404 Not Found',
        payload: JSON.stringify({ error: 'Resource does not exist.' }, null, 2),
      });
      return;
    }
    if (method === 'POST') {
      setResponse({
        status: '201 Created',
        payload: JSON.stringify({ created: true, endpoint, received: body.slice(0, 80) }, null, 2),
      });
    } else if (method === 'DELETE') {
      setResponse({ status: '200 OK', payload: JSON.stringify({ deleted: true, endpoint }, null, 2) });
    } else {
      setResponse({
        status: '200 OK',
        payload: JSON.stringify({ ok: true, method, items: ['HTML', 'CSS', 'JavaScript'] }, null, 2),
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as typeof method)}
          aria-label="HTTP Method"
          className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1017] px-3 py-2 font-mono text-xs"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
        </select>
        <input
          type="text"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          aria-label="Endpoint path"
          className="flex-1 min-w-[180px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1017] px-3 py-2 font-mono text-xs"
        />
        <Button size="sm" onClick={sendSimulated}>
          <Send className="h-3.5 w-3.5" />
          <span>Send Request</span>
        </Button>
      </div>
      {(method === 'POST' || method === 'PATCH') && (
        <textarea
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1017] p-3 font-mono text-xs"
        />
      )}
      {response && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-[#0B0E14] p-4 font-mono text-xs text-slate-200 space-y-2">
          <div className="text-cyan-400 font-semibold">HTTP/1.1 {response.status}</div>
          <pre className="overflow-x-auto text-emerald-300">{response.payload}</pre>
        </div>
      )}
    </div>
  );
}

export function ClientServerVisualizer() {
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [hits, setHits] = useState(0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={cacheEnabled} onChange={(e) => setCacheEnabled(e.target.checked)} />
          <span>Enable CDN Edge Cache</span>
        </label>
        <Button size="sm" onClick={() => setHits((h) => h + 1)}>
          Request /styles.css
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
          <p className="text-slate-500">Browser Client</p>
          <p className="mt-1">Requests: {hits}</p>
        </div>
        <div className={`rounded-lg border p-3 ${cacheEnabled && hits > 1 ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-200 dark:border-slate-800'}`}>
          <p className="text-slate-500">CDN Cache</p>
          <p className="mt-1">{hits === 0 ? 'Idle' : cacheEnabled && hits > 1 ? 'CACHE HIT (12ms)' : 'MISS -> Forward'}</p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
          <p className="text-slate-500">Origin Server</p>
          <p className="mt-1">Served: {cacheEnabled ? (hits > 0 ? 1 : 0) : hits}</p>
        </div>
      </div>
    </div>
  );
}

export function GitPlaygroundVisualizer() {
  const [initialized, setInitialized] = useState(false);
  const [workingFiles, setWorkingFiles] = useState<string[]>(['index.html']);
  const [stagedFiles, setStagedFiles] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>(['main']);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [commits, setCommits] = useState<{ hash: string; msg: string; branch: string }[]>([]);
  const [pushedCount, setPushedCount] = useState(0);
  const [cmdInput, setCmdInput] = useState('');
  const [terminalLog, setTerminalLog] = useState<string[]>([
    'Try: git init, touch app.js, git status, git add ., git commit -m "first", git branch ui, git checkout ui, git push',
  ]);

  const runCommand = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    const out: string[] = [`$ ${cmd}`];

    if (cmd === 'git init') {
      setInitialized(true);
      out.push('Initialized empty Git repository in .git/');
    } else if (cmd.startsWith('touch ')) {
      const file = cmd.slice(6).trim();
      if (file && !workingFiles.includes(file)) {
        setWorkingFiles((prev) => [...prev, file]);
        out.push(`Created ${file} in working directory.`);
      }
    } else if (!initialized) {
      out.push('fatal: not a git repository. Run "git init" first.');
    } else if (cmd === 'git status') {
      out.push(`On branch ${currentBranch}`);
      out.push(`Working files: ${workingFiles.join(', ') || 'none'}`);
      out.push(`Staged for commit: ${stagedFiles.join(', ') || 'none'}`);
    } else if (cmd === 'git add .') {
      setStagedFiles([...workingFiles]);
      out.push(`Staged ${workingFiles.length} file(s).`);
    } else if (cmd.startsWith('git add ')) {
      const target = cmd.slice(8).trim();
      if (workingFiles.includes(target)) {
        setStagedFiles((prev) => (prev.includes(target) ? prev : [...prev, target]));
        out.push(`Staged ${target}.`);
      } else {
        out.push(`pathspec '${target}' did not match any files.`);
      }
    } else if (cmd.startsWith('git commit')) {
      if (stagedFiles.length === 0) {
        out.push('nothing to commit (run "git add ." first)');
      } else {
        const msgMatch = cmd.match(/-m\s+["']([^"']+)["']/);
        const msg = msgMatch ? msgMatch[1] : 'Snapshot commit';
        const hash = Math.random().toString(16).slice(2, 9);
        setCommits((prev) => [{ hash, msg, branch: currentBranch }, ...prev]);
        setStagedFiles([]);
        out.push(`[${currentBranch} ${hash}] ${msg}`);
      }
    } else if (cmd.startsWith('git branch ')) {
      const br = cmd.slice(11).trim();
      if (br && !branches.includes(br)) {
        setBranches((prev) => [...prev, br]);
        out.push(`Created branch '${br}'.`);
      }
    } else if (cmd.startsWith('git checkout ')) {
      const br = cmd.slice(13).trim();
      if (branches.includes(br)) {
        setCurrentBranch(br);
        out.push(`Switched to branch '${br}'`);
      } else {
        out.push(`error: branch '${br}' does not exist. Create it with git branch ${br}.`);
      }
    } else if (cmd.startsWith('git push')) {
      setPushedCount(commits.length);
      out.push(`Pushed ${commits.length} commit(s) on ${currentBranch} to origin/${currentBranch}.`);
    } else if (cmd === 'git log') {
      if (commits.length === 0) out.push('No commits yet.');
      else commits.forEach((c) => out.push(`${c.hash} (${c.branch}) ${c.msg}`));
    } else {
      out.push('Supported commands: git init, touch <file>, git status, git add ., git commit -m "msg", git branch <name>, git checkout <name>, git log, git push');
    }

    setTerminalLog((prev) => [...prev.slice(-10), ...out]);
    setCmdInput('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
          <p className="text-slate-500">Working Tree ({initialized ? 'Git Active' : 'Not Init'})</p>
          <p className="mt-1">{workingFiles.join(', ')}</p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
          <p className="text-slate-500">Staging Area</p>
          <p className="mt-1 text-amber-500">{stagedFiles.join(', ') || '(empty)'}</p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
          <p className="text-slate-500">Branch: {currentBranch} (Pushed: {pushedCount})</p>
          <p className="mt-1 text-emerald-500">{commits.length} local commit(s)</p>
        </div>
      </div>

      <div className="rounded-xl bg-[#0B0E14] border border-slate-800 p-3 font-mono text-xs space-y-2">
        <div className="flex items-center gap-2 text-slate-400 pb-2 border-b border-slate-800">
          <Terminal className="h-3.5 w-3.5" />
          <span>Simulated Git Shell</span>
        </div>
        <div className="max-h-40 overflow-y-auto space-y-1 text-slate-200">
          {terminalLog.map((line, i) => (
            <div key={i} className={line.startsWith('$') ? 'text-cyan-400' : 'text-slate-300'}>
              {line}
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runCommand(cmdInput);
          }}
          className="flex gap-2 pt-2 border-t border-slate-800"
        >
          <input
            type="text"
            value={cmdInput}
            onChange={(e) => setCmdInput(e.target.value)}
            placeholder='Type a command (e.g. git init)...'
            className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <Button type="submit" size="sm">Run</Button>
        </form>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {['git init', 'touch app.js', 'git add .', 'git commit -m "Add app"', 'git push'].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => runCommand(q)}
              className="px-2 py-1 rounded bg-slate-800 text-[11px] text-slate-300 hover:bg-slate-700"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
