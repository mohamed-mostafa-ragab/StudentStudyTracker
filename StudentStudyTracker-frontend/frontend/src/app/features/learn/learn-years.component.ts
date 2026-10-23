import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ErrorService } from '../../core/error.service';
import { YearLevel } from '../../core/models';
import { TPipe } from '../../core/t.pipe';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-learn-years',
  imports: [RouterLink, IconComponent, TPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <div class="page-head"><div><h1 class="h1">{{ 'learn.title' | t }}</h1><p class="muted">{{ 'learn.pickYear' | t }}</p></div></div>
      @if (error()) {
        <div class="alert danger">{{ error() }}</div>
      } @else if (years(); as list) {
        @if (list.length) {
          <div class="grid g3">
            @for (y of list; track y.id) {
              <a class="card tile" [routerLink]="['/learn/years', y.id]" [state]="{ name: y.name }">
                <span class="tile-icon"><app-icon name="layers" [size]="26" /></span>
                <strong class="h3">{{ y.name }}</strong>
                <app-icon name="chevron-right" [flip]="true" class="tile-go" />
              </a>
            }
          </div>
        } @else {
          <div class="empty card"><app-icon name="book" [size]="36" /><p>{{ 'learn.noYears' | t }}</p></div>
        }
      } @else {
        <div class="grid g3"><div class="skeleton h100"></div><div class="skeleton h100"></div></div>
      }
    </div>`,
})
export class LearnYearsComponent implements OnInit {
  private api = inject(ApiService);
  private errors = inject(ErrorService);
  protected readonly years = signal<YearLevel[] | null>(null);
  protected readonly error = signal('');

  ngOnInit() {
    this.api.yearLevels().subscribe({
      next: (y) => this.years.set(y),
      error: (e) => this.error.set(this.errors.message(e)),
    });
  }
}
