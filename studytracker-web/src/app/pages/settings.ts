import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { ConfirmService } from '../core/confirm.service';
import { ErrorService } from '../core/error.service';
import { I18nService } from '../core/i18n.service';
import { TPipe } from '../core/t.pipe';
import { ThemeService } from '../core/theme.service';
import { ToastService } from '../core/toast.service';
import { IconComponent } from '../shared/icon';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, TPipe, IconComponent],
  template: `
    <section class="page-head"><div><h1>{{ 'settings.title' | t }}</h1></div></section>

    <section class="card profile-card">
      <div class="avatar big">{{ initial() }}</div>
      <div>
        <strong>{{ auth.session()?.fullName }}</strong>
        <div class="muted small-text" dir="ltr">{{ auth.session()?.email }}</div>
        <span class="badge">{{ (auth.isAdmin() ? 'settings.roleAdmin' : 'settings.roleStudent') | t }}</span>
      </div>
    </section>

    <section class="card">
      <h2><app-icon name="globe" [size]="20" /> {{ 'settings.language' | t }}</h2>
      <div class="segmented">
        <button type="button" [class.on]="i18n.lang() === 'ar'" (click)="i18n.set('ar')">العربية</button>
        <button type="button" [class.on]="i18n.lang() === 'en'" (click)="i18n.set('en')">English</button>
      </div>
    </section>

    <section class="card">
      <h2><app-icon name="sun" [size]="20" /> {{ 'settings.theme' | t }}</h2>
      <div class="segmented">
        <button type="button" [class.on]="theme.mode() === 'light'" (click)="theme.set('light')"><app-icon name="sun" [size]="16" />{{ 'settings.light' | t }}</button>
        <button type="button" [class.on]="theme.mode() === 'dark'" (click)="theme.set('dark')"><app-icon name="moon" [size]="16" />{{ 'settings.dark' | t }}</button>
        <button type="button" [class.on]="theme.mode() === 'system'" (click)="theme.set('system')">{{ 'settings.system' | t }}</button>
      </div>
    </section>

    <form class="card" (ngSubmit)="changePassword()" novalidate>
      <h2><app-icon name="shield" [size]="20" /> {{ 'settings.changePassword' | t }}</h2>
      <label class="field">
        <span>{{ 'settings.currentPassword' | t }}</span>
        <input type="password" name="cur" [(ngModel)]="current" autocomplete="current-password" dir="ltr" />
      </label>
      <div class="grid-2">
        <label class="field">
          <span>{{ 'settings.newPassword' | t }}</span>
          <input type="password" name="new" [(ngModel)]="next" autocomplete="new-password" dir="ltr" />
        </label>
        <label class="field">
          <span>{{ 'auth.confirmPassword' | t }}</span>
          <input type="password" name="conf" [(ngModel)]="confirmPw" autocomplete="new-password" dir="ltr" />
        </label>
      </div>
      <small class="muted">{{ 'auth.passwordHint' | t }}</small>
      @if (error()) { <p class="form-error">{{ error() }}</p> }
      <button class="btn" type="submit" [disabled]="busy()">{{ 'settings.updatePassword' | t }}</button>
    </form>

    <section class="card">
      <button class="btn danger block" type="button" (click)="logout()"><app-icon name="logout" [size]="18" />{{ 'settings.logout' | t }}</button>
    </section>
  `,
})
export class SettingsComponent {
  i18n = inject(I18nService);
  theme = inject(ThemeService);
  auth = inject(AuthService);
  private toast = inject(ToastService);
  private errors = inject(ErrorService);
  private confirm = inject(ConfirmService);

  current = '';
  next = '';
  confirmPw = '';
  busy = signal(false);
  error = signal('');

  initial() { return (this.auth.session()?.fullName ?? '?').trim().charAt(0).toUpperCase(); }

  changePassword() {
    this.error.set('');
    if (!this.current || !this.next) { this.error.set(this.i18n.t('auth.fillAll')); return; }
    if (this.next.length < 8) { this.error.set(this.i18n.t('err.pwLength')); return; }
    if (this.next !== this.confirmPw) { this.error.set(this.i18n.t('auth.mismatch')); return; }

    this.busy.set(true);
    this.auth.changePassword({ currentPassword: this.current, newPassword: this.next }).subscribe({
      next: () => {
        this.busy.set(false);
        this.current = this.next = this.confirmPw = '';
        this.toast.success(this.i18n.t('settings.passwordChanged'));
      },
      error: (e) => { this.busy.set(false); this.error.set(this.errors.message(e)); },
    });
  }

  async logout() {
    const ok = await this.confirm.ask({
      title: this.i18n.t('settings.logout'),
      message: this.i18n.t('settings.logoutMsg'),
      confirmText: this.i18n.t('settings.logout'),
    });
    if (ok) this.auth.logout();
  }
}
