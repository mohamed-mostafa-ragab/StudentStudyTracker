import { Component, HostListener, inject } from '@angular/core';
import { ConfirmService } from '../core/confirm.service';
import { I18nService } from '../core/i18n.service';
import { TPipe } from '../core/t.pipe';
import { ToastService } from '../core/toast.service';
import { IconComponent } from './icon';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="toasts" aria-live="polite">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [class]="'toast ' + t.kind" role="status" (click)="toast.dismiss(t.id)">
          <app-icon [name]="t.kind === 'success' ? 'check' : t.kind === 'error' ? 'alert' : 'clock'" [size]="18" />
          <span>{{ t.text }}</span>
        </div>
      }
    </div>
  `,
})
export class ToastsComponent {
  toast = inject(ToastService);
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [TPipe],
  template: `
    @if (confirm.state(); as s) {
      <div class="backdrop" (click)="confirm.answer(false)">
        <div class="modal small" role="alertdialog" aria-modal="true" (click)="$event.stopPropagation()">
          <h3>{{ s.title }}</h3>
          <p class="muted">{{ s.message }}</p>
          <div class="modal-actions">
            <button class="btn ghost" type="button" (click)="confirm.answer(false)">{{ 'common.cancel' | t }}</button>
            <button class="btn" [class.danger]="s.danger" type="button" (click)="confirm.answer(true)">
              {{ s.confirmText ?? ('common.confirm' | t) }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  confirm = inject(ConfirmService);
  i18n = inject(I18nService);

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.confirm.state()) this.confirm.answer(false);
  }
}
