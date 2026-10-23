import { LessonStatus } from './models';

const pad = (n: number) => String(n).padStart(2, '0');

/** Local date -> yyyy-MM-dd (matches the API's DateOnly format). */
export function toIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromIso(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const c = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  c.setDate(c.getDate() + n);
  return c;
}

/** The Egyptian week starts on Saturday (same rule as the backend's WeekCalendar). */
export function startOfWeek(d: Date): Date {
  const diff = (d.getDay() - 6 + 7) % 7;
  return addDays(d, -diff);
}

export function todayIso(): string {
  return toIso(new Date());
}

/** Same rule as the backend's StudentLessonProgress.Status. */
export function computeStatus(a: boolean, s: boolean, e: boolean): LessonStatus {
  const done = (a ? 1 : 0) + (s ? 1 : 0) + (e ? 1 : 0);
  return done === 0 ? 'NotStarted' : done === 3 ? 'Completed' : 'InProgress';
}
