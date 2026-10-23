import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-modal',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'closed.emit()' },
  template: `
    <div class="backdrop" (click)="closed.emit()" role="presentation"></div>
    <div class="modal" role="dialog" aria-modal="true" [attr.aria-label]="title()">
      <div class="modal-head">
        <h3>{{ title() }}</h3>
        <button class="btn btn-ghost btn-icon" type="button" (click)="closed.emit()" aria-label="close">
          <app-icon name="x" />
        </button>
      </div>
      <div class="modal-body"><ng-content /></div>
    </div>`,
})
export class ModalComponent {
  readonly title = input('');
  readonly closed = output<void>();
}
