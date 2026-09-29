'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface DashboardUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface DashboardAuthContextType {
  user: DashboardUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const CACHE_KEY = 'sailesh_dashboard_user_cache';

const DashboardAuthContext = createContext<DashboardAuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  refreshSession: async () => {},
  logout: async () => {},
});

function getInitialCachedUser(): DashboardUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.id === 'string' && typeof parsed.email === 'string') {
      return {
        id: parsed.id,
        name: parsed.name ?? null,
        email: parsed.email,
        role: parsed.role ?? 'ADMIN',
      };
    }
  } catch {
    // Ignore storage or parsing errors
  }
  return null;
}

export function DashboardAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(getInitialCachedUser);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getInitialCachedUser());
  const [error, setError] = useState<string | null>(null);

  const fetchSession = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch('/api/auth/session', { cache: 'no-store', signal });
      if (response.status === 401) {
        try { sessionStorage.removeItem(CACHE_KEY); } catch {}
        setUser(null);
        setIsAuthenticated(false);
        router.replace('/dashboard/login');
        return;
      }
      if (!response.ok) {
        throw new Error('Unable to verify your session.');
      }
      const result = await response.json();
      if (!result.authenticated || result.user?.role !== 'ADMIN') {
        try { sessionStorage.removeItem(CACHE_KEY); } catch {}
        setUser(null);
        setIsAuthenticated(false);
        router.replace('/dashboard/login');
        return;
      }

      const verifiedUser: DashboardUser = {
        id: result.user.id,
        name: result.user.name ?? null,
        email: result.user.email,
        role: result.user.role,
      };

      setUser(verifiedUser);
      setIsAuthenticated(true);
      setError(null);

      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(verifiedUser));
      } catch {}
    } catch (err: unknown) {
      if (signal?.aborted) return;
      const msg = err instanceof Error ? err.message : 'Session verification failed';
      setError(msg);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [router]);

  useEffect(() => {
    const controller = new AbortController();
    fetchSession(controller.signal);
    return () => controller.abort();
  }, [fetchSession]);

  const logout = useCallback(async () => {
    try {
      sessionStorage.removeItem(CACHE_KEY);
    } catch {}
    setUser(null);
    setIsAuthenticated(false);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    router.replace('/dashboard/login');
  }, [router]);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    await fetchSession();
  }, [fetchSession]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      error,
      refreshSession,
      logout,
    }),
    [user, isLoading, isAuthenticated, error, refreshSession, logout]
  );

  return (
    <DashboardAuthContext.Provider value={value}>
      {children}
    </DashboardAuthContext.Provider>
  );
}

export function useDashboardAuth() {
  return useContext(DashboardAuthContext);
}
