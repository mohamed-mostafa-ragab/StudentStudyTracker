/** Parse "yyyy-MM-dd" as a LOCAL date (avoids the UTC off-by-one bug of new Date(str)). */
export function fromIso(s: string): Date {
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toIso(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function todayIso(): string { return toIso(new Date()); }

export function addDays(iso: string, n: number): string {
  const d = fromIso(iso);
  d.setDate(d.getDate() + n);
  return toIso(d);
}

/** Egypt week: starts Saturday, ends Friday (same rule as the API). */
export function startOfWeekIso(iso: string): string {
  const d = fromIso(iso);
  const diff = (d.getDay() - 6 + 7) % 7; // Saturday = 6
  return addDays(iso, -diff);
}
