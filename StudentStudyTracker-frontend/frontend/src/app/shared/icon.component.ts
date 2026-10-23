import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const ICONS: Record<string, string> = {
  home: 'M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
  book: 'M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z M4 17a3 3 0 0 1 3-3h11',
  calendar: 'M4 6h16v14H4z M4 10h16 M8 3v4 M16 3v4',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0',
  layers: 'M12 3l9 5-9 5-9-5z M3 13l9 5 9-5',
  check: 'M5 12l5 5L20 7',
  plus: 'M12 5v14 M5 12h14',
  edit: 'M4 20h4L19 9l-4-4L4 16z',
  trash: 'M5 7h14 M10 11v6 M14 11v6 M6 7l1 13h10l1-13 M9 7V4h6v3',
  'chevron-down': 'M6 9l6 6 6-6',
  'chevron-up': 'M6 15l6-6 6 6',
  'chevron-right': 'M9 6l6 6-6 6',
  'chevron-left': 'M15 6l-6 6 6 6',
  logout: 'M9 21H5V3h4 M16 17l5-5-5-5 M21 12H9',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1.5 1.5 M17.5 17.5L19 19 M5 19l1.5-1.5 M17.5 6.5L19 5',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M3 12h18 M12 3a14 14 0 0 1 0 18 M12 3a14 14 0 0 0 0 18',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
  alert: 'M12 3l10 18H2z M12 10v5 M12 18v.01',
  repeat: 'M17 2l4 4-4 4 M3 11V9a3 3 0 0 1 3-3h15 M7 22l-4-4 4-4 M21 13v2a3 3 0 0 1-3 3H3',
  chart: 'M4 20V10 M10 20V4 M16 20v-7 M22 20H2',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  'eye-off': 'M3 3l18 18 M10.6 6.1A10 10 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 4 M6.6 6.6C3.5 8.5 2 12 2 12s4 7 10 7c1.8 0 3.4-.5 4.8-1.2',
  x: 'M6 6l12 12 M18 6L6 18',
  lock: 'M6 11h12v10H6z M8 11V7a4 4 0 0 1 8 0v4',
  mail: 'M3 6h18v12H3z M3 7l9 7 9-7',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 12v.01',
};

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
      [attr.width]="size()" [attr.height]="size()" [class.flip]="flip()"><path [attr.d]="d()" /></svg>`,
  styles: `:host{display:inline-flex;line-height:0} .flip{transform:scaleX(var(--flip,1))}`,
})
export class IconComponent {
  readonly name = input.required<string>();
  readonly size = input(20);
  /** Mirror direction-sensitive icons (chevrons) in RTL. */
  readonly flip = input(false);
  protected readonly d = computed(() => ICONS[this.name()] ?? '');
}
