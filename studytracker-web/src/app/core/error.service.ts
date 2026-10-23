import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { I18nService } from './i18n.service';

/** Maps the API's English messages to translation keys. */
const PATTERNS: [RegExp, string][] = [
  [/Invalid email or password/i, 'err.invalidLogin'],
  [/already registered|already taken|DuplicateEmail|DuplicateUserName/i, 'err.emailTaken'],
  [/(Year level|Subject|Chapter|Lesson|Plan item) not found/i, 'err.notFound'],
  [/only review a lesson you have already started/i, 'err.reviewNotStarted'],
  [/already in the plan|plan item already exists/i, 'err.planDuplicate'],
  [/within the plan week/i, 'err.dueOutsideWeek'],
  [/saved concurrently/i, 'err.concurrent'],
  [/Invalid token/i, 'err.sessionExpired'],
  [/Incorrect password|PasswordMismatch/i, 'err.wrongCurrent'],
  [/uppercase/i, 'err.pwUpper'],
  [/lowercase/i, 'err.pwLower'],
  [/at least one digit|'0'-'9'/i, 'err.pwDigit'],
  [/non alphanumeric/i, 'err.pwSymbol'],
  [/at least \d+ characters/i, 'err.pwLength'],
];

@Injectable({ providedIn: 'root' })
export class ErrorService {
  private i18n = inject(I18nService);

  message(err: unknown): string {
    const t = (k: string) => this.i18n.t(k);
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) return t('err.network');
      if (err.status === 429) return t('err.tooMany');
      if (err.status === 403) return t('err.forbidden');
      if (err.status >= 500) return t('err.server');

      const raw = err.error as unknown;
      if (typeof raw === 'string' && raw.trim()) return this.translate(raw);
      const body = raw as { message?: string; detail?: string; title?: string; errors?: Record<string, string[]> } | null;
      const msg = body?.message ?? body?.detail;
      if (msg) return this.translate(msg);
      if (body?.errors) {
        const first = Object.values(body.errors).flat()[0];
        return first ? `${t('err.validation')} ${first}` : t('err.validation');
      }
      if (err.status === 404) return t('err.notFound');
      if (err.status === 409) return t('err.conflict');
    }
    return t('err.generic');
  }

  private translate(msg: string): string {
    const found = PATTERNS.filter(([re]) => re.test(msg)).map(([, key]) => this.i18n.t(key));
    return found.length ? [...new Set(found)].join(' ') : msg;
  }
}
