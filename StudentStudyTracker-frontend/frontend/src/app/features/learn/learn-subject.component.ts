import { ChangeDetectionStrategy, Component, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ErrorService } from '../../core/error.service';
import { I18nService } from '../../core/i18n.service';
import { Chapter, LessonProgress } from '../../core/models';
import { TPipe } from '../../core/t.pipe';
import { ToastService } from '../../core/toast.service';
import { computeStatus } from '../../core/utils';
import { IconComponent } from '../../shared/icon.component';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { PlanDialogComponent } from '../plan/plan-dialog.component';

type Task = 'hasAttended' | 'hasStudied' | 'hasCompletedExercises';
const TASKS: { field: Task; key: string }[] = [
  { field: 'hasAttended', key: 'task.attended' },
  { field: 'hasStudied', key: 'task.studied' },
  { field: 'hasCompletedExercises', key: 'task.exercises' },
];

@Component({
  selector: 'app-learn-subject',
  imports: [RouterLink, IconComponent, StatusBadgeComponent, PlanDialogComponent, TPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <a class="back" [routerLink]="backLink()"><app-icon name="chevron-left" [size]="18" [flip]="true" />{{ 'common.back' | t }}</a>
      <div class="page-head"><div><h1 class="h1">{{ title() }}</h1><p class="muted">{{ 'learn.trackHint' | t }}</p></div></div>

      @if (error()) {
        <div class="alert danger">{{ error() }}</div>
      } @else if (chapters(); as list) {
        @if (list.length) {
          @for (c of list; track c.id) {
            <section class="card acc">
              <button class="acc-head" type="button" (click)="toggle(c)" [attr.aria-expanded]="isOpen(c.id)">
                <span class="acc-title">{{ c.title }}</span>
                @if (stats(c.id); as st) {
                  <span class="muted small">{{ i18n.num(st.done) }}/{{ i18n.num(st.total) }}</span>
                }
                <app-icon [name]="isOpen(c.id) ? 'chevron-up' : 'chevron-down'" [size]="20" />
              </button>
              @if (isOpen(c.id)) {
                <div class="acc-body">
                  @if (lessons()[c.id]; as ls) {
                    @if (ls.length) {
                      @for (l of ls; track l.lessonId) {
                        <div class="lesson">
                          <div class="row between wrap">
                            <strong>{{ l.lessonTitle }}</strong>
                            <app-status-badge [status]="l.status" />
                          </div>
                          <div class="row gap wrap tasks">
                            @for (task of tasks; track task.field) {
                              <button type="button" class="chip" [class.on]="l[task.field]" [attr.aria-pressed]="l[task.field]" (click)="toggleTask(c.id, l, task.field)">
                                <app-icon [name]="l[task.field] ? 'check' : 'plus'" [size]="14" />{{ task.key | t }}
                              </button>
                            }
                            <button type="button" class="btn btn-ghost btn-sm push" (click)="planLesson.set({ id: l.lessonId, title: l.lessonTitle })">
                              <app-icon name="calendar" [size]="16" />{{ 'learn.addToPlan' | t }}
                            </button>
                          </div>
                        </div>
                      }
                    } @else {
                      <p class="muted">{{ 'learn.noLessons' | t }}</p>
                    }
                  } @else {
                    <div class="skeleton h60"></div>
                  }
                </div>
              }
            </section>
          }
        } @else {
          <div class="empty card"><app-icon name="book" [size]="36" /><p>{{ 'learn.noChapters' | t }}</p></div>
        }
      } @else {
        <div class="skeleton h100"></div><div class="skeleton h100"></div>
      }
    </div>

    @if (planLesson(); as pl) {
      <app-plan-dialog [presetLesson]="pl" (closed)="planLesson.set(null)" (saved)="onPlanSaved()" />
    }`,
})
export class LearnSubjectComponent {
  private api = inject(ApiService);
  private errors = inject(ErrorService);
  private toast = inject(ToastService);
  protected i18n = inject(I18nService);

  readonly subjectId = input.required<string>();
  protected readonly tasks = TASKS;
  protected readonly chapters = signal<Chapter[] | null>(null);
  protected readonly error = signal('');
  protected readonly open = signal<Set<number>>(new Set());
  protected readonly lessons = signal<Record<number, LessonProgress[] | undefined>>({});
  protected readonly planLesson = signal<{ id: number; title: string } | null>(null);

  private readonly nav = (history.state ?? {}) as { name?: string; yearId?: number };
  protected readonly title = signal(this.nav.name ?? '');
  protected backLink() { return this.nav.yearId ? `/learn/years/${this.nav.yearId}` : '/learn'; }

  constructor() {
    effect(() => {
      const id = Number(this.subjectId());
      untracked(() => {
        this.chapters.set(null);
        this.error.set('');
        this.open.set(new Set());
        this.lessons.set({});
        this.api.chapters(id).subscribe({
          next: (c) => this.chapters.set(c),
          error: (e) => this.error.set(this.errors.message(e)),
        });
      });
    });
  }

  protected isOpen(id: number) { return this.open().has(id); }

  protected stats(chapterId: number) {
    const ls = this.lessons()[chapterId];
    return ls ? { done: ls.filter((l) => l.status === 'Completed').length, total: ls.length } : null;
  }

  protected toggle(c: Chapter) {
    const next = new Set(this.open());
    if (next.has(c.id)) {
      next.delete(c.id);
    } else {
      next.add(c.id);
      if (!this.lessons()[c.id]) this.loadChapter(c.id);
    }
    this.open.set(next);
  }

  private loadChapter(chapterId: number) {
    this.api.chapterProgress(chapterId).subscribe({
      next: (ls) => this.lessons.update((m) => ({ ...m, [chapterId]: ls })),
      error: (e) => {
        this.toast.error(this.errors.message(e));
        this.open.update((s) => { const n = new Set(s); n.delete(chapterId); return n; });
      },
    });
  }

  protected toggleTask(chapterId: number, lesson: LessonProgress, field: Task) {
    const body = {
      hasAttended: lesson.hasAttended,
      hasStudied: lesson.hasStudied,
      hasCompletedExercises: lesson.hasCompletedExercises,
      [field]: !lesson[field],
    };
    const previous = lesson;
    // optimistic update, reverted if the API rejects it
    this.replace(chapterId, { ...lesson, ...body, status: computeStatus(body.hasAttended, body.hasStudied, body.hasCompletedExercises) });
    this.api.saveProgress(lesson.lessonId, body).subscribe({
      next: (saved) => this.replace(chapterId, saved),
      error: (e) => {
        this.replace(chapterId, previous);
        this.toast.error(this.errors.message(e));
      },
    });
  }

  private replace(chapterId: number, updated: LessonProgress) {
    this.lessons.update((m) => ({
      ...m,
      [chapterId]: (m[chapterId] ?? []).map((l) => (l.lessonId === updated.lessonId ? updated : l)),
    }));
  }

  protected onPlanSaved() {
    this.planLesson.set(null);
    this.toast.success(this.i18n.t('plan.addedToast'));
  }
}
