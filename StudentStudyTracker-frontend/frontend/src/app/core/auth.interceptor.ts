import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { I18nService } from './i18n.service';
import { ToastService } from './toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const toast = inject(ToastService);
  const i18n = inject(I18nService);

  const isApi = req.url.startsWith(environment.apiUrl);
  const isAuthCall = req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register');
  const token = auth.token();

  const request =
    isApi && token && !isAuthCall ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(request).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && isApi && err.status === 401 && !isAuthCall && token) {
        auth.logout();
        toast.error(i18n.t('err.sessionExpired'));
      }
      return throwError(() => err);
    }),
  );
};
