import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { I18nService } from './core/i18n.service';
import { ThemeService } from './core/theme.service';
import { ConfirmHostComponent, ToastHostComponent } from './shared/feedback.components';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastHostComponent, ConfirmHostComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<router-outlet /><app-toast-host /><app-confirm-host />`,
})
export class App {
  // Instantiate early so <html lang/dir/data-theme> are applied before the first paint.
  constructor() {
    inject(I18nService);
    inject(ThemeService);
  }
}
