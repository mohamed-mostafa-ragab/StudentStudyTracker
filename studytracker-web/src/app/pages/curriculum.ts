import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../core/api.service';
import { ErrorService } from '../core/error.service';
import { I18nService } from '../core/i18n.service';
import { Chapter, LessonProgress, ProgressInput, Subject } from '../core/models';
import { TPipe } from '../core/t.pipe';
import { ToastService } from '../core/toast.service';
import { YearStore } from '../core/year.store';
import { AddPlanDialogComponent } from '../shared/add-plan-dialog';
import { IconComponent } from '../shared/icon';

type Flag = keyof ProgressInput;

@Component({
  selector: 'app-curriculum',
  standalone: true,
  imports: [FormsModule, TPipe, IconComponent, AddPlanDialogComponent],
  template: `
    <section class="page-head">
      <div>
        <h1>{{ 'curriculum.title' | t }}</h1>
        <p class="muted">{{ 'curriculum.sub' | t }}</p>
      </div>
      @if (store.years().length > 1) {
        <select class="select-pill" [ngModel]="store.selectedId()" (ngModelChange)="store.select($event)" [attr.aria-label]="'curriculum.year' | t">
          @for (y of store.years(); track y.id) { <option [ngValue]="y.id">{{ y.name }}</option> }
        </select>
      }
    </section>

    @if (store.loaded() && !store.years().length) {
      <div class="card empty"><app-icon name="folder" [size]="36" /><p>{{ 'curriculum.noYears' | t }}</p></div>
    } @else {
      @if (loadingSubjects()) {
        <div class="skeleton-grid"><div class="skeleton"></div></div>
      } @else if (!subjects().length) {
        <div class="card empty"><app-icon name="folder" [size]="36" /><p>{{ 'curriculum.noSubjects' | t }}</p></div>
      } @else {
        <div class="chips" role="tablist">
          @for (s of subjects(); track s.id) {
            <button type="button" class="chip" role="tab" [class.on]="s.id === subjectId()" (click)="pickSubject(s.id)">{{ s.name }}</button>
          }
        </div>

        @if (loadingChapters()) {
          <div class="skeleton-grid"><div class="skeleton"></div><div class="skeleton"></div></div>
        } @else if (!chapters().length) {
          <div class="card empty"><app-icon name="book" [size]="36" /><p>{{ 'curriculum.noChapters' | t }}</p></div>
        } @else {
          <div class="card subject-total">
            <div class="row-between">
              <strong>{{ 'curriculum.subjectProgress' | t }}</strong>
              <span class="muted small-text">{{ i18n.num(totals().done) }}/{{ i18n.num(totals().all) }} · {{ i18n.pct(totals().pct) }}</span>
            </div>
            <div class="bar"><span [style.width.%]="totals().pct"></span></div>
          </div>

          @for (c of chapters(); track c.id) {
            <article class="card chapter">
              <button class="chapter-head" type="button" (click)="toggle(c.id)" [attr.aria-expanded]="isOpen(c.id)">
                <div class="grow">
                  <strong>{{ c.title }}</strong>
                  <span class="muted small-text">{{ 'curriculum.chapterCount' | t: { done: i18n.num(chapterDone(c.id)), total: i18n.num(lessonsOf(c.id).length) } }}</span>
                </div>
                <app-icon [name]="isOpen(c.id) ? 'down' : (i18n.dir() === 'rtl' ? 'left' : 'right')" [size]="20" />
              </button>

              @if (isOpen(c.id)) {
                @if (!lessonsOf(c.id).length) {
                  <p class="muted pad">{{ 'curriculum.noLessons' | t }}</p>
                }
                <ul class="lesson-list">
                  @for (l of lessonsOf(c.id); track l.lessonId) {
                    <li class="lesson" [class.done]="l.status === 'Completed'">
                      <div class="lesson-top">
                        <strong class="grow">{{ l.lessonTitle }}</strong>
                        <span class="badge" [class]="'badge ' + badge(l.status)">{{ 'status.' + l.status | t }}</span>
                      </div>
                      <div class="toggles">
                        <button type="button" class="toggle" [class.on]="l.hasAttended" [disabled]="busy().has(l.lessonId)" (click)="flip(c.id, l, 'hasAttended')">
                          <app-icon name="check" [size]="14" />{{ 'task.attended' | t }}
                        </button>
                        <button type="button" class="toggle" [class.on]="l.hasStudied" [disabled]="busy().has(l.lessonId)" (click)="flip(c.id, l, 'hasStudied')">
                          <app-icon name="check" [size]="14" />{{ 'task.studied' | t }}
                        </button>
                        <button type="button" class="toggle" [class.on]="l.hasCompletedExercises" [disabled]="busy().has(l.lessonId)" (click)="flip(c.id, l, 'hasCompletedExercises')">
                          <app-icon name="check" [size]="14" />{{ 'task.exercises' | t }}
                        </button>
                      </div>
                      <div class="lesson-actions">
                        <button type="button" class="btn sm ghost" [disabled]="busy().has(l.lessonId)" (click)="setAll(c.id, l, l.status !== 'Completed')">
                          <app-icon [name]="l.status === 'Completed' ? 'x' : 'check'" [size]="16" />{{ (l.status === 'Completed' ? 'curriculum.reset' : 'curriculum.markAll') | t }}
                        </button>
                        <button type="button" class="btn sm ghost" (click)="planLesson.set({ id: l.lessonId, title: l.lessonTitle })">
                          <app-icon name="calendar" [size]="16" />{{ 'curriculum.addToPlan' | t }}
                        </button>
                      </div>
                    </li>
                  }
                </ul>
              }
            </article>
          }
        }
      }
    }

    @if (planLesson(); as pl) {
      <app-add-plan-dialog [lesson]="pl" (closed)="planLesson.set(null)" />
    }
  `,
})
export class CurriculumComponent {
  i18n = inject(I18nService);
  store = inject(YearStore);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private errors = inject(ErrorService);

  subjects = signal<Subject[]>([]);
  subjectId = signal<number | null>(null);
  chapters = signal<Chapter[]>([]);
  progress = signal<Record<number, LessonProgress[]>>({});
  open = signal<Set<number>>(new Set());
  busy = signal<Set<number>>(new Set());
  loadingSubjects = signal(true);
  loadingChapters = signal(false);
  planLesson = signal<{ id: number; title: string } | null>(null);

  totals = computed(() => {
    const all = Object.values(this.progress()).flat();
    const done = all.filter((l) => l.status === 'Completed').length;
    return { all: all.length, done, pct: all.length ? (100 * done) / all.length : 0 };
  });

  constructor() {
    this.store.load();
    effect(() => {
      const loaded = this.store.loaded();
      const year = this.store.selectedId();
      if (loaded) untracked(() => this.loadSubjects(year));
    });
  }

  isOpen(id: number) { return this.open().has(id); }
  lessonsOf(id: number): LessonProgress[] { return this.progress()[id] ?? []; }
  chapterDone(id: number) { return this.lessonsOf(id).filter((l) => l.status === 'Completed').length; }
  badge(s: string) { return s === 'Completed' ? 'ok' : s === 'InProgress' ? 'warn' : ''; }

  private loadSubjects(yearId: number | null) {
    this.subjects.set([]); this.chapters.set([]); this.progress.set({}); this.subjectId.set(null);
    if (!yearId) { this.loadingSubjects.set(false); return; }
    this.loadingSubjects.set(true);
    this.api.subjects(yearId).subscribe({
      next: (s) => {
        this.subjects.set(s);
        this.loadingSubjects.set(false);
        if (s.length) this.pickSubject(s[0].id);
      },
      error: (e) => { this.loadingSubjects.set(false); this.toast.error(this.errors.message(e)); },
    });
  }

  pickSubject(id: number) {
    this.subjectId.set(id);
    this.chapters.set([]); this.progress.set({}); this.open.set(new Set());
    this.loadingChapters.set(true);
    this.api.chapters(id).subscribe({
      next: (chs) => {
        this.chapters.set(chs);
        if (!chs.length) { this.loadingChapters.set(false); return; }
        forkJoin(chs.map((c) => this.api.chapterProgress(c.id))).subscribe({
          next: (all) => {
            const map: Record<number, LessonProgress[]> = {};
            chs.forEach((c, i) => (map[c.id] = all[i]));
            this.progress.set(map);
            this.open.set(new Set([chs[0].id]));
            this.loadingChapters.set(false);
          },
          error: (e) => { this.loadingChapters.set(false); this.toast.error(this.errors.message(e)); },
        });
      },
      error: (e) => { this.loadingChapters.set(false); this.toast.error(this.errors.message(e)); },
    });
  }

  toggle(id: number) {
    this.open.update((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  flip(chapterId: number, l: LessonProgress, flag: Flag) {
    this.save(chapterId, l, {
      hasAttended: l.hasAttended,
      hasStudied: l.hasStudied,
      hasCompletedExercises: l.hasCompletedExercises,
      [flag]: !l[flag],
    });
  }

  setAll(chapterId: number, l: LessonProgress, value: boolean) {
    this.save(chapterId, l, { hasAttended: value, hasStudied: value, hasCompletedExercises: value });
  }

  private save(chapterId: number, l: LessonProgress, body: ProgressInput) {
    this.busy.update((s) => new Set(s).add(l.lessonId));
    this.api.saveProgress(l.lessonId, body).subscribe({
      next: (res) => {
        this.progress.update((m) => ({
          ...m,
          [chapterId]: (m[chapterId] ?? []).map((x) => (x.lessonId === l.lessonId ? { ...x, ...res } : x)),
        }));
        this.unbusy(l.lessonId);
      },
      error: (e) => { this.unbusy(l.lessonId); this.toast.error(this.errors.message(e)); },
    });
  }

  private unbusy(id: number) {
    this.busy.update((s) => { const n = new Set(s); n.delete(id); return n; });
  }
}
