import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { I18nService } from '../core/i18n.service';
import { TPipe } from '../core/t.pipe';
import { ThemeService } from '../core/theme.service';
import { IconComponent } from './icon';

interface NavItem { path: string; icon: string; label: string; }

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, TPipe],
  template: `
    <header class="topbar">
      <div class="topbar-inner">
        <a class="brand" [routerLink]="auth.home()">
          <span class="brand-mark"><app-icon name="cap" [size]="20" /></span>
          <span class="brand-text">{{ 'app.name' | t }}</span>
        </a>

        <nav class="nav-desktop" aria-label="Main">
          @for (n of nav(); track n.path) {
            <a [routerLink]="n.path" routerLinkActive="active" class="nav-link">
              <app-icon [name]="n.icon" [size]="18" /><span>{{ n.label | t }}</span>
            </a>
          }
        </nav>

        <div class="topbar-actions">
          <button class="icon-btn" type="button" (click)="i18n.toggle()" [attr.aria-label]="'common.language' | t" [title]="'common.language' | t">
            <app-icon name="globe" [size]="18" /><span class="lang-code">{{ i18n.lang() === 'ar' ? 'EN' : 'ع' }}</span>
          </button>
          <button class="icon-btn" type="button" (click)="theme.toggle()" [attr.aria-label]="'common.theme' | t" [title]="'common.theme' | t">
            <app-icon [name]="theme.isDark() ? 'sun' : 'moon'" [size]="18" />
          </button>
          <a class="avatar" routerLink="/settings" [title]="'nav.settings' | t">{{ initials() }}</a>
        </div>
      </div>
    </header>

    <main class="page">
      <router-outlet />
    </main>

    <nav class="nav-mobile" aria-label="Main">
      @for (n of nav(); track n.path) {
        <a [routerLink]="n.path" routerLinkActive="active" class="tab">
          <app-icon [name]="n.icon" [size]="22" /><span>{{ n.label | t }}</span>
        </a>
      }
    </nav>
  `,
})
export class ShellComponent {
  auth = inject(AuthService);
  i18n = inject(I18nService);
  theme = inject(ThemeService);

  nav = computed<NavItem[]>(() =>
    this.auth.isAdmin()
      ? [
          { path: '/admin', icon: 'shield', label: 'nav.admin' },
          { path: '/settings', icon: 'sliders', label: 'nav.settings' },
        ]
      : [
          { path: '/dashboard', icon: 'home', label: 'nav.dashboard' },
          { path: '/curriculum', icon: 'book', label: 'nav.curriculum' },
          { path: '/plan', icon: 'calendar', label: 'nav.plan' },
          { path: '/settings', icon: 'sliders', label: 'nav.settings' },
        ],
  );

  initials = computed(() => {
    const name = this.auth.session()?.fullName?.trim() ?? '?';
    const parts = name.split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] ?? '?') + (parts[1]?.[0] ?? '')).toUpperCase();
  });
}
