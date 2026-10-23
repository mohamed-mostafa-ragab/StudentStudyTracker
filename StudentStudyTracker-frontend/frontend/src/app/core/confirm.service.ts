import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions { title: string; message: string; confirmText?: string; danger?: boolean; }
export interface ConfirmState extends ConfirmOptions { resolve: (v: boolean) => void; }

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly state = signal<ConfirmState | null>(null);

  ask(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => this.state.set({ ...options, resolve }));
  }
  answer(value: boolean) {
    const s = this.state();
    if (s) {
      this.state.set(null);
      s.resolve(value);
    }
  }
}
