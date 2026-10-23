import { Injectable, computed, effect, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';
const KEY = 'sst.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<ThemeMode>(this.initial());
  private readonly mq = window.matchMedia('(prefers-color-scheme: dark)');
  private readonly systemDark = signal(this.mq.matches);
  readonly isDark = computed(() => this.mode() === 'dark' || (this.mode() === 'system' && this.systemDark()));

  constructor() {
    this.mq.addEventListener('change', (e) => this.systemDark.set(e.matches));
    effect(() => {
      document.documentElement.dataset['theme'] = this.isDark() ? 'dark' : 'light';
      localStorage.setItem(KEY, this.mode());
    });
  }

  private initial(): ThemeMode {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
  }

  set(m: ThemeMode) { this.mode.set(m); }
  toggle() { this.mode.set(this.isDark() ? 'light' : 'dark'); }
}
