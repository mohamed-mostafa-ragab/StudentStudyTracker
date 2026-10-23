import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConfirmService } from '../core/confirm.service';
import { I18nService } from '../core/i18n.service';
import { TPipe } from '../core/t.pipe';
import { ToastService } from '../core/toast.service';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-toast-host',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toasts" aria-live="polite">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [class]="'toast ' + t.kind" role="status">
          <span>{{ t.text }}</span>
          <button class="btn-icon btn-ghost btn" type="button" (click)="toast.dismiss(t.id)" aria-label="close"><app-icon name="x" [size]="16" /></button>
        </div>
      }
    </div>`,
})
export class ToastHostComponent {
  protected toast = inject(ToastService);
}

@Component({
  selector: 'app-confirm-host',
  imports: [TPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'confirm.answer(false)' },
  template: `
    @if (confirm.state(); as s) {
      <div class="backdrop" (click)="confirm.answer(false)" role="presentation"></div>
      <div class="modal modal-sm" role="alertdialog" aria-modal="true">
        <div class="modal-body">
          <h3 class="h3">{{ s.title }}</h3>
          <p class="muted">{{ s.message }}</p>
          <div class="row end gap">
            <button class="btn btn-ghost" type="button" (click)="confirm.answer(false)">{{ 'common.cancel' | t }}</button>
            <button class="btn" [class.btn-danger]="s.danger" [class.btn-primary]="!s.danger" type="button" (click)="confirm.answer(true)">
              {{ s.confirmText ?? ('common.confirm' | t) }}
            </button>
          </div>
        </div>
      </div>
    }`,
})
export class ConfirmHostComponent {
  protected confirm = inject(ConfirmService);
  protected i18n = inject(I18nService);
}
