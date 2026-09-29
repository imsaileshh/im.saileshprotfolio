// Preserve Date values without interpreting arbitrary user content as dates.
export type DashboardPayload = { data: unknown; dates: string[][] };

export function encodeDashboardData(value: unknown): DashboardPayload {
  const dates: string[][] = [];
  function encode(item: unknown, path: string[]): unknown {
    if (item instanceof Date) { dates.push(path); return item.toISOString(); }
    if (Array.isArray(item)) return item.map((entry, index) => encode(entry, [...path, String(index)]));
    if (item && typeof item === 'object') {
      return Object.fromEntries(Object.entries(item).map(([key, entry]) => [key, encode(entry, [...path, key])]));
    }
    return item;
  }
  return { data: encode(value, []), dates };
}

export function decodeDashboardData<T>(payload: DashboardPayload): T {
  for (const path of payload.dates) {
    let parent = payload.data as Record<string, unknown>;
    for (const key of path.slice(0, -1)) parent = parent[key] as Record<string, unknown>;
    const key = path[path.length - 1];
    if (parent && Object.hasOwn(parent, key)) parent[key] = new Date(parent[key] as string);
  }
  return payload.data as T;
}
