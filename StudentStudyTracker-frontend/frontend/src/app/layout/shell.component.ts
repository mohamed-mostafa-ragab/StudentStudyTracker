import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { I18nService } from '../core/i18n.service';
import { TPipe } from '../core/t.pipe';
import { ThemeService } from '../core/theme.service';
import { IconComponent } from '../shared/icon.component';

interface NavItem { path: string; icon: string; key: string; }

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, TPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand"><span class="logo"><app-icon name="book" [size]="22" /></span><span>{{ 'app.name' | t }}</span></div>
        <nav class="side-nav">
          @for (n of nav(); track n.path) {
            <a [routerLink]="n.path" routerLinkActive="active" class="nav-link">
              <app-icon [name]="n.icon" /><span>{{ n.key | t }}</span>
            </a>
          }
        </nav>
        <div class="side-foot">
          <div class="who">
            <span class="avatar">{{ initial() }}</span>
            <div class="who-text"><strong>{{ auth.session()?.fullName }}</strong><small class="muted">{{ (auth.isAdmin() ? 'role.admin' : 'role.student') | t }}</small></div>
          </div>
          <div class="row gap">
            <button class="btn btn-ghost btn-sm" type="button" (click)="i18n.toggle()"><app-icon name="globe" [size]="16" />{{ 'lang.switch' | t }}</button>
            <button class="btn btn-ghost btn-icon btn-sm" type="button" (click)="theme.toggle()" [attr.aria-label]="'settings.theme' | t">
              <app-icon [name]="theme.isDark() ? 'sun' : 'moon'" [size]="16" />
            </button>
            <button class="btn btn-ghost btn-icon btn-sm" type="button" (click)="auth.logout()" [attr.aria-label]="'auth.logout' | t"><app-icon name="logout" [size]="16" /></button>
          </div>
        </div>
      </aside>

      <div class="main">
        <header class="topbar">
          <div class="brand"><span class="logo"><app-icon name="book" [size]="20" /></span><span>{{ 'app.name' | t }}</span></div>
          <div class="row gap">
            <button class="btn btn-ghost btn-sm" type="button" (click)="i18n.toggle()">{{ 'lang.switch' | t }}</button>
            <button class="btn btn-ghost btn-icon btn-sm" type="button" (click)="theme.toggle()" [attr.aria-label]="'settings.theme' | t">
              <app-icon [name]="theme.isDark() ? 'sun' : 'moon'" [size]="18" />
            </button>
          </div>
        </header>
        <main class="content"><router-outlet /></main>
      </div>

      <nav class="bottom-nav" aria-label="main">
        @for (n of nav(); track n.path) {
          <a [routerLink]="n.path" routerLinkActive="active" class="bn-link">
            <app-icon [name]="n.icon" [size]="22" /><span>{{ n.key | t }}</span>
          </a>
        }
      </nav>
    </div>`,
})
export class ShellComponent {
  protected auth = inject(AuthService);
  protected i18n = inject(I18nService);
  protected theme = inject(ThemeService);

  protected readonly initial = computed(() => (this.auth.session()?.fullName ?? '?').trim().charAt(0).toUpperCase());
  protected readonly nav = computed<NavItem[]>(() =>
    this.auth.isAdmin()
      ? [
          { path: '/admin', icon: 'layers', key: 'nav.curriculum' },
          { path: '/settings', icon: 'user', key: 'nav.settings' },
        ]
      : [
          { path: '/dashboard', icon: 'home', key: 'nav.dashboard' },
          { path: '/learn', icon: 'book', key: 'nav.learn' },
          { path: '/plan', icon: 'calendar', key: 'nav.plan' },
          { path: '/settings', icon: 'user', key: 'nav.settings' },
        ],
  );
}
