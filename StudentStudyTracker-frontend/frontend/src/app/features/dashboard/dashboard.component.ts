import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ErrorService } from '../../core/error.service';
import { I18nService } from '../../core/i18n.service';
import { Dashboard, PlanItem, YearLevel } from '../../core/models';
import { TPipe } from '../../core/t.pipe';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../shared/icon.component';
import { RingComponent } from '../../shared/ring.component';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, IconComponent, RingComponent, TPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <div class="page-head">
        <div>
          <h1 class="h1">{{ 'dash.hello' | t: { name: firstName() } }}</h1>
          <p class="muted">{{ today() }}</p>
        </div>
        @if (years().length > 1) {
          <select class="select auto" [value]="yearId() ?? ''" (change)="onYear($event)" [attr.aria-label]="'dash.year' | t">
            <option value="">{{ 'dash.allYears' | t }}</option>
            @for (y of years(); track y.id) { <option [value]="y.id">{{ y.name }}</option> }
          </select>
        }
      </div>

      @if (error()) {
        <div class="alert danger">{{ error() }} <button class="btn btn-sm" type="button" (click)="load()">{{ 'common.retry' | t }}</button></div>
      } @else if (data(); as d) {
        <div class="grid g2">
          <section class="card hero">
            <app-ring [value]="d.summary.completionPercent" [size]="124" [stroke]="12" />
            <div class="hero-text">
              <h2 class="h2">{{ 'dash.overall' | t }}</h2>
              <p class="muted">{{ 'dash.lessonsOf' | t: { done: i18n.num(d.summary.completedLessons), total: i18n.num(d.summary.totalLessons) } }}</p>
              <div class="row gap wrap">
                <span class="badge ok">{{ 'status.Completed' | t }} · {{ i18n.num(d.summary.completedLessons) }}</span>
                <span class="badge warn">{{ 'status.InProgress' | t }} · {{ i18n.num(d.summary.inProgressLessons) }}</span>
                <span class="badge muted">{{ 'status.NotStarted' | t }} · {{ i18n.num(d.summary.notStartedLessons) }}</span>
              </div>
            </div>
          </section>

          <section class="card">
            <div class="card-head">
              <h2 class="h2"><app-icon name="calendar" [size]="20" /> {{ 'dash.thisWeek' | t }}</h2>
              <a class="btn btn-ghost btn-sm" routerLink="/plan">{{ 'dash.openPlan' | t }}</a>
            </div>
            <p class="muted">{{ i18n.date(d.thisWeek.weekStartDate) }} – {{ i18n.date(d.thisWeek.weekEndDate) }}</p>
            <div class="stat-line"><strong>{{ i18n.num(d.thisWeek.completedItems) }}</strong><span class="muted"> / {{ i18n.num(d.thisWeek.totalItems) }} {{ 'dash.tasksDone' | t }}</span></div>
            <div class="progress"><span [style.width.%]="weekPct()"></span></div>
            @if (d.thisWeek.totalItems === 0) { <p class="muted small">{{ 'dash.noPlan' | t }}</p> }
          </section>
        </div>

        @if (d.overdueItems.length) {
          <section class="card accent-danger">
            <h2 class="h2"><app-icon name="alert" [size]="20" /> {{ 'dash.overdue' | t }} <span class="count">{{ i18n.num(d.overdueItems.length) }}</span></h2>
            <ul class="list">
              @for (i of d.overdueItems; track i.id) {
                <li class="list-item">
                  <div class="grow"><strong>{{ i.lessonTitle }}</strong><small class="muted">{{ i.subjectName }} · {{ i18n.date(i.dueDate, { weekday: 'short', day: 'numeric', month: 'short' }) }}</small></div>
                  <button class="btn btn-sm btn-primary" type="button" (click)="complete(i)"><app-icon name="check" [size]="16" />{{ 'plan.done' | t }}</button>
                </li>
              }
            </ul>
          </section>
        }

        @if (d.dueReviews.length) {
          <section class="card accent-info">
            <h2 class="h2"><app-icon name="repeat" [size]="20" /> {{ 'dash.reviews' | t }} <span class="count">{{ i18n.num(d.dueReviews.length) }}</span></h2>
            <ul class="list">
              @for (i of d.dueReviews; track i.id) {
                <li class="list-item">
                  <div class="grow"><strong>{{ i.lessonTitle }}</strong><small class="muted">{{ i.subjectName }} · {{ i18n.date(i.dueDate, { weekday: 'short', day: 'numeric', month: 'short' }) }}</small></div>
                  <button class="btn btn-sm btn-primary" type="button" (click)="complete(i)"><app-icon name="check" [size]="16" />{{ 'plan.done' | t }}</button>
                </li>
              }
            </ul>
          </section>
        }

        <div class="grid g2">
          <section class="card">
            <h2 class="h2"><app-icon name="chart" [size]="20" /> {{ 'dash.bySubject' | t }}</h2>
            @if (d.subjects.length) {
              <ul class="list">
                @for (s of d.subjects; track s.subjectId) {
                  <li class="subject-row">
                    <div class="row between"><strong>{{ s.subjectName }}</strong><span class="muted small">{{ i18n.num(s.completedLessons) }}/{{ i18n.num(s.totalLessons) }} · {{ i18n.pct(s.completionPercent) }}</span></div>
                    <div class="progress"><span [style.width.%]="s.completionPercent"></span></div>
                  </li>
                }
              </ul>
            } @else {
              <p class="muted">{{ 'dash.noSubjects' | t }}</p>
            }
          </section>

          <section class="card">
            <h2 class="h2"><app-icon name="target" [size]="20" /> {{ 'dash.unfinished' | t }}</h2>
            @if (d.unfinishedLessons.length) {
              <ul class="list">
                @for (l of d.unfinishedLessons; track l.lessonId) {
                  <li class="list-item"><div class="grow"><strong>{{ l.lessonTitle }}</strong><small class="muted">{{ l.subjectName }}</small></div><span class="badge warn">{{ 'status.InProgress' | t }}</span></li>
                }
              </ul>
              <a class="btn btn-ghost btn-sm" routerLink="/learn">{{ 'dash.continue' | t }}</a>
            } @else {
              <p class="muted">{{ 'dash.noUnfinished' | t }}</p>
            }
          </section>
        </div>
      } @else {
        <div class="grid g2"><div class="skeleton h160"></div><div class="skeleton h160"></div></div>
        <div class="skeleton h200"></div>
      }
    </div>`,
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private errors = inject(ErrorService);
  private toast = inject(ToastService);
  protected i18n = inject(I18nService);

  protected readonly data = signal<Dashboard | null>(null);
  protected readonly years = signal<YearLevel[]>([]);
  protected readonly yearId = signal<number | null>(null);
  protected readonly error = signal('');

  protected readonly firstName = computed(() => (this.auth.session()?.fullName ?? '').split(' ')[0]);
  protected readonly today = computed(() =>
    this.i18n.dateObj(new Date(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  );
  protected readonly weekPct = computed(() => {
    const w = this.data()?.thisWeek;
    return w && w.totalItems > 0 ? (w.completedItems / w.totalItems) * 100 : 0;
  });

  ngOnInit() {
    this.api.yearLevels().subscribe({ next: (y) => this.years.set(y), error: () => undefined });
    this.load();
  }

  protected load() {
    this.error.set('');
    this.api.dashboard(this.yearId()).subscribe({
      next: (d) => this.data.set(d),
      error: (e) => this.error.set(this.errors.message(e)),
    });
  }

  protected onYear(ev: Event) {
    const v = (ev.target as HTMLSelectElement).value;
    this.yearId.set(v ? Number(v) : null);
    this.data.set(null);
    this.load();
  }

  protected complete(item: PlanItem) {
    this.api.completeItem(item.id).subscribe({
      next: () => {
        this.toast.success(this.i18n.t('plan.completedToast'));
        this.load();
      },
      error: (e) => this.toast.error(this.errors.message(e)),
    });
  }
}
