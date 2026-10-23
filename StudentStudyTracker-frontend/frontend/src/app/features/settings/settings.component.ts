import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { ErrorService } from '../../core/error.service';
import { I18nService } from '../../core/i18n.service';
import { TPipe } from '../../core/t.pipe';
import { ThemeService } from '../../core/theme.service';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../shared/icon.component';

function strongPassword(c: AbstractControl): ValidationErrors | null {
  const v = (c.value as string) ?? '';
  const ok = v.length >= 8 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /\d/.test(v) && /[^A-Za-z0-9]/.test(v);
  return ok ? null : { weak: true };
}

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, IconComponent, TPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page narrow">
      <div class="page-head"><h1 class="h1">{{ 'settings.title' | t }}</h1></div>

      <section class="card">
        <div class="who big">
          <span class="avatar lg">{{ (auth.session()?.fullName ?? '?').charAt(0).toUpperCase() }}</span>
          <div><strong class="h3">{{ auth.session()?.fullName }}</strong>
            <div class="muted" dir="ltr">{{ auth.session()?.email }}</div>
            <span class="badge info">{{ (auth.isAdmin() ? 'role.admin' : 'role.student') | t }}</span></div>
        </div>
      </section>

      <section class="card">
        <h2 class="h2"><app-icon name="globe" [size]="20" /> {{ 'settings.language' | t }}</h2>
        <div class="seg">
          <button type="button" [class.on]="i18n.lang() === 'ar'" (click)="i18n.set('ar')">العربية</button>
          <button type="button" [class.on]="i18n.lang() === 'en'" (click)="i18n.set('en')">English</button>
        </div>
      </section>

      <section class="card">
        <h2 class="h2"><app-icon name="sun" [size]="20" /> {{ 'settings.theme' | t }}</h2>
        <div class="seg">
          <button type="button" [class.on]="theme.mode() === 'light'" (click)="theme.set('light')">{{ 'theme.light' | t }}</button>
          <button type="button" [class.on]="theme.mode() === 'dark'" (click)="theme.set('dark')">{{ 'theme.dark' | t }}</button>
          <button type="button" [class.on]="theme.mode() === 'system'" (click)="theme.set('system')">{{ 'theme.system' | t }}</button>
        </div>
      </section>

      <section class="card">
        <h2 class="h2"><app-icon name="lock" [size]="20" /> {{ 'settings.password' | t }}</h2>
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="field">
            <label class="label" for="cur">{{ 'settings.currentPassword' | t }}</label>
            <input id="cur" class="input" type="password" formControlName="currentPassword" autocomplete="current-password" dir="ltr" />
            @if (form.controls.currentPassword.touched && form.controls.currentPassword.invalid) { <small class="error-text">{{ 'val.required' | t }}</small> }
          </div>
          <div class="field">
            <label class="label" for="new">{{ 'settings.newPassword' | t }}</label>
            <input id="new" class="input" type="password" formControlName="newPassword" autocomplete="new-password" dir="ltr" />
            <small [class]="form.controls.newPassword.touched && form.controls.newPassword.invalid ? 'error-text' : 'hint'">{{ 'val.passwordRules' | t }}</small>
          </div>
          @if (error()) { <div class="alert danger">{{ error() }}</div> }
          <button class="btn btn-primary" type="submit" [disabled]="loading()">{{ (loading() ? 'common.loading' : 'settings.changePassword') | t }}</button>
        </form>
      </section>

      <button class="btn btn-danger btn-block" type="button" (click)="auth.logout()"><app-icon name="logout" [size]="18" />{{ 'auth.logout' | t }}</button>
    </div>`,
})
export class SettingsComponent {
  protected auth = inject(AuthService);
  protected i18n = inject(I18nService);
  protected theme = inject(ThemeService);
  private fb = inject(FormBuilder);
  private errors = inject(ErrorService);
  private toast = inject(ToastService);

  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly form = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, strongPassword]],
  });

  protected submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.changePassword(this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.success(this.i18n.t('settings.passwordChanged'));
        this.form.reset();
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(this.errors.message(e));
        this.loading.set(false);
      },
    });
  }
}
