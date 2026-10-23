import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ErrorService } from '../../core/error.service';
import { I18nService } from '../../core/i18n.service';
import { TPipe } from '../../core/t.pipe';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../shared/icon.component';
import { ModalComponent } from '../../shared/modal.component';

export type AdminLevel = 'years' | 'subjects' | 'chapters' | 'lessons';
interface Row { id: number; name: string; order: number; published: boolean; }

/**
 * One page for the whole curriculum tree. The route decides the level:
 * years -> subjects -> chapters -> lessons. The route param `id` is the parent's id.
 */
@Component({
  selector: 'app-admin-level',
  imports: [ReactiveFormsModule, RouterLink, IconComponent, ModalComponent, TPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      @if (level() !== 'years') {
        <a class="back" [routerLink]="backLink()"><app-icon name="chevron-left" [size]="18" [flip]="true" />{{ 'common.back' | t }}</a>
      }
      <div class="page-head">
        <div>
          <h1 class="h1">{{ ('admin.' + level()) | t }}</h1>
          @if (parentName()) { <p class="muted">{{ parentName() }}</p> } @else { <p class="muted">{{ 'admin.hint' | t }}</p> }
        </div>
        <button class="btn btn-primary" type="button" (click)="openForm(null)"><app-icon name="plus" [size]="18" />{{ ('admin.new.' + level()) | t }}</button>
      </div>

      @if (error()) {
        <div class="alert danger">{{ error() }} <button class="btn btn-sm" type="button" (click)="load()">{{ 'common.retry' | t }}</button></div>
      } @else if (rows(); as list) {
        @if (list.length) {
          <ul class="list card">
            @for (r of list; track r.id) {
              <li class="list-item admin-row" [class.dim]="!r.published">
                @if (childPath(); as cp) {
                  <a class="grow row-link" [routerLink]="[cp, r.id]" [state]="{ name: r.name, parentId: id() }">
                    <strong>{{ r.name }}</strong>
                    @if (level() !== 'years') { <small class="muted">#{{ i18n.num(r.order) }}</small> }
                  </a>
                } @else {
                  <div class="grow"><strong>{{ r.name }}</strong><small class="muted"> #{{ i18n.num(r.order) }}</small></div>
                }
                <button type="button" class="switch" [class.on]="r.published" role="switch" [attr.aria-checked]="r.published"
                  (click)="togglePublished(r)" [attr.aria-label]="'admin.published' | t" [title]="(r.published ? 'admin.published' : 'admin.hidden') | t"><span></span></button>
                <span class="badge" [class.ok]="r.published" [class.muted]="!r.published">{{ (r.published ? 'admin.published' : 'admin.hidden') | t }}</span>
                <button class="btn btn-ghost btn-icon btn-sm" type="button" (click)="openForm(r)" [attr.aria-label]="'common.edit' | t"><app-icon name="edit" [size]="16" /></button>
                @if (childPath()) { <app-icon name="chevron-right" [flip]="true" [size]="18" /> }
              </li>
            }
          </ul>
        } @else {
          <div class="empty card"><app-icon name="layers" [size]="36" /><p>{{ 'admin.empty' | t }}</p></div>
        }
      } @else {
        <div class="skeleton h100"></div><div class="skeleton h100"></div>
      }
    </div>

    @if (formOpen()) {
      <app-modal [title]="((editing() ? 'admin.edit.' : 'admin.new.') + level()) | t" (closed)="formOpen.set(false)">
        <form [formGroup]="form" (ngSubmit)="save()" novalidate>
          <div class="field">
            <label class="label" for="nm">{{ (level() === 'years' || level() === 'subjects' ? 'admin.name' : 'admin.titleField') | t }}</label>
            <input id="nm" class="input" formControlName="name" [maxlength]="level() === 'years' || level() === 'subjects' ? 100 : 200" />
            @if (form.controls.name.touched && form.controls.name.invalid) { <small class="error-text">{{ 'val.required' | t }}</small> }
          </div>
          @if (level() !== 'years') {
            <div class="field">
              <label class="label" for="ord">{{ 'admin.order' | t }}</label>
              <input id="ord" class="input" type="number" formControlName="order" dir="ltr" />
            </div>
          }
          <label class="check-line">
            <input type="checkbox" formControlName="published" /> <span>{{ 'admin.publishedLabel' | t }}</span>
          </label>
          @if (formError()) { <div class="alert danger">{{ formError() }}</div> }
          <div class="row end gap">
            <button class="btn btn-ghost" type="button" (click)="formOpen.set(false)">{{ 'common.cancel' | t }}</button>
            <button class="btn btn-primary" type="submit" [disabled]="saving()">{{ (saving() ? 'common.loading' : 'common.save') | t }}</button>
          </div>
        </form>
      </app-modal>
    }`,
})
export class AdminLevelComponent {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private errors = inject(ErrorService);
  private toast = inject(ToastService);
  protected i18n = inject(I18nService);

  /** From route `data` (component input binding). */
  readonly level = input<AdminLevel>('years');
  /** From the route param: the parent's id (not present on the root level). */
  readonly id = input<string>();

  protected readonly rows = signal<Row[] | null>(null);
  protected readonly error = signal('');
  protected readonly formOpen = signal(false);
  protected readonly editing = signal<Row | null>(null);
  protected readonly saving = signal(false);
  protected readonly formError = signal('');
  protected readonly parentName = signal('');
  private nav = (history.state ?? {}) as { name?: string; parentId?: string };

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    order: [1],
    published: [true],
  });

  protected readonly childPath = computed(() => {
    switch (this.level()) {
      case 'years': return '/admin/years';
      case 'subjects': return '/admin/subjects';
      case 'chapters': return '/admin/chapters';
      default: return null;
    }
  });

  protected backLink() {
    const p = this.nav.parentId;
    switch (this.level()) {
      case 'chapters': return p ? `/admin/years/${p}` : '/admin';
      case 'lessons': return p ? `/admin/subjects/${p}` : '/admin';
      default: return '/admin';
    }
  }

  constructor() {
    effect(() => {
      this.level();
      this.id();
      untracked(() => {
        this.nav = (history.state ?? {}) as { name?: string; parentId?: string };
        this.parentName.set(this.nav.name ?? '');
        this.load();
      });
    });
  }

  private parent(): number { return Number(this.id()); }

  protected load() {
    this.rows.set(null);
    this.error.set('');
    const p = this.parent();
    let source: Observable<Row[]>;
    switch (this.level()) {
      case 'years':
        source = new Observable((s) => this.api.adminYearLevels().subscribe({ next: (r) => { s.next(r.map((x) => ({ id: x.id, name: x.name, order: 0, published: x.isPublished }))); s.complete(); }, error: (e) => s.error(e) }));
        break;
      case 'subjects':
        source = new Observable((s) => this.api.adminSubjects(p).subscribe({ next: (r) => { s.next(r.map((x) => ({ id: x.id, name: x.name, order: x.displayOrder, published: x.isPublished }))); s.complete(); }, error: (e) => s.error(e) }));
        break;
      case 'chapters':
        source = new Observable((s) => this.api.adminChapters(p).subscribe({ next: (r) => { s.next(r.map((x) => ({ id: x.id, name: x.title, order: x.displayOrder, published: x.isPublished }))); s.complete(); }, error: (e) => s.error(e) }));
        break;
      default:
        source = new Observable((s) => this.api.adminLessons(p).subscribe({ next: (r) => { s.next(r.map((x) => ({ id: x.id, name: x.title, order: x.displayOrder, published: x.isPublished }))); s.complete(); }, error: (e) => s.error(e) }));
    }
    source.subscribe({ next: (r) => this.rows.set(r), error: (e) => this.error.set(this.errors.message(e)) });
  }

  /** Create (row = null) or update with the full body the API expects. */
  private send(row: Row | null, v: { name: string; order: number; published: boolean }): Observable<unknown> {
    const p = this.parent();
    const name = v.name.trim();
    switch (this.level()) {
      case 'years': {
        const b = { name, isPublished: v.published };
        return row ? this.api.updateYearLevel(row.id, b) : this.api.createYearLevel(b);
      }
      case 'subjects': {
        const b = { name, academicYearLevelId: p, displayOrder: v.order, isPublished: v.published };
        return row ? this.api.updateSubject(row.id, b) : this.api.createSubject(b);
      }
      case 'chapters': {
        const b = { title: name, subjectId: p, displayOrder: v.order, isPublished: v.published };
        return row ? this.api.updateChapter(row.id, b) : this.api.createChapter(b);
      }
      default: {
        const b = { title: name, chapterId: p, displayOrder: v.order, isPublished: v.published };
        return row ? this.api.updateLesson(row.id, b) : this.api.createLesson(b);
      }
    }
  }

  protected openForm(row: Row | null) {
    this.editing.set(row);
    this.formError.set('');
    const next = (this.rows() ?? []).reduce((m, r) => Math.max(m, r.order), 0) + 1;
    this.form.reset({ name: row?.name ?? '', order: row?.order ?? next, published: row?.published ?? true });
    this.formOpen.set(true);
  }

  protected save() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.formError.set('');
    this.send(this.editing(), this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.toast.success(this.i18n.t('admin.saved'));
        this.load();
      },
      error: (e) => {
        this.saving.set(false);
        this.formError.set(this.errors.message(e));
      },
    });
  }

  protected togglePublished(r: Row) {
    const updated = { ...r, published: !r.published };
    this.rows.update((list) => (list ?? []).map((x) => (x.id === r.id ? updated : x)));
    this.send(r, { name: r.name, order: r.order, published: updated.published }).subscribe({
      error: (e) => {
        this.rows.update((list) => (list ?? []).map((x) => (x.id === r.id ? r : x)));
        this.toast.error(this.errors.message(e));
      },
    });
  }
}
