import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { I18nService } from '../core/i18n.service';

@Component({
  selector: 'app-ring',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ring" [style.width.px]="size()" [style.height.px]="size()">
      <svg [attr.width]="size()" [attr.height]="size()" [attr.viewBox]="'0 0 ' + size() + ' ' + size()">
        <circle class="ring-bg" [attr.cx]="size() / 2" [attr.cy]="size() / 2" [attr.r]="r()" [attr.stroke-width]="stroke()" fill="none" />
        <circle class="ring-fg" [attr.cx]="size() / 2" [attr.cy]="size() / 2" [attr.r]="r()" [attr.stroke-width]="stroke()" fill="none"
          stroke-linecap="round" [attr.stroke-dasharray]="c()" [attr.stroke-dashoffset]="offset()"
          [attr.transform]="'rotate(-90 ' + size() / 2 + ' ' + size() / 2 + ')'" />
      </svg>
      <span class="ring-label" [style.font-size.px]="size() / 4.2">{{ i18n.pct(value()) }}</span>
    </div>`,
})
export class RingComponent {
  protected i18n = inject(I18nService);
  readonly value = input(0);
  readonly size = input(104);
  readonly stroke = input(10);
  protected readonly r = computed(() => (this.size() - this.stroke()) / 2);
  protected readonly c = computed(() => 2 * Math.PI * this.r());
  protected readonly offset = computed(() => this.c() * (1 - Math.min(100, Math.max(0, this.value())) / 100));
}
