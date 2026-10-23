import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LessonStatus } from '../core/models';
import { TPipe } from '../core/t.pipe';

@Component({
  selector: 'app-status-badge',
  imports: [TPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge" [class]="'badge ' + cls()">{{ 'status.' + status() | t }}</span>`,
})
export class StatusBadgeComponent {
  readonly status = input.required<LessonStatus>();
  protected readonly cls = computed(() =>
    this.status() === 'Completed' ? 'ok' : this.status() === 'InProgress' ? 'warn' : 'muted',
  );
}
