import { Component, HostListener, OnInit, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { ErrorService } from '../core/error.service';
import { I18nService } from '../core/i18n.service';
import { Chapter, Lesson, PlanItem, PlanItemType, Subject } from '../core/models';
import { TPipe } from '../core/t.pipe';
import { ToastService } from '../core/toast.service';
import { todayIso } from '../core/utils';
import { YearStore } from '../core/year.store';
import { IconComponent } from './icon';

/**
 * Adds a lesson to the weekly plan.
 * - With a `lesson` input: the lesson is fixed (used from the curriculum page).
 * - Without it: shows cascading pickers year -> subject -> chapter -> lesson.
 */
@Component({
  selector: 'app-add-plan-dialog',
  standalone: true,
  imports: [FormsModule, TPipe, IconComponent],
  template: `
    <div class="backdrop" (click)="close(null)">
      <form class="modal" role="dialog" aria-modal="true" (click)="$event.stopPropagation()" (ngSubmit)="submit()" #f="ngForm">
        <div class="modal-head">
          <h3>{{ 'plan.addTitle' | t }}</h3>
          <button class="icon-btn" type="button" (click)="close(null)" [attr.aria-label]="'common.close' | t"><app-icon name="x" /></button>
        </div>

        @if (lesson(); as l) {
          <div class="picked"><app-icon name="book" [size]="18" /><strong>{{ l.title }}</strong></div>
        } @else {
          <div class="grid-2">
            <label class="field">
              <span>{{ 'curriculum.year' | t }}</span>
              <select name="year" [ngModel]="yearId()" (ngModelChange)="onYear($event)">
                @for (y of store.years(); track y.id) { <option [ngValue]="y.id">{{ y.name }}</option> }
              </select>
            </label>
            <label class="field">
              <span>{{ 'curriculum.subject' | t }}</span>
              <select name="subject" [ngModel]="subjectId()" (ngModelChange)="onSubject($event)" [disabled]="!subjects().length">
                @for (s of subjects(); track s.id) { <option [ngValue]="s.id">{{ s.name }}</option> }
              </select>
            </label>
            <label class="field">
              <span>{{ 'curriculum.chapter' | t }}</span>
              <select name="chapter" [ngModel]="chapterId()" (ngModelChange)="onChapter($event)" [disabled]="!chapters().length">
                @for (c of chapters(); track c.id) { <option [ngValue]="c.id">{{ c.title }}</option> }
              </select>
            </label>
            <label class="field">
              <span>{{ 'curriculum.lesson' | t }}</span>
              <select name="lesson" [(ngModel)]="lessonId" [disabled]="!lessons().length">
                @for (x of lessons(); track x.id) { <option [ngValue]="x.id">{{ x.title }}</option> }
              </select>
            </label>
          </div>
          @if (picking() && !lessons().length) { <p class="muted small-text">{{ 'plan.noLessons' | t }}</p> }
        }

        <div class="field">
          <span>{{ 'plan.type' | t }}</span>
          <div class="segmented">
            <button type="button" [class.on]="type === 'NewLesson'" (click)="type = 'NewLesson'">
              <app-icon name="book" [size]="16" />{{ 'plan.type.NewLesson' | t }}
            </button>
            <button type="button" [class.on]="type === 'Review'" (click)="type = 'Review'">
              <app-icon name="repeat" [size]="16" />{{ 'plan.type.Review' | t }}
            </button>
          </div>
          @if (type === 'Review') { <small class="muted">{{ 'plan.reviewHint' | t }}</small> }
        </div>

        <div class="grid-2">
          <label class="field">
            <span>{{ 'plan.dueDate' | t }}</span>
            <input type="date" name="due" [(ngModel)]="dueDate" required />
          </label>
          <label class="field">
            <span>{{ 'plan.duration' | t }}</span>
            <input type="number" name="dur" [(ngModel)]="duration" min="5" max="600" step="5" required />
          </label>
        </div>

        <label class="field">
          <span>{{ 'plan.description' | t }}</span>
          <textarea name="desc" rows="2" maxlength="500" [(ngModel)]="description" [placeholder]="'plan.descriptionHint' | t"></textarea>
        </label>

        @if (formError()) { <p class="form-error">{{ formError() }}</p> }

        <div class="modal-actions">
          <button class="btn ghost" type="button" (click)="close(null)">{{ 'common.cancel' | t }}</button>
          <button class="btn" type="submit" [disabled]="busy()">
            <app-icon name="plus" [size]="18" />{{ 'plan.add' | t }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class AddPlanDialogComponent implements OnInit {
  lesson = input<{ id: number; title: string } | null>(null);
  date = input<string>(todayIso());
  closed = output<PlanItem | null>();

  store = inject(YearStore);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private errors = inject(ErrorService);
  private i18n = inject(I18nService);

  yearId = signal<number | null>(null);
  subjects = signal<Subject[]>([]);
  chapters = signal<Chapter[]>([]);
  lessons = signal<Lesson[]>([]);
  subjectId = signal<number | null>(null);
  chapterId = signal<number | null>(null);
  lessonId: number | null = null;
  picking = signal(false);

  type: PlanItemType = 'NewLesson';
  dueDate = todayIso();
  duration = 30;
  description = '';
  busy = signal(false);
  formError = signal('');

  ngOnInit() {
    this.dueDate = this.date();
    if (!this.lesson()) {
      this.store.load();
      const init = () => this.onYear(this.store.selectedId() ?? this.store.years()[0]?.id ?? null);
      if (this.store.loaded()) init();
      else {
        // wait for the store to finish loading
        const t = setInterval(() => {
          if (this.store.loaded()) { clearInterval(t); init(); }
        }, 50);
      }
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() { this.close(null); }

  onYear(id: number | null) {
    this.yearId.set(id);
    this.subjects.set([]); this.chapters.set([]); this.lessons.set([]);
    this.subjectId.set(null); this.chapterId.set(null); this.lessonId = null;
    if (!id) return;
    this.api.subjects(id).subscribe((s) => {
      this.subjects.set(s);
      this.onSubject(s[0]?.id ?? null);
    });
  }

  onSubject(id: number | null) {
    this.subjectId.set(id);
    this.chapters.set([]); this.lessons.set([]);
    this.chapterId.set(null); this.lessonId = null;
    if (!id) return;
    this.api.chapters(id).subscribe((c) => {
      this.chapters.set(c);
      this.onChapter(c[0]?.id ?? null);
    });
  }

  onChapter(id: number | null) {
    this.chapterId.set(id);
    this.lessons.set([]); this.lessonId = null;
    this.picking.set(false);
    if (!id) return;
    this.api.lessons(id).subscribe((l) => {
      this.lessons.set(l);
      this.lessonId = l[0]?.id ?? null;
      this.picking.set(true);
    });
  }

  submit() {
    this.formError.set('');
    const lessonId = this.lesson()?.id ?? this.lessonId;
    if (!lessonId) { this.formError.set(this.i18n.t('plan.pickLesson')); return; }
    if (!this.dueDate) { this.formError.set(this.i18n.t('plan.pickDate')); return; }
    const dur = Math.round(Number(this.duration));
    if (!Number.isFinite(dur) || dur < 5 || dur > 600) { this.formError.set(this.i18n.t('plan.durationRange')); return; }

    this.busy.set(true);
    this.api.addPlanItem({
      lessonId,
      type: this.type,
      dueDate: this.dueDate,
      durationInMinutes: dur,
      description: this.description.trim() || null,
    }).subscribe({
      next: (item) => {
        this.busy.set(false);
        this.toast.success(this.i18n.t('plan.added'));
        this.close(item);
      },
      error: (e) => {
        this.busy.set(false);
        this.formError.set(this.errors.message(e));
      },
    });
  }

  close(item: PlanItem | null) { this.closed.emit(item); }
}
