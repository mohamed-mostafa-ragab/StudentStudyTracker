import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { ConfirmService } from '../core/confirm.service';
import { ErrorService } from '../core/error.service';
import { I18nService } from '../core/i18n.service';
import { PlanItem, WeeklyPlan } from '../core/models';
import { TPipe } from '../core/t.pipe';
import { ToastService } from '../core/toast.service';
import { addDays, startOfWeekIso, todayIso } from '../core/utils';
import { AddPlanDialogComponent } from '../shared/add-plan-dialog';
import { IconComponent } from '../shared/icon';

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [FormsModule, TPipe, IconComponent, AddPlanDialogComponent],
  template: `
    <section class="page-head">
      <div>
        <h1>{{ 'plan.title' | t }}</h1>
        <p class="muted">{{ 'plan.sub' | t }}</p>
      </div>
      <button class="btn" type="button" (click)="openAdd(defaultDate())"><app-icon name="plus" [size]="18" />{{ 'plan.add' | t }}</button>
    </section>

    <div class="week-nav card">
      <button class="icon-btn" type="button" (click)="shift(-7)" [attr.aria-label]="'plan.prev' | t">
        <app-icon [name]="i18n.dir() === 'rtl' ? 'right' : 'left'" />
      </button>
      <div class="week-title">
        <strong>{{ rangeLabel() }}</strong>
        @if (!isCurrentWeek()) { <button class="link" type="button" (click)="goToday()">{{ 'plan.thisWeek' | t }}</button> }
        @else { <span class="badge ok">{{ 'plan.currentWeek' | t }}</span> }
      </div>
      <button class="icon-btn" type="button" (click)="shift(7)" [attr.aria-label]="'plan.next' | t">
        <app-icon [name]="i18n.dir() === 'rtl' ? 'left' : 'right'" />
      </button>
    </div>

    @if (plan(); as p) {
      @if (p.items.length) {
        <div class="card">
          <div class="row-between">
            <strong>{{ 'plan.weekProgress' | t }}</strong>
            <span class="muted small-text">{{ 'plan.itemsDone' | t: { done: i18n.num(doneCount()), total: i18n.num(p.items.length) } }}</span>
          </div>
          <div class="bar"><span [style.width.%]="pct()"></span></div>
        </div>
      }

      <div class="days">
        @for (d of days(); track d.iso) {
          <section class="card day" [class.today]="d.iso === today">
            <div class="day-head">
              <div>
                <strong>{{ i18n.weekday(d.iso) }}</strong>
                <span class="muted small-text"> · {{ i18n.date(d.iso) }}</span>
                @if (d.iso === today) { <span class="badge ok">{{ 'plan.today' | t }}</span> }
              </div>
              <button class="icon-btn sm" type="button" (click)="openAdd(d.iso)" [attr.aria-label]="'plan.add' | t"><app-icon name="plus" [size]="16" /></button>
            </div>

            @if (!d.items.length) {
              <p class="muted small-text empty-day">{{ 'plan.emptyDay' | t }}</p>
            }
            <ul class="plan-list">
              @for (it of d.items; track it.id) {
                <li class="plan-item" [class.done]="it.isCompleted" [class.late]="!it.isCompleted && it.dueDate < today">
                  <button type="button" class="check" [class.on]="it.isCompleted" [disabled]="busyId() === it.id" (click)="toggleDone(it)"
                          [attr.aria-label]="(it.isCompleted ? 'plan.undo' : 'plan.done') | t">
                    @if (it.isCompleted) { <app-icon name="check" [size]="16" /> }
                  </button>
                  <div class="grow">
                    <strong>{{ it.lessonTitle }}</strong>
                    <div class="meta">
                      <span class="badge" [class]="'badge ' + (it.type === 'Review' ? 'info' : '')">{{ 'plan.type.' + it.type | t }}</span>
                      <span class="muted small-text">{{ it.subjectName }}</span>
                      <span class="muted small-text"><app-icon name="clock" [size]="12" /> {{ i18n.num(it.durationInMinutes) }} {{ 'common.min' | t }}</span>
                    </div>
                    @if (it.description) { <p class="muted small-text desc">{{ it.description }}</p> }
                  </div>
                  <div class="item-actions">
                    <button class="icon-btn sm" type="button" (click)="startEdit(it)" [attr.aria-label]="'common.edit' | t"><app-icon name="edit" [size]="16" /></button>
                    <button class="icon-btn sm danger" type="button" (click)="remove(it)" [attr.aria-label]="'common.delete' | t"><app-icon name="trash" [size]="16" /></button>
                  </div>
                </li>
              }
            </ul>
          </section>
        }
      </div>
    } @else if (failed()) {
      <div class="card empty">
        <app-icon name="alert" [size]="32" /><p>{{ 'common.loadFailed' | t }}</p>
        <button class="btn" type="button" (click)="load(weekStart())">{{ 'common.retry' | t }}</button>
      </div>
    } @else {
      <div class="skeleton-grid"><div class="skeleton"></div><div class="skeleton"></div></div>
    }

    @if (adding(); as a) {
      <app-add-plan-dialog [date]="a.date" (closed)="onAdded($event)" />
    }

    @if (editing(); as e) {
      <div class="backdrop" (click)="editing.set(null)">
        <form class="modal" role="dialog" aria-modal="true" (click)="$event.stopPropagation()" (ngSubmit)="saveEdit()">
          <div class="modal-head">
            <h3>{{ 'plan.editTitle' | t }}</h3>
            <button class="icon-btn" type="button" (click)="editing.set(null)"><app-icon name="x" /></button>
          </div>
          <div class="picked"><app-icon name="book" [size]="18" /><strong>{{ e.lessonTitle }}</strong></div>
          <div class="grid-2">
            <label class="field">
              <span>{{ 'plan.dueDate' | t }}</span>
              <input type="date" name="due" [(ngModel)]="editDate" [min]="weekStart()" [max]="weekEnd()" required />
            </label>
            <label class="field">
              <span>{{ 'plan.duration' | t }}</span>
              <input type="number" name="dur" [(ngModel)]="editDuration" min="5" max="600" step="5" required />
            </label>
          </div>
          <label class="field">
            <span>{{ 'plan.description' | t }}</span>
            <textarea name="desc" rows="2" maxlength="500" [(ngModel)]="editDescription"></textarea>
          </label>
          @if (editError()) { <p class="form-error">{{ editError() }}</p> }
          <div class="modal-actions">
            <button class="btn ghost" type="button" (click)="editing.set(null)">{{ 'common.cancel' | t }}</button>
            <button class="btn" type="submit" [disabled]="saving()">{{ 'common.save' | t }}</button>
          </div>
        </form>
      </div>
    }
  `,
})
export class PlanComponent {
  i18n = inject(I18nService);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private errors = inject(ErrorService);
  private confirm = inject(ConfirmService);

  readonly today = todayIso();
  weekStart = signal(startOfWeekIso(todayIso()));
  weekEnd = computed(() => addDays(this.weekStart(), 6));
  plan = signal<WeeklyPlan | null>(null);
  failed = signal(false);
  busyId = signal<number | null>(null);

  adding = signal<{ date: string } | null>(null);
  editing = signal<PlanItem | null>(null);
  editDate = '';
  editDuration = 30;
  editDescription = '';
  editError = signal('');
  saving = signal(false);

  isCurrentWeek = computed(() => this.weekStart() === startOfWeekIso(this.today));
  rangeLabel = computed(() => `${this.i18n.date(this.weekStart())} – ${this.i18n.date(this.weekEnd(), { day: 'numeric', month: 'short', year: 'numeric' })}`);

  days = computed(() => {
    const p = this.plan();
    const start = this.weekStart();
    return Array.from({ length: 7 }, (_, i) => {
      const iso = addDays(start, i);
      return { iso, items: (p?.items ?? []).filter((x) => x.dueDate === iso) };
    });
  });
  doneCount = computed(() => (this.plan()?.items ?? []).filter((i) => i.isCompleted).length);
  pct = computed(() => {
    const n = this.plan()?.items.length ?? 0;
    return n ? (100 * this.doneCount()) / n : 0;
  });

  constructor() { this.load(this.weekStart()); }

  @HostListener('document:keydown.escape')
  onEscape() { this.editing.set(null); }

  /** Today if we're viewing the current week, otherwise the first day of the viewed week. */
  defaultDate() { return this.isCurrentWeek() ? this.today : this.weekStart(); }

  load(start: string) {
    this.failed.set(false);
    this.plan.set(null);
    this.api.plan(start).subscribe({
      next: (p) => { this.plan.set(p); this.weekStart.set(p.weekStartDate); },
      error: (e) => { this.failed.set(true); this.toast.error(this.errors.message(e)); },
    });
  }

  shift(days: number) { const s = addDays(this.weekStart(), days); this.weekStart.set(s); this.load(s); }
  goToday() { const s = startOfWeekIso(this.today); this.weekStart.set(s); this.load(s); }

  openAdd(date: string) { this.adding.set({ date }); }
  onAdded(item: PlanItem | null) {
    this.adding.set(null);
    if (!item) return;
    const s = startOfWeekIso(item.dueDate);
    this.weekStart.set(s);
    this.load(s);
  }

  private replace(item: PlanItem) {
    this.plan.update((p) => (p ? { ...p, items: p.items.map((x) => (x.id === item.id ? item : x)) } : p));
  }

  toggleDone(it: PlanItem) {
    this.busyId.set(it.id);
    const call = it.isCompleted ? this.api.uncompleteItem(it.id) : this.api.completeItem(it.id);
    call.subscribe({
      next: (res) => { this.busyId.set(null); this.replace(res); },
      error: (e) => { this.busyId.set(null); this.toast.error(this.errors.message(e)); },
    });
  }

  startEdit(it: PlanItem) {
    this.editDate = it.dueDate;
    this.editDuration = it.durationInMinutes;
    this.editDescription = it.description ?? '';
    this.editError.set('');
    this.editing.set(it);
  }

  saveEdit() {
    const it = this.editing();
    if (!it) return;
    const dur = Math.round(Number(this.editDuration));
    if (!this.editDate || this.editDate < this.weekStart() || this.editDate > this.weekEnd()) {
      this.editError.set(this.i18n.t('err.dueOutsideWeek')); return;
    }
    if (!Number.isFinite(dur) || dur < 5 || dur > 600) { this.editError.set(this.i18n.t('plan.durationRange')); return; }

    this.saving.set(true);
    this.api.updatePlanItem(it.id, { dueDate: this.editDate, durationInMinutes: dur, description: this.editDescription.trim() || null }).subscribe({
      next: (res) => { this.saving.set(false); this.editing.set(null); this.replace(res); this.toast.success(this.i18n.t('common.saved')); },
      error: (e) => { this.saving.set(false); this.editError.set(this.errors.message(e)); },
    });
  }

  async remove(it: PlanItem) {
    const ok = await this.confirm.ask({
      title: this.i18n.t('plan.deleteTitle'),
      message: this.i18n.t('plan.deleteMsg', { title: it.lessonTitle }),
      confirmText: this.i18n.t('common.delete'),
      danger: true,
    });
    if (!ok) return;
    this.api.deleteItem(it.id).subscribe({
      next: () => {
        this.plan.update((p) => (p ? { ...p, items: p.items.filter((x) => x.id !== it.id) } : p));
        this.toast.success(this.i18n.t('plan.deleted'));
      },
      error: (e) => this.toast.error(this.errors.message(e)),
    });
  }
}
