import { FormEvent, useState } from 'react';
import { api } from '../api';
import type { User } from '../types';

const input = 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm';

export default function Login({ onAuth }: { onAuth: (u: User) => void }) {
  const [register, setRegister] = useState(false);
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    try { onAuth(register ? await api.register(f.name, f.email, f.password) : await api.login(f.email, f.password)); }
    catch (err) { setError((err as Error).message); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-3 rounded-xl bg-white p-6 shadow-xl">
        <h1 className="text-xl font-semibold">SmartFlow <span className="text-emerald-600">AI</span></h1>
        <p className="text-sm text-slate-500">{register ? 'Create an account (the first account becomes admin).' : 'Sign in to continue.'}</p>
        {register && <input className={input} placeholder="Full name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />}
        <input className={input} type="email" placeholder="Email" autoComplete="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
        <input className={input} type="password" placeholder={register ? 'Password (min 10 characters)' : 'Password'}
          autoComplete={register ? 'new-password' : 'current-password'} value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded-md bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700">{register ? 'Register' : 'Sign in'}</button>
        <button type="button" onClick={() => { setRegister(!register); setError(''); }} className="w-full text-sm text-slate-500 hover:underline">
          {register ? 'Have an account? Sign in' : 'Need an account? Register'}
        </button>
      </form>
    </div>
  );
}
