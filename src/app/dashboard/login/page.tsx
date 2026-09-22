'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function DashboardLoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090B] px-4 overflow-y-auto">
      <div className="w-full max-w-sm rounded-2xl bg-[#111113] p-8 shadow-xl border border-white/5">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#4F8CFF]/10 text-[#4F8CFF]">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Admin Access</h1>
          <p className="mt-2 text-sm text-zinc-400">Enter your PIN to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="pin" className="sr-only">PIN</label>
            <input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-center text-2xl tracking-[0.5em] text-white placeholder-zinc-600 focus:border-[#4F8CFF] focus:outline-none focus:ring-1 focus:ring-[#4F8CFF] transition-all"
              maxLength={4}
              required
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-500/10 p-3 text-center text-sm text-red-500">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || pin.length < 4}
            className="w-full rounded-lg bg-[#4F8CFF] px-4 py-3 font-medium text-white transition-colors hover:bg-[#4F8CFF]/90 focus:outline-none focus:ring-2 focus:ring-[#4F8CFF] focus:ring-offset-2 focus:ring-offset-[#111113] disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
