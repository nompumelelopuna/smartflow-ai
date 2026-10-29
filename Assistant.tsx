import { useEffect, useState } from 'react';
import { api } from '../api';

interface Msg { role: 'user' | 'ai'; text: string }
const prompts = ['What is over ETA?', 'Which orders have no POD?', 'Show orders with no tracking', 'Which orders are not placed?', 'Spend by supplier'];

export default function Assistant() {
  const [mode, setMode] = useState<'demo' | 'live' | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { api.assistantStatus().then(s => setMode(s.mode)); }, []);

  async function send(message: string) {
    if (!message.trim() || busy) return;
    setMsgs(m => [...m, { role: 'user', text: message }]); setText(''); setBusy(true);
    try {
      const r = await api.ask(message);
      setMode(r.mode);
      setMsgs(m => [...m, { role: 'ai', text: r.reply + (r.note ? `\n\n(${r.note})` : '') }]);
    } catch (e) { setMsgs(m => [...m, { role: 'ai', text: `Error: ${(e as Error).message}` }]); }
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">AI assistant</h2>
        {mode && <span className={`rounded-full px-2 py-0.5 text-xs ${mode === 'demo' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
          {mode === 'demo' ? 'Demo mode (no external AI)' : 'Live mode'}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {prompts.map(p => <button key={p} onClick={() => send(p)} className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm hover:bg-slate-100">{p}</button>)}
      </div>
      <div className="min-h-[16rem] space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {!msgs.length && <p className="text-sm text-slate-500">Ask about your orders, or tap a suggestion.</p>}
        {msgs.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
            <p className={`inline-block max-w-full whitespace-pre-wrap rounded-lg px-3 py-2 text-left text-sm ${m.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-100'}`}>{m.text}</p>
          </div>
        ))}
        {busy && <p className="text-sm text-slate-500">Thinking…</p>}
      </div>
      <div className="flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(text)} maxLength={1000}
          placeholder="Ask a question…" className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <button onClick={() => send(text)} className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700">Send</button>
      </div>
    </div>
  );
}
