import { ChangeDetectionStrategy, Component, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ErrorService } from '../../core/error.service';
import { Subject } from '../../core/models';
import { TPipe } from '../../core/t.pipe';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-learn-subjects',
  imports: [RouterLink, IconComponent, TPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <a class="back" routerLink="/learn"><app-icon name="chevron-left" [size]="18" [flip]="true" />{{ 'common.back' | t }}</a>
      <div class="page-head"><div><h1 class="h1">{{ title() }}</h1><p class="muted">{{ 'learn.pickSubject' | t }}</p></div></div>
      @if (error()) {
        <div class="alert danger">{{ error() }}</div>
      } @else if (subjects(); as list) {
        @if (list.length) {
          <div class="grid g3">
            @for (s of list; track s.id) {
              <a class="card tile" [routerLink]="['/learn/subjects', s.id]" [state]="{ name: s.name, yearId: s.academicYearLevelId }">
                <span class="tile-icon alt"><app-icon name="book" [size]="26" /></span>
                <strong class="h3">{{ s.name }}</strong>
                <app-icon name="chevron-right" [flip]="true" class="tile-go" />
              </a>
            }
          </div>
        } @else {
          <div class="empty card"><app-icon name="book" [size]="36" /><p>{{ 'learn.noSubjects' | t }}</p></div>
        }
      } @else {
        <div class="grid g3"><div class="skeleton h100"></div><div class="skeleton h100"></div></div>
      }
    </div>`,
})
export class LearnSubjectsComponent {
  private api = inject(ApiService);
  private errors = inject(ErrorService);
  readonly yearId = input.required<string>();
  protected readonly subjects = signal<Subject[] | null>(null);
  protected readonly error = signal('');
  protected readonly title = signal<string>((history.state as { name?: string } | null)?.name ?? '');

  constructor() {
    effect(() => {
      const id = Number(this.yearId());
      untracked(() => {
        this.subjects.set(null);
        this.error.set('');
        this.api.subjects(id).subscribe({
          next: (s) => this.subjects.set(s),
          error: (e) => this.error.set(this.errors.message(e)),
        });
      });
    });
  }
}
