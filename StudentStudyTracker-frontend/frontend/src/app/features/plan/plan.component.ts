import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { ConfirmService } from '../../core/confirm.service';
import { ErrorService } from '../../core/error.service';
import { I18nService } from '../../core/i18n.service';
import { PlanItem, WeeklyPlan } from '../../core/models';
import { TPipe } from '../../core/t.pipe';
import { ToastService } from '../../core/toast.service';
import { addDays, startOfWeek, toIso, todayIso } from '../../core/utils';
import { IconComponent } from '../../shared/icon.component';
import { PlanDialogComponent } from './plan-dialog.component';

@Component({
  selector: 'app-plan',
  imports: [IconComponent, PlanDialogComponent, TPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <div class="page-head">
        <div><h1 class="h1">{{ 'plan.title' | t }}</h1><p class="muted">{{ rangeLabel() }}</p></div>
        <button class="btn btn-primary" type="button" (click)="openAdd(null)"><app-icon name="plus" [size]="18" />{{ 'plan.addItem' | t }}</button>
      </div>

      <div class="card week-bar">
        <div class="row gap">
          <button class="btn btn-ghost btn-icon" type="button" (click)="shift(-1)" [attr.aria-label]="'plan.prevWeek' | t"><app-icon name="chevron-left" [flip]="true" /></button>
          <button class="btn btn-ghost btn-sm" type="button" (click)="goToday()">{{ 'plan.today' | t }}</button>
          <button class="btn btn-ghost btn-icon" type="button" (click)="shift(1)" [attr.aria-label]="'plan.nextWeek' | t"><app-icon name="chevron-right" [flip]="true" /></button>
        </div>
        <div class="week-prog">
          <span class="muted small">{{ i18n.num(done()) }}/{{ i18n.num(total()) }} {{ 'dash.tasksDone' | t }}</span>
          <div class="progress"><span [style.width.%]="pct()"></span></div>
        </div>
      </div>

      @if (error()) {
        <div class="alert danger">{{ error() }} <button class="btn btn-sm" type="button" (click)="load()">{{ 'common.retry' | t }}</button></div>
      } @else if (plan()) {
        @for (day of days(); track day.iso) {
          <section class="card day" [class.today]="day.iso === today">
            <div class="day-head">
              <div>
                <strong>{{ i18n.dateObj(day.date, { weekday: 'long' }) }}</strong>
                <small class="muted"> {{ i18n.dateObj(day.date, { day: 'numeric', month: 'short' }) }}</small>
                @if (day.iso === today) { <span class="badge info">{{ 'plan.today' | t }}</span> }
              </div>
              <button class="btn btn-ghost btn-icon btn-sm" type="button" (click)="openAdd(day.iso)" [attr.aria-label]="'plan.addItem' | t"><app-icon name="plus" [size]="18" /></button>
            </div>
            @if (day.items.length) {
              @for (i of day.items; track i.id) {
                <div class="item" [class.done]="i.isCompleted">
                  <button class="check" type="button" [class.on]="i.isCompleted" (click)="toggleDone(i)" [attr.aria-label]="(i.isCompleted ? 'plan.undo' : 'plan.done') | t" [attr.aria-pressed]="i.isCompleted">
                    @if (i.isCompleted) { <app-icon name="check" [size]="16" /> }
                  </button>
                  <div class="item-body">
                    <strong class="item-title">{{ i.lessonTitle }}</strong>
                    <div class="row gap wrap meta">
                      <span class="badge" [class.info]="i.type === 'Review'" [class.ok]="i.type === 'NewLesson'">{{ 'plan.type.' + i.type | t }}</span>
                      <span class="muted small">{{ i.subjectName }}</span>
                      <span class="muted small"><app-icon name="clock" [size]="13" /> {{ i18n.num(i.durationInMinutes) }} {{ 'plan.min' | t }}</span>
                    </div>
                    @if (i.description) { <small class="muted">{{ i.description }}</small> }
                  </div>
                  <div class="row">
                    <button class="btn btn-ghost btn-icon btn-sm" type="button" (click)="openEdit(i)" [attr.aria-label]="'common.edit' | t"><app-icon name="edit" [size]="16" /></button>
                    <button class="btn btn-ghost btn-icon btn-sm danger-text" type="button" (click)="remove(i)" [attr.aria-label]="'common.delete' | t"><app-icon name="trash" [size]="16" /></button>
                  </div>
                </div>
              }
            } @else {
              <p class="muted small free">{{ 'plan.free' | t }}</p>
            }
          </section>
        }
      } @else {
        <div class="skeleton h100"></div><div class="skeleton h100"></div><div class="skeleton h100"></div>
      }
    </div>

    @if (dialog(); as dlg) {
      <app-plan-dialog [item]="dlg.item" [defaultDate]="dlg.date" [minDate]="dlg.item ? weekStartIso() : null" [maxDate]="dlg.item ? weekEndIso() : null"
        (closed)="dialog.set(null)" (saved)="onSaved(!!dlg.item)" />
    }`,
})
export class PlanComponent implements OnInit {
  private api = inject(ApiService);
  private errors = inject(ErrorService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  protected i18n = inject(I18nService);

  protected readonly today = todayIso();
  protected readonly anchor = signal(new Date());
  protected readonly plan = signal<WeeklyPlan | null>(null);
  protected readonly error = signal('');
  protected readonly dialog = signal<{ item: PlanItem | null; date: string | null } | null>(null);

  private readonly weekStart = computed(() => startOfWeek(this.anchor()));
  protected readonly weekStartIso = computed(() => toIso(this.weekStart()));
  protected readonly weekEndIso = computed(() => toIso(addDays(this.weekStart(), 6)));

  protected readonly days = computed(() => {
    const items = this.plan()?.items ?? [];
    return Array.from({ length: 7 }, (_, n) => {
      const date = addDays(this.weekStart(), n);
      const iso = toIso(date);
      return { date, iso, items: items.filter((i) => i.dueDate === iso) };
    });
  });
  protected readonly total = computed(() => this.plan()?.items.length ?? 0);
  protected readonly done = computed(() => this.plan()?.items.filter((i) => i.isCompleted).length ?? 0);
  protected readonly pct = computed(() => (this.total() ? (this.done() / this.total()) * 100 : 0));
  protected readonly rangeLabel = computed(
    () => `${this.i18n.dateObj(this.weekStart(), { day: 'numeric', month: 'long' })} – ${this.i18n.dateObj(addDays(this.weekStart(), 6), { day: 'numeric', month: 'long', year: 'numeric' })}`,
  );

  ngOnInit() { this.load(); }

  protected load() {
    this.error.set('');
    this.plan.set(null);
    this.api.plan(this.weekStartIso()).subscribe({
      next: (p) => this.plan.set(p),
      error: (e) => this.error.set(this.errors.message(e)),
    });
  }

  protected shift(weeks: number) { this.anchor.set(addDays(this.anchor(), weeks * 7)); this.load(); }
  protected goToday() { this.anchor.set(new Date()); this.load(); }

  protected openAdd(date: string | null) { this.dialog.set({ item: null, date: date ?? (this.today >= this.weekStartIso() && this.today <= this.weekEndIso() ? this.today : this.weekStartIso()) }); }
  protected openEdit(item: PlanItem) { this.dialog.set({ item, date: null }); }

  protected onSaved(wasEdit: boolean) {
    this.dialog.set(null);
    this.toast.success(this.i18n.t(wasEdit ? 'plan.updatedToast' : 'plan.addedToast'));
    this.load();
  }

  protected toggleDone(i: PlanItem) {
    const call = i.isCompleted ? this.api.uncompleteItem(i.id) : this.api.completeItem(i.id);
    call.subscribe({
      next: (updated) => this.plan.update((p) => (p ? { ...p, items: p.items.map((x) => (x.id === updated.id ? updated : x)) } : p)),
      error: (e) => this.toast.error(this.errors.message(e)),
    });
  }

  protected async remove(i: PlanItem) {
    const ok = await this.confirm.ask({
      title: this.i18n.t('plan.deleteTitle'),
      message: this.i18n.t('plan.deleteMsg', { title: i.lessonTitle }),
      confirmText: this.i18n.t('common.delete'),
      danger: true,
    });
    if (!ok) return;
    this.api.deleteItem(i.id).subscribe({
      next: () => {
        this.plan.update((p) => (p ? { ...p, items: p.items.filter((x) => x.id !== i.id) } : p));
        this.toast.success(this.i18n.t('plan.deletedToast'));
      },
      error: (e) => this.toast.error(this.errors.message(e)),
    });
  }
}
