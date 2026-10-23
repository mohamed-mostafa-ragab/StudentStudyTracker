import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { I18nService } from '../../core/i18n.service';
import { TPipe } from '../../core/t.pipe';
import { ThemeService } from '../../core/theme.service';
import { IconComponent } from '../../shared/icon.component';

/** Shared frame for the login/register pages. */
@Component({
  selector: 'app-auth-card',
  imports: [IconComponent, TPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-wrap">
      <div class="auth-tools row gap">
        <button class="btn btn-ghost btn-sm" type="button" (click)="i18n.toggle()"><app-icon name="globe" [size]="16" />{{ 'lang.switch' | t }}</button>
        <button class="btn btn-ghost btn-icon btn-sm" type="button" (click)="theme.toggle()" [attr.aria-label]="'settings.theme' | t"><app-icon [name]="theme.isDark() ? 'sun' : 'moon'" [size]="16" /></button>
      </div>
      <div class="auth-card card">
        <div class="auth-brand"><span class="logo lg"><app-icon name="book" [size]="28" /></span></div>
        <h1 class="h1 center">{{ title() }}</h1>
        <p class="muted center">{{ subtitle() }}</p>
        <ng-content />
      </div>
    </div>`,
})
export class AuthCardComponent {
  protected i18n = inject(I18nService);
  protected theme = inject(ThemeService);
  readonly title = input('');
  readonly subtitle = input('');
}
