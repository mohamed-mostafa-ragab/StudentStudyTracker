import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isValid() ? true : inject(Router).createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isValid() ? inject(Router).createUrlTree([auth.home()]) : true;
};

export const studentGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isStudent() ? true : inject(Router).createUrlTree([auth.home()]);
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAdmin() ? true : inject(Router).createUrlTree([auth.home()]);
};
