import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ErrorService } from '../core/error.service';
import { I18nService } from '../core/i18n.service';
import { TPipe } from '../core/t.pipe';
import { ThemeService } from '../core/theme.service';
import { IconComponent } from '../shared/icon';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, TPipe, IconComponent],
  template: `
    <div class="auth-wrap">
      <div class="auth-tools">
        <button class="icon-btn" type="button" (click)="i18n.toggle()"><app-icon name="globe" [size]="18" /><span class="lang-code">{{ i18n.lang() === 'ar' ? 'EN' : 'ع' }}</span></button>
        <button class="icon-btn" type="button" (click)="theme.toggle()"><app-icon [name]="theme.isDark() ? 'sun' : 'moon'" [size]="18" /></button>
      </div>
      <form class="auth-card" (ngSubmit)="submit()" novalidate>
        <div class="brand-mark big"><app-icon name="cap" [size]="28" /></div>
        <h1>{{ 'auth.welcomeBack' | t }}</h1>
        <p class="muted">{{ 'auth.loginSub' | t }}</p>

        <label class="field">
          <span>{{ 'auth.email' | t }}</span>
          <input type="email" name="email" [(ngModel)]="email" autocomplete="email" dir="ltr" required />
        </label>
        <label class="field">
          <span>{{ 'auth.password' | t }}</span>
          <input type="password" name="password" [(ngModel)]="password" autocomplete="current-password" dir="ltr" required />
        </label>

        @if (error()) { <p class="form-error">{{ error() }}</p> }

        <button class="btn block" type="submit" [disabled]="busy()">{{ (busy() ? 'common.loading' : 'auth.login') | t }}</button>
        <p class="auth-switch">{{ 'auth.noAccount' | t }} <a routerLink="/register">{{ 'auth.register' | t }}</a></p>
      </form>
    </div>
  `,
})
export class LoginComponent {
  i18n = inject(I18nService);
  theme = inject(ThemeService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private errors = inject(ErrorService);

  email = '';
  password = '';
  busy = signal(false);
  error = signal('');

  submit() {
    this.error.set('');
    if (!EMAIL_RE.test(this.email.trim()) || !this.password) {
      this.error.set(this.i18n.t('auth.fillAll'));
      return;
    }
    this.busy.set(true);
    this.auth.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: () => this.router.navigateByUrl(this.auth.home()),
      error: (e) => { this.busy.set(false); this.error.set(this.errors.message(e)); },
    });
  }
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, TPipe, IconComponent],
  template: `
    <div class="auth-wrap">
      <div class="auth-tools">
        <button class="icon-btn" type="button" (click)="i18n.toggle()"><app-icon name="globe" [size]="18" /><span class="lang-code">{{ i18n.lang() === 'ar' ? 'EN' : 'ع' }}</span></button>
        <button class="icon-btn" type="button" (click)="theme.toggle()"><app-icon [name]="theme.isDark() ? 'sun' : 'moon'" [size]="18" /></button>
      </div>
      <form class="auth-card" (ngSubmit)="submit()" novalidate>
        <div class="brand-mark big"><app-icon name="cap" [size]="28" /></div>
        <h1>{{ 'auth.createAccount' | t }}</h1>
        <p class="muted">{{ 'auth.registerSub' | t }}</p>

        <label class="field">
          <span>{{ 'auth.fullName' | t }}</span>
          <input type="text" name="fullName" [(ngModel)]="fullName" autocomplete="name" maxlength="100" required />
        </label>
        <label class="field">
          <span>{{ 'auth.email' | t }}</span>
          <input type="email" name="email" [(ngModel)]="email" autocomplete="email" dir="ltr" required />
        </label>
        <label class="field">
          <span>{{ 'auth.password' | t }}</span>
          <input type="password" name="password" [(ngModel)]="password" autocomplete="new-password" dir="ltr" required />
          <small class="muted">{{ 'auth.passwordHint' | t }}</small>
        </label>
        <label class="field">
          <span>{{ 'auth.confirmPassword' | t }}</span>
          <input type="password" name="confirm" [(ngModel)]="confirm" autocomplete="new-password" dir="ltr" required />
        </label>

        @if (error()) { <p class="form-error">{{ error() }}</p> }

        <button class="btn block" type="submit" [disabled]="busy()">{{ (busy() ? 'common.loading' : 'auth.register') | t }}</button>
        <p class="auth-switch">{{ 'auth.haveAccount' | t }} <a routerLink="/login">{{ 'auth.login' | t }}</a></p>
      </form>
    </div>
  `,
})
export class RegisterComponent {
  i18n = inject(I18nService);
  theme = inject(ThemeService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private errors = inject(ErrorService);

  fullName = '';
  email = '';
  password = '';
  confirm = '';
  busy = signal(false);
  error = signal('');

  submit() {
    this.error.set('');
    if (!this.fullName.trim() || !EMAIL_RE.test(this.email.trim()) || !this.password) {
      this.error.set(this.i18n.t('auth.fillAll'));
      return;
    }
    if (this.password.length < 8) { this.error.set(this.i18n.t('err.pwLength')); return; }
    if (this.password !== this.confirm) { this.error.set(this.i18n.t('auth.mismatch')); return; }

    this.busy.set(true);
    this.auth.register({ fullName: this.fullName.trim(), email: this.email.trim(), password: this.password }).subscribe({
      next: () => this.router.navigateByUrl(this.auth.home()),
      error: (e) => { this.busy.set(false); this.error.set(this.errors.message(e)); },
    });
  }
}
