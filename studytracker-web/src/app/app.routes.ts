import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard, studentGuard } from './core/guards';
import { ShellComponent } from './shared/shell';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', canActivate: [studentGuard], loadComponent: () => import('./pages/dashboard').then((m) => m.DashboardComponent) },
      { path: 'curriculum', canActivate: [studentGuard], loadComponent: () => import('./pages/curriculum').then((m) => m.CurriculumComponent) },
      { path: 'plan', canActivate: [studentGuard], loadComponent: () => import('./pages/plan').then((m) => m.PlanComponent) },
      { path: 'admin', canActivate: [adminGuard], loadComponent: () => import('./pages/admin').then((m) => m.AdminComponent) },
      { path: 'settings', loadComponent: () => import('./pages/settings').then((m) => m.SettingsComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
