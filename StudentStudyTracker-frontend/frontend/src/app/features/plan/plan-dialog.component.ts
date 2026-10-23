import { ChangeDetectionStrategy, Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ErrorService } from '../../core/error.service';
import { Chapter, Lesson, PlanItem, PlanItemType, Subject, YearLevel } from '../../core/models';
import { TPipe } from '../../core/t.pipe';
import { todayIso } from '../../core/utils';
import { ModalComponent } from '../../shared/modal.component';

/** Add a plan item (optionally for a preset lesson) or edit an existing one. */
@Component({
  selector: 'app-plan-dialog',
  imports: [ReactiveFormsModule, ModalComponent, TPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal [title]="(item() ? 'plan.editItem' : 'plan.addItem') | t" (closed)="closed.emit()">
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        @if (item(); as it) {
          <p class="lesson-ref"><strong>{{ it.lessonTitle }}</strong><small class="muted">{{ it.subjectName }}</small></p>
        } @else if (presetLesson(); as pl) {
          <p class="lesson-ref"><strong>{{ pl.title }}</strong></p>
        } @else {
          <div class="field">
            <label class="label" for="y">{{ 'plan.year' | t }}</label>
            <select id="y" class="select" (change)="onYear($event)">
              <option value="">{{ 'common.choose' | t }}</option>
              @for (y of years(); track y.id) { <option [value]="y.id">{{ y.name }}</option> }
            </select>
          </div>
          <div class="field">
            <label class="label" for="s">{{ 'plan.subject' | t }}</label>
            <select id="s" class="select" [disabled]="!subjects().length" (change)="onSubject($event)">
              <option value="">{{ 'common.choose' | t }}</option>
              @for (s of subjects(); track s.id) { <option [value]="s.id">{{ s.name }}</option> }
            </select>
          </div>
          <div class="field">
            <label class="label" for="c">{{ 'plan.chapter' | t }}</label>
            <select id="c" class="select" [disabled]="!chapters().length" (change)="onChapter($event)">
              <option value="">{{ 'common.choose' | t }}</option>
              @for (c of chapters(); track c.id) { <option [value]="c.id">{{ c.title }}</option> }
            </select>
          </div>
          <div class="field">
            <label class="label" for="l">{{ 'plan.lesson' | t }}</label>
            <select id="l" class="select" [disabled]="!lessons().length" (change)="onLesson($event)">
              <option value="">{{ 'common.choose' | t }}</option>
              @for (l of lessons(); track l.id) { <option [value]="l.id">{{ l.title }}</option> }
            </select>
            @if (submitted() && !lessonId()) { <small class="error-text">{{ 'val.pickLesson' | t }}</small> }
          </div>
        }

        @if (!item()) {
          <div class="field">
            <span class="label">{{ 'plan.type' | t }}</span>
            <div class="seg">
              <button type="button" [class.on]="form.controls.type.value === 'NewLesson'" (click)="form.controls.type.setValue('NewLesson')">{{ 'plan.type.NewLesson' | t }}</button>
              <button type="button" [class.on]="form.controls.type.value === 'Review'" (click)="form.controls.type.setValue('Review')">{{ 'plan.type.Review' | t }}</button>
            </div>
            @if (form.controls.type.value === 'Review') { <small class="hint">{{ 'plan.reviewHint' | t }}</small> }
          </div>
        }

        <div class="row gap">
          <div class="field grow">
            <label class="label" for="d">{{ 'plan.dueDate' | t }}</label>
            <input id="d" class="input" type="date" formControlName="dueDate" [min]="minDate() ?? null" [max]="maxDate() ?? null" dir="ltr" />
            @if (form.controls.dueDate.touched && form.controls.dueDate.invalid) { <small class="error-text">{{ 'val.required' | t }}</small> }
          </div>
          <div class="field grow">
            <label class="label" for="m">{{ 'plan.duration' | t }}</label>
            <input id="m" class="input" type="number" min="5" max="600" step="5" formControlName="durationInMinutes" dir="ltr" />
            @if (form.controls.durationInMinutes.invalid) { <small class="error-text">{{ 'val.duration' | t }}</small> }
          </div>
        </div>
        <div class="field">
          <label class="label" for="n">{{ 'plan.note' | t }}</label>
          <textarea id="n" class="textarea" rows="3" maxlength="500" formControlName="description" [placeholder]="'plan.notePh' | t"></textarea>
        </div>

        @if (error()) { <div class="alert danger">{{ error() }}</div> }
        <div class="row end gap">
          <button class="btn btn-ghost" type="button" (click)="closed.emit()">{{ 'common.cancel' | t }}</button>
          <button class="btn btn-primary" type="submit" [disabled]="loading()">{{ (loading() ? 'common.loading' : 'common.save') | t }}</button>
        </div>
      </form>
    </app-modal>`,
})
export class PlanDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private errors = inject(ErrorService);

  readonly presetLesson = input<{ id: number; title: string } | null>(null);
  readonly item = input<PlanItem | null>(null);
  readonly minDate = input<string | null>(null);
  readonly maxDate = input<string | null>(null);
  readonly defaultDate = input<string | null>(null);
  readonly closed = output<void>();
  readonly saved = output<void>();

  protected readonly years = signal<YearLevel[]>([]);
  protected readonly subjects = signal<Subject[]>([]);
  protected readonly chapters = signal<Chapter[]>([]);
  protected readonly lessons = signal<Lesson[]>([]);
  protected readonly lessonId = signal<number | null>(null);
  protected readonly submitted = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.fb.nonNullable.group({
    type: ['NewLesson' as PlanItemType],
    dueDate: ['', Validators.required],
    durationInMinutes: [30, [Validators.required, Validators.min(5), Validators.max(600)]],
    description: [''],
  });

  ngOnInit() {
    const it = this.item();
    if (it) {
      this.form.patchValue({ dueDate: it.dueDate, durationInMinutes: it.durationInMinutes, description: it.description ?? '' });
    } else {
      this.form.patchValue({ dueDate: this.defaultDate() ?? todayIso() });
      const pl = this.presetLesson();
      if (pl) this.lessonId.set(pl.id);
      else this.api.yearLevels().subscribe({ next: (y) => this.years.set(y), error: (e) => this.error.set(this.errors.message(e)) });
    }
  }

  private num(ev: Event): number | null {
    const v = (ev.target as HTMLSelectElement).value;
    return v ? Number(v) : null;
  }

  protected onYear(ev: Event) {
    const id = this.num(ev);
    this.subjects.set([]); this.chapters.set([]); this.lessons.set([]); this.lessonId.set(null);
    if (id) this.api.subjects(id).subscribe((s) => this.subjects.set(s));
  }
  protected onSubject(ev: Event) {
    const id = this.num(ev);
    this.chapters.set([]); this.lessons.set([]); this.lessonId.set(null);
    if (id) this.api.chapters(id).subscribe((c) => this.chapters.set(c));
  }
  protected onChapter(ev: Event) {
    const id = this.num(ev);
    this.lessons.set([]); this.lessonId.set(null);
    if (id) this.api.lessons(id).subscribe((l) => this.lessons.set(l));
  }
  protected onLesson(ev: Event) { this.lessonId.set(this.num(ev)); }

  protected submit() {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    const v = this.form.getRawValue();
    const it = this.item();
    if (this.form.invalid || (!it && !this.lessonId()) || this.loading()) return;

    this.loading.set(true);
    this.error.set('');
    const description = v.description.trim() || null;

    const request = it
      ? this.api.updatePlanItem(it.id, { dueDate: v.dueDate, durationInMinutes: v.durationInMinutes, description })
      : this.api.addPlanItem({ lessonId: this.lessonId()!, type: v.type, dueDate: v.dueDate, durationInMinutes: v.durationInMinutes, description });

    request.subscribe({
      next: () => this.saved.emit(),
      error: (e) => {
        this.error.set(this.errors.message(e));
        this.loading.set(false);
      },
    });
  }
}
