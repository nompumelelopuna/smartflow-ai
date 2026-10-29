import { useEffect, useState } from 'react';
import { api, setUnauthorizedHandler } from './api';
import Assistant from './pages/Assistant';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Orders from './pages/Orders';
import Reports from './pages/Reports';
import Suppliers from './pages/Suppliers';
import type { ReportKey, User } from './types';

const TABS = ['Dashboard', 'Orders', 'Suppliers', 'Reports', 'Assistant'] as const;
type Tab = (typeof TABS)[number];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>('Dashboard');
  const [report, setReport] = useState<ReportKey>('over-eta');

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    api.me().then(setUser).catch(() => setUser(null)).finally(() => setReady(true));
  }, []);

  if (!ready) return null;
  if (!user) return <Login onAuth={setUser} />;

  return (
    <div className="min-h-screen">
      <header className="bg-slate-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <h1 className="text-lg font-semibold">SmartFlow <span className="text-emerald-400">AI</span></h1>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <span className="hidden sm:inline">{user.name} ({user.role})</span>
            <button onClick={async () => { await api.logout(); setUser(null); }} className="rounded-md px-2 py-1 hover:bg-slate-800">Sign out</button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm ${tab === t ? 'bg-emerald-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>{t}</button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        {tab === 'Dashboard' && <Dashboard openReport={k => { setReport(k); setTab('Reports'); }} />}
        {tab === 'Orders' && <Orders />}
        {tab === 'Suppliers' && <Suppliers user={user} />}
        {tab === 'Reports' && <Reports key={report} initial={report} />}
        {tab === 'Assistant' && <Assistant />}
      </main>
    </div>
  );
}
