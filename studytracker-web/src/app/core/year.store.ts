import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { YearLevel } from './models';

const KEY = 'sst.year';

/** Holds the published year levels and the student's currently selected year (persisted). */
@Injectable({ providedIn: 'root' })
export class YearStore {
  private api = inject(ApiService);
  readonly years = signal<YearLevel[]>([]);
  readonly loaded = signal(false);
  readonly selectedId = signal<number | null>(this.saved());
  private requested = false;

  private saved(): number | null {
    const v = Number(localStorage.getItem(KEY));
    return Number.isFinite(v) && v > 0 ? v : null;
  }

  load() {
    if (this.requested) return;
    this.requested = true;
    this.api.yearLevels().subscribe({
      next: (ys) => {
        this.years.set(ys);
        const sel = this.selectedId();
        if (!sel || !ys.some((y) => y.id === sel)) this.select(ys[0]?.id ?? null);
        this.loaded.set(true);
      },
      error: () => {
        this.requested = false;
        this.loaded.set(true);
      },
    });
  }

  select(id: number | null) {
    this.selectedId.set(id);
    if (id) localStorage.setItem(KEY, String(id));
    else localStorage.removeItem(KEY);
  }
}
