import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ErrorService } from '../../core/error.service';
import { TPipe } from '../../core/t.pipe';
import { IconComponent } from '../../shared/icon.component';
import { AuthCardComponent } from './auth-card.component';

/** Mirrors the API's Identity rules: 8+ chars, upper, lower, digit, symbol. */
function strongPassword(c: AbstractControl): ValidationErrors | null {
  const v = (c.value as string) ?? '';
  const ok = v.length >= 8 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /\d/.test(v) && /[^A-Za-z0-9]/.test(v);
  return ok ? null : { weak: true };
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, AuthCardComponent, IconComponent, TPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-auth-card [title]="'auth.registerTitle' | t" [subtitle]="'auth.registerSub' | t">
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="field">
          <label class="label" for="name">{{ 'auth.fullName' | t }}</label>
          <div class="input-wrap"><app-icon name="user" [size]="18" /><input id="name" class="input" formControlName="fullName" autocomplete="name" maxlength="100" /></div>
          @if (form.controls.fullName.touched && form.controls.fullName.invalid) { <small class="error-text">{{ 'val.required' | t }}</small> }
        </div>
        <div class="field">
          <label class="label" for="email">{{ 'auth.email' | t }}</label>
          <div class="input-wrap"><app-icon name="mail" [size]="18" /><input id="email" class="input" type="email" formControlName="email" autocomplete="email" dir="ltr" /></div>
          @if (form.controls.email.touched && form.controls.email.invalid) { <small class="error-text">{{ 'val.email' | t }}</small> }
        </div>
        <div class="field">
          <label class="label" for="password">{{ 'auth.password' | t }}</label>
          <div class="input-wrap"><app-icon name="lock" [size]="18" />
            <input id="password" class="input" [type]="show() ? 'text' : 'password'" formControlName="password" autocomplete="new-password" dir="ltr" />
            <button type="button" class="btn btn-ghost btn-icon btn-sm" (click)="show.set(!show())" [attr.aria-label]="'auth.showPassword' | t"><app-icon [name]="show() ? 'eye-off' : 'eye'" [size]="18" /></button>
          </div>
          <small [class]="form.controls.password.touched && form.controls.password.invalid ? 'error-text' : 'hint'">{{ 'val.passwordRules' | t }}</small>
        </div>
        <div class="field">
          <label class="label" for="confirm">{{ 'auth.confirmPassword' | t }}</label>
          <div class="input-wrap"><app-icon name="lock" [size]="18" /><input id="confirm" class="input" [type]="show() ? 'text' : 'password'" formControlName="confirm" autocomplete="new-password" dir="ltr" /></div>
          @if (form.controls.confirm.touched && mismatch()) { <small class="error-text">{{ 'val.mismatch' | t }}</small> }
        </div>
        @if (error()) { <div class="alert danger">{{ error() }}</div> }
        <button class="btn btn-primary btn-block" type="submit" [disabled]="loading()">{{ (loading() ? 'common.loading' : 'auth.register') | t }}</button>
      </form>
      <p class="center muted switch-line">{{ 'auth.haveAccount' | t }} <a routerLink="/login">{{ 'auth.login' | t }}</a></p>
    </app-auth-card>`,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private errors = inject(ErrorService);

  protected readonly show = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, strongPassword]],
    confirm: ['', Validators.required],
  });

  protected mismatch(): boolean {
    const v = this.form.getRawValue();
    return v.password !== v.confirm;
  }

  protected submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.mismatch() || this.loading()) return;
    const { fullName, email, password } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set('');
    this.auth.register({ fullName: fullName.trim(), email, password }).subscribe({
      next: () => this.router.navigateByUrl(this.auth.home()),
      error: (e) => {
        this.error.set(this.errors.message(e));
        this.loading.set(false);
      },
    });
  }
}
