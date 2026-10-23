import { Injectable, computed, effect, signal } from '@angular/core';
import { AR } from '../i18n/ar';
import { EN } from '../i18n/en';
import { fromIso } from './utils';

export type Lang = 'ar' | 'en';
const KEY = 'sst.lang';
const DICTS: Record<Lang, Record<string, string>> = { ar: AR, en: EN };

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<Lang>(this.initial());
  readonly dir = computed(() => (this.lang() === 'ar' ? 'rtl' : 'ltr'));
  readonly locale = computed(() => (this.lang() === 'ar' ? 'ar-EG' : 'en-US'));

  constructor() {
    effect(() => {
      const l = this.lang();
      document.documentElement.lang = l;
      document.documentElement.dir = this.dir();
      localStorage.setItem(KEY, l);
    });
  }

  private initial(): Lang {
    const saved = localStorage.getItem(KEY);
    return saved === 'en' || saved === 'ar' ? saved : 'ar';
  }

  set(l: Lang) { this.lang.set(l); }
  toggle() { this.lang.update((l) => (l === 'ar' ? 'en' : 'ar')); }

  /** Translate a key. Reading lang() makes every caller reactive to language changes. */
  t(key: string, params?: Record<string, string | number>): string {
    let text = DICTS[this.lang()][key] ?? DICTS['en'][key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) text = text.replaceAll(`{${k}}`, String(v));
    }
    return text;
  }

  num(n: number): string { return new Intl.NumberFormat(this.locale()).format(n); }
  pct(n: number): string { return `${this.num(Math.round(n))}%`; }

  date(iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }): string {
    return new Intl.DateTimeFormat(this.locale(), opts).format(fromIso(iso));
  }
  dateObj(d: Date, opts: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.locale(), opts).format(d);
  }
}
