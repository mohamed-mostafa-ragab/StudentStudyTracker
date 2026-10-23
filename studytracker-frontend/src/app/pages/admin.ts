import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ApiService } from '../core/api.service';
import { ErrorService } from '../core/error.service';
import { I18nService } from '../core/i18n.service';
import { TPipe } from '../core/t.pipe';
import { ToastService } from '../core/toast.service';
import { IconComponent } from '../shared/icon';

type Level = 'year' | 'subject' | 'chapter' | 'lesson';
interface Row { id: number; label: string; order: number; published: boolean; }

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, TPipe, IconComponent],
  template: `
    <section class="page-head">
      <div>
        <h1>{{ 'admin.title' | t }}</h1>
        <p class="muted">{{ 'admin.sub' | t }}</p>
      </div>
      <button class="btn" type="button" (click)="startCreate()"><app-icon name="plus" [size]="18" />{{ 'admin.new.' + level() | t }}</button>
    </section>

    <nav class="crumbs" aria-label="breadcrumb">
      <button type="button" class="crumb" [class.on]="level() === 'year'" (click)="goTo('year')">{{ 'admin.level.year' | t }}</button>
      @if (year(); as y) {
        <span class="sep">/</span>
        <button type="button" class="crumb" [class.on]="level() === 'subject'" (click)="goTo('subject')">{{ y.label }}</button>
      }
      @if (subject(); as s) {
        <span class="sep">/</span>
        <button type="button" class="crumb" [class.on]="level() === 'chapter'" (click)="goTo('chapter')">{{ s.label }}</button>
      }
      @if (chapter(); as c) {
        <span class="sep">/</span>
        <button type="button" class="crumb on" (click)="goTo('lesson')">{{ c.label }}</button>
      }
    </nav>

    <p class="hint card"><app-icon name="eyeoff" [size]="18" /> {{ 'admin.archiveHint' | t }}</p>

    @if (loading()) {
      <div class="skeleton-grid"><div class="skeleton"></div><div class="skeleton"></div></div>
    } @else if (!rows().length) {
      <div class="card empty"><app-icon name="folder" [size]="36" /><p>{{ 'admin.empty.' + level() | t }}</p></div>
    } @else {
      <ul class="admin-list">
        @for (r of rows(); track r.id) {
          <li class="card admin-row" [class.hidden-row]="!r.published">
            <div class="grow">
              <strong>{{ r.label }}</strong>
              <div class="meta">
                @if (level() !== 'year') { <span class="muted small-text">#{{ i18n.num(r.order) }}</span> }
                <span class="badge" [class]="'badge ' + (r.published ? 'ok' : '')">{{ (r.published ? 'admin.published' : 'admin.hidden') | t }}</span>
              </div>
            </div>
            <div class="item-actions">
              <button class="icon-btn sm" type="button" (click)="togglePublish(r)" [attr.aria-label]="(r.published ? 'admin.hide' : 'admin.publish') | t" [title]="(r.published ? 'admin.hide' : 'admin.publish') | t">
                <app-icon [name]="r.published ? 'eye' : 'eyeoff'" [size]="16" />
              </button>
              <button class="icon-btn sm" type="button" (click)="startEdit(r)" [attr.aria-label]="'common.edit' | t"><app-icon name="edit" [size]="16" /></button>
              @if (level() !== 'lesson') {
                <button class="btn sm ghost" type="button" (click)="enter(r)">{{ 'admin.open.' + level() | t }}<app-icon [name]="i18n.dir() === 'rtl' ? 'left' : 'right'" [size]="16" /></button>
              }
            </div>
          </li>
        }
      </ul>
    }

    @if (form(); as f) {
      <div class="backdrop" (click)="form.set(null)">
        <form class="modal" role="dialog" aria-modal="true" (click)="$event.stopPropagation()" (ngSubmit)="save()">
          <div class="modal-head">
            <h3>{{ (f.id ? 'admin.edit.' : 'admin.new.') + level() | t }}</h3>
            <button class="icon-btn" type="button" (click)="form.set(null)"><app-icon name="x" /></button>
          </div>
          <label class="field">
            <span>{{ 'admin.name' | t }}</span>
            <input type="text" name="label" [(ngModel)]="fLabel" maxlength="200" required />
          </label>
          @if (level() !== 'year') {
            <label class="field">
              <span>{{ 'admin.order' | t }}</span>
              <input type="number" name="order" [(ngModel)]="fOrder" min="0" step="1" />
            </label>
          }
          <label class="switch-row">
            <input type="checkbox" name="pub" [(ngModel)]="fPublished" />
            <span>{{ 'admin.publishedLabel' | t }}</span>
          </label>
          @if (formError()) { <p class="form-error">{{ formError() }}</p> }
          <div class="modal-actions">
            <button class="btn ghost" type="button" (click)="form.set(null)">{{ 'common.cancel' | t }}</button>
            <button class="btn" type="submit" [disabled]="saving()">{{ 'common.save' | t }}</button>
          </div>
        </form>
      </div>
    }
  `,
})
export class AdminComponent {
  i18n = inject(I18nService);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private errors = inject(ErrorService);

  year = signal<Row | null>(null);
  subject = signal<Row | null>(null);
  chapter = signal<Row | null>(null);
  rows = signal<Row[]>([]);
  loading = signal(true);

  level = computed<Level>(() => (this.chapter() ? 'lesson' : this.subject() ? 'chapter' : this.year() ? 'subject' : 'year'));

  form = signal<{ id: number | null } | null>(null);
  fLabel = '';
  fOrder = 1;
  fPublished = true;
  formError = signal('');
  saving = signal(false);

  constructor() { this.load(); }

  @HostListener('document:keydown.escape')
  onEscape() { this.form.set(null); }

  load() {
    this.loading.set(true);
    const done = (rows: Row[]) => { this.rows.set(rows); this.loading.set(false); };
    const fail = (e: unknown) => { this.loading.set(false); this.toast.error(this.errors.message(e)); };

    switch (this.level()) {
      case 'year':
        this.api.adminYearLevels().subscribe({ next: (a) => done(a.map((x) => ({ id: x.id, label: x.name, order: 0, published: x.isPublished ?? true }))), error: fail });
        break;
      case 'subject':
        this.api.adminSubjects(this.year()!.id).subscribe({ next: (a) => done(a.map((x) => ({ id: x.id, label: x.name, order: x.displayOrder ?? 0, published: x.isPublished ?? true }))), error: fail });
        break;
      case 'chapter':
        this.api.adminChapters(this.subject()!.id).subscribe({ next: (a) => done(a.map((x) => ({ id: x.id, label: x.title, order: x.displayOrder ?? 0, published: x.isPublished ?? true }))), error: fail });
        break;
      case 'lesson':
        this.api.adminLessons(this.chapter()!.id).subscribe({ next: (a) => done(a.map((x) => ({ id: x.id, label: x.title, order: x.displayOrder ?? 0, published: x.isPublished ?? true }))), error: fail });
        break;
    }
  }

  enter(r: Row) {
    switch (this.level()) {
      case 'year': this.year.set(r); break;
      case 'subject': this.subject.set(r); break;
      case 'chapter': this.chapter.set(r); break;
    }
    this.load();
  }

  goTo(l: Level) {
    if (l === 'year') { this.year.set(null); this.subject.set(null); this.chapter.set(null); }
    else if (l === 'subject') { this.subject.set(null); this.chapter.set(null); }
    else if (l === 'chapter') { this.chapter.set(null); }
    this.load();
  }

  startCreate() {
    this.fLabel = '';
    this.fOrder = (this.rows().reduce((m, r) => Math.max(m, r.order), 0)) + 1;
    this.fPublished = true;
    this.formError.set('');
    this.form.set({ id: null });
  }

  startEdit(r: Row) {
    this.fLabel = r.label;
    this.fOrder = r.order;
    this.fPublished = r.published;
    this.formError.set('');
    this.form.set({ id: r.id });
  }

  togglePublish(r: Row) {
    this.submit(r.id, r.label, r.order, !r.published).subscribe({
      next: () => { this.toast.success(this.i18n.t(!r.published ? 'admin.nowPublished' : 'admin.nowHidden')); this.load(); },
      error: (e) => this.toast.error(this.errors.message(e)),
    });
  }

  save() {
    const label = this.fLabel.trim();
    if (!label) { this.formError.set(this.i18n.t('admin.nameRequired')); return; }
    const order = Math.max(0, Math.round(Number(this.fOrder) || 0));
    const id = this.form()?.id ?? null;

    this.saving.set(true);
    this.submit(id, label, order, this.fPublished).subscribe({
      next: () => {
        this.saving.set(false);
        this.form.set(null);
        this.toast.success(this.i18n.t('common.saved'));
        this.load();
      },
      error: (e) => { this.saving.set(false); this.formError.set(this.errors.message(e)); },
    });
  }

  /** Create (id = null) or update the entity of the current level. */
  private submit(id: number | null, label: string, order: number, isPublished: boolean): Observable<unknown> {
    switch (this.level()) {
      case 'year': {
        const b = { name: label, isPublished };
        return id ? this.api.updateYearLevel(id, b) : this.api.createYearLevel(b);
      }
      case 'subject': {
        const b = { name: label, academicYearLevelId: this.year()!.id, displayOrder: order, isPublished };
        return id ? this.api.updateSubject(id, b) : this.api.createSubject(b);
      }
      case 'chapter': {
        const b = { title: label, subjectId: this.subject()!.id, displayOrder: order, isPublished };
        return id ? this.api.updateChapter(id, b) : this.api.createChapter(b);
      }
      default: {
        const b = { title: label, chapterId: this.chapter()!.id, displayOrder: order, isPublished };
        return id ? this.api.updateLesson(id, b) : this.api.createLesson(b);
      }
    }
  }
}
