import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { AuthService } from './core/auth.service';
import { adminGuard, authGuard, guestGuard, studentGuard } from './core/guards';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: () => inject(AuthService).home() },
      {
        path: 'dashboard',
        canActivate: [studentGuard],
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'learn',
        canActivate: [studentGuard],
        children: [
          { path: '', loadComponent: () => import('./features/learn/learn-years.component').then((m) => m.LearnYearsComponent) },
          { path: 'years/:yearId', loadComponent: () => import('./features/learn/learn-subjects.component').then((m) => m.LearnSubjectsComponent) },
          { path: 'subjects/:subjectId', loadComponent: () => import('./features/learn/learn-subject.component').then((m) => m.LearnSubjectComponent) },
        ],
      },
      {
        path: 'plan',
        canActivate: [studentGuard],
        loadComponent: () => import('./features/plan/plan.component').then((m) => m.PlanComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then((m) => m.SettingsComponent),
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          { path: '', data: { level: 'years' }, loadComponent: () => import('./features/admin/admin-level.component').then((m) => m.AdminLevelComponent) },
          { path: 'years/:id', data: { level: 'subjects' }, loadComponent: () => import('./features/admin/admin-level.component').then((m) => m.AdminLevelComponent) },
          { path: 'subjects/:id', data: { level: 'chapters' }, loadComponent: () => import('./features/admin/admin-level.component').then((m) => m.AdminLevelComponent) },
          { path: 'chapters/:id', data: { level: 'lessons' }, loadComponent: () => import('./features/admin/admin-level.component').then((m) => m.AdminLevelComponent) },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
