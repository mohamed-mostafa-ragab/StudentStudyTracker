import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse } from './models';

export interface Session { token: string; expiresAt: number; email: string; fullName: string; roles: string[]; }
const KEY = 'sst.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private base = `${environment.apiUrl}/api/auth`;

  private readonly _session = signal<Session | null>(this.load());
  readonly session = this._session.asReadonly();
  readonly isAdmin = computed(() => this._session()?.roles.includes('Admin') ?? false);
  readonly isStudent = computed(() => this._session()?.roles.includes('Student') ?? false);

  private load(): Session | null {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const s = JSON.parse(raw) as Session;
      return s.expiresAt > Date.now() ? s : null;
    } catch {
      return null;
    }
  }

  private store(r: AuthResponse) {
    const s: Session = {
      token: r.token,
      expiresAt: Date.parse(r.expiresAt),
      email: r.email,
      fullName: r.fullName,
      roles: r.roles,
    };
    localStorage.setItem(KEY, JSON.stringify(s));
    this._session.set(s);
  }

  token(): string | null { return this._session()?.token ?? null; }

  /** True only if there is a session that has not expired yet. */
  isValid(): boolean {
    const s = this._session();
    if (s && s.expiresAt <= Date.now()) {
      this.logout(false);
      return false;
    }
    return !!s;
  }

  home(): string { return this.isAdmin() ? '/admin' : '/dashboard'; }

  login(body: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.base}/login`, body).pipe(tap((r) => this.store(r)));
  }

  register(body: { fullName: string; email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.base}/register`, body).pipe(tap((r) => this.store(r)));
  }

  changePassword(body: { currentPassword: string; newPassword: string }) {
    return this.http.post<void>(`${this.base}/change-password`, body);
  }

  logout(navigate = true) {
    localStorage.removeItem(KEY);
    this._session.set(null);
    if (navigate) this.router.navigateByUrl('/login');
  }
}
