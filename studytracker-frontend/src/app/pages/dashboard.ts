import { NgTemplateOutlet } from '@angular/common';
import { Component, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { ErrorService } from '../core/error.service';
import { I18nService } from '../core/i18n.service';
import { Dashboard, PlanItem } from '../core/models';
import { TPipe } from '../core/t.pipe';
import { ToastService } from '../core/toast.service';
import { YearStore } from '../core/year.store';
import { IconComponent } from '../shared/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, FormsModule, NgTemplateOutlet, TPipe, IconComponent],
  template: `
    <section class="page-head">
      <div>
        <h1>{{ 'dash.hello' | t: { name: firstName() } }}</h1>
        <p class="muted">{{ 'dash.sub' | t }}</p>
      </div>
      @if (store.years().length > 1) {
        <select class="select-pill" [ngModel]="store.selectedId()" (ngModelChange)="store.select($event)" [attr.aria-label]="'curriculum.year' | t">
          @for (y of store.years(); track y.id) { <option [ngValue]="y.id">{{ y.name }}</option> }
        </select>
      }
    </section>

    @if (loading() && !data()) {
      <div class="skeleton-grid"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div>
    } @else if (failed()) {
      <div class="card empty">
        <app-icon name="alert" [size]="32" />
        <p>{{ 'common.loadFailed' | t }}</p>
        <button class="btn" type="button" (click)="load(store.selectedId())">{{ 'common.retry' | t }}</button>
      </div>
    } @else if (data(); as d) {
      @if (d.summary.totalLessons === 0) {
        <div class="card empty">
          <app-icon name="folder" [size]="36" />
          <p>{{ 'dash.noCurriculum' | t }}</p>
        </div>
      } @else {
        <section class="hero card">
          <div class="ring" [attr.aria-label]="'dash.overall' | t">
            <svg viewBox="0 0 120 120" width="132" height="132">
              <circle class="ring-bg" cx="60" cy="60" r="52" />
              <circle class="ring-fg" cx="60" cy="60" r="52" [attr.stroke-dasharray]="circ" [attr.stroke-dashoffset]="offset(d.summary.completionPercent)" />
            </svg>
            <div class="ring-label"><strong>{{ i18n.pct(d.summary.completionPercent) }}</strong><span>{{ 'dash.overall' | t }}</span></div>
          </div>
          <div class="stats">
            <div class="stat ok"><strong>{{ i18n.num(d.summary.completedLessons) }}</strong><span>{{ 'status.Completed' | t }}</span></div>
            <div class="stat warn"><strong>{{ i18n.num(d.summary.inProgressLessons) }}</strong><span>{{ 'status.InProgress' | t }}</span></div>
            <div class="stat"><strong>{{ i18n.num(d.summary.notStartedLessons) }}</strong><span>{{ 'status.NotStarted' | t }}</span></div>
          </div>
        </section>

        <section class="card week-card">
          <div class="row-between">
            <h2><app-icon name="calendar" [size]="20" /> {{ 'dash.thisWeek' | t }}</h2>
            <a class="link" routerLink="/plan">{{ 'dash.openPlan' | t }}</a>
          </div>
          @if (d.thisWeek.totalItems === 0) {
            <p class="muted">{{ 'dash.weekEmpty' | t }}</p>
          } @else {
            <div class="bar"><span [style.width.%]="weekPct(d)"></span></div>
            <p class="muted small-text">{{ 'plan.itemsDone' | t: { done: i18n.num(d.thisWeek.completedItems), total: i18n.num(d.thisWeek.totalItems) } }}</p>
          }
        </section>
      }

      @if (d.overdueItems.length) {
        <section class="card">
          <h2 class="danger-text"><app-icon name="alert" [size]="20" /> {{ 'dash.overdue' | t }} <span class="count">{{ i18n.num(d.overdueItems.length) }}</span></h2>
          <ul class="list">
            @for (it of d.overdueItems; track it.id) {
              <ng-container *ngTemplateOutlet="row; context: { $implicit: it }" />
            }
          </ul>
        </section>
      }

      @if (d.dueReviews.length) {
        <section class="card">
          <h2><app-icon name="repeat" [size]="20" /> {{ 'dash.reviews' | t }} <span class="count">{{ i18n.num(d.dueReviews.length) }}</span></h2>
          <ul class="list">
            @for (it of d.dueReviews; track it.id) {
              <ng-container *ngTemplateOutlet="row; context: { $implicit: it }" />
            }
          </ul>
        </section>
      }

      @if (d.subjects.length) {
        <section class="card">
          <h2><app-icon name="target" [size]="20" /> {{ 'dash.subjects' | t }}</h2>
          <div class="subject-list">
            @for (s of d.subjects; track s.subjectId) {
              <div class="subject-row">
                <div class="row-between">
                  <strong>{{ s.subjectName }}</strong>
                  <span class="muted small-text">{{ i18n.num(s.completedLessons) }}/{{ i18n.num(s.totalLessons) }} · {{ i18n.pct(s.completionPercent) }}</span>
                </div>
                <div class="bar"><span [style.width.%]="s.completionPercent"></span></div>
              </div>
            }
          </div>
        </section>
      }

      @if (d.unfinishedLessons.length) {
        <section class="card">
          <h2><app-icon name="book" [size]="20" /> {{ 'dash.unfinished' | t }}</h2>
          <ul class="list">
            @for (l of d.unfinishedLessons; track l.lessonId) {
              <li class="list-item">
                <div class="grow"><strong>{{ l.lessonTitle }}</strong><span class="muted small-text">{{ l.subjectName }}</span></div>
                <span class="badge warn">{{ 'status.InProgress' | t }}</span>
              </li>
            }
          </ul>
          <a class="link" routerLink="/curriculum">{{ 'dash.continue' | t }}</a>
        </section>
      }
    }

    <ng-template #row let-it>
      <li class="list-item">
        <div class="grow">
          <strong>{{ it.lessonTitle }}</strong>
          <span class="muted small-text">{{ it.subjectName }} · {{ i18n.date(it.dueDate) }} · {{ i18n.num(it.durationInMinutes) }} {{ 'common.min' | t }}</span>
        </div>
        <button class="btn sm" type="button" [disabled]="busyId() === it.id" (click)="complete(it)">
          <app-icon name="check" [size]="16" />{{ 'plan.done' | t }}
        </button>
      </li>
    </ng-template>
  `,
})
export class DashboardComponent {
  i18n = inject(I18nService);
  store = inject(YearStore);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private errors = inject(ErrorService);

  readonly circ = 2 * Math.PI * 52;
  data = signal<Dashboard | null>(null);
  loading = signal(true);
  failed = signal(false);
  busyId = signal<number | null>(null);

  constructor() {
    this.store.load();
    effect(() => {
      const loaded = this.store.loaded();
      const id = this.store.selectedId();
      if (loaded) untracked(() => this.load(id));
    });
  }

  firstName() { return (this.auth.session()?.fullName ?? '').split(' ')[0]; }
  offset(p: number) { return this.circ * (1 - Math.min(100, Math.max(0, p)) / 100); }
  weekPct(d: Dashboard) { return d.thisWeek.totalItems ? (100 * d.thisWeek.completedItems) / d.thisWeek.totalItems : 0; }

  load(id: number | null) {
    this.loading.set(true);
    this.failed.set(false);
    this.api.dashboard(id).subscribe({
      next: (d) => { this.data.set(d); this.loading.set(false); },
      error: (e) => { this.loading.set(false); this.failed.set(true); this.toast.error(this.errors.message(e)); },
    });
  }

  complete(item: PlanItem) {
    this.busyId.set(item.id);
    this.api.completeItem(item.id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.toast.success(this.i18n.t('plan.completedToast'));
        this.load(this.store.selectedId());
      },
      error: (e) => { this.busyId.set(null); this.toast.error(this.errors.message(e)); },
    });
  }
}
