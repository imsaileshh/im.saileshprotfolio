'use client';

import { decodeDashboardData } from './transport';

export function dashboardAction<Args extends unknown[], Result>(name: string) {
  return async (...args: Args): Promise<Result> => {
    const body = new FormData();
    let field = 0;
    const encoded = args.map(value => {
      if (!(value instanceof FormData)) return { kind: 'json', value };
      const entries = Array.from(value.entries()).map(([name, entry]) => {
        const key = `$field:${field++}`;
        body.append(key, entry);
        return { name, key };
      });
      return { kind: 'form', entries };
    });
    body.set('$args', JSON.stringify(encoded));
    const response = await fetch(`/api/dashboard/actions/${encodeURIComponent(name)}`, {
      method: 'POST', body, headers: { 'X-Dashboard-Action': '1' },
    });
    if (response.status === 401) {
      window.location.assign('/dashboard/login');
      throw new Error('Your session has expired. Please sign in again.');
    }
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to save changes.');
    if (result.redirect) {
      window.location.assign(result.redirect);
      // Redirecting actions never resolve in the original server-action flow.
      return new Promise<Result>(() => {});
    }
    const data = decodeDashboardData<Result>(result);
    const failed = data && typeof data === 'object' && (('error' in data && data.error) || ('success' in data && data.success === false));
    if (!name.startsWith('get') && !failed) window.dispatchEvent(new Event('dashboard:refresh'));
    return data;
  };
}
