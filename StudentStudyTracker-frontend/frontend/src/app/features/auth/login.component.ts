import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ErrorService } from '../../core/error.service';
import { I18nService } from '../../core/i18n.service';
import { TPipe } from '../../core/t.pipe';
import { IconComponent } from '../../shared/icon.component';
import { AuthCardComponent } from './auth-card.component';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, AuthCardComponent, IconComponent, TPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-auth-card [title]="'auth.loginTitle' | t" [subtitle]="'auth.loginSub' | t">
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="field">
          <label class="label" for="email">{{ 'auth.email' | t }}</label>
          <div class="input-wrap"><app-icon name="mail" [size]="18" />
            <input id="email" class="input" type="email" formControlName="email" autocomplete="email" dir="ltr" />
          </div>
          @if (form.controls.email.touched && form.controls.email.invalid) { <small class="error-text">{{ 'val.email' | t }}</small> }
        </div>
        <div class="field">
          <label class="label" for="password">{{ 'auth.password' | t }}</label>
          <div class="input-wrap"><app-icon name="lock" [size]="18" />
            <input id="password" class="input" [type]="show() ? 'text' : 'password'" formControlName="password" autocomplete="current-password" dir="ltr" />
            <button type="button" class="btn btn-ghost btn-icon btn-sm" (click)="show.set(!show())" [attr.aria-label]="'auth.showPassword' | t"><app-icon [name]="show() ? 'eye-off' : 'eye'" [size]="18" /></button>
          </div>
          @if (form.controls.password.touched && form.controls.password.invalid) { <small class="error-text">{{ 'val.required' | t }}</small> }
        </div>
        @if (error()) { <div class="alert danger">{{ error() }}</div> }
        <button class="btn btn-primary btn-block" type="submit" [disabled]="loading()">{{ (loading() ? 'common.loading' : 'auth.login') | t }}</button>
      </form>
      <p class="center muted switch-line">{{ 'auth.noAccount' | t }} <a routerLink="/register">{{ 'auth.register' | t }}</a></p>
    </app-auth-card>`,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private errors = inject(ErrorService);
  protected i18n = inject(I18nService);

  protected readonly show = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl(this.auth.home()),
      error: (e) => {
        this.error.set(this.errors.message(e));
        this.loading.set(false);
      },
    });
  }
}
