import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  AddPlanItemInput, Chapter, Dashboard, Lesson, LessonProgress, PlanItem, ProgressInput,
  Subject, UpdatePlanItemInput, WeeklyPlan, YearLevel,
} from './models';

export interface YearLevelInput { name: string; isPublished: boolean; }
export interface SubjectInput { name: string; academicYearLevelId: number; displayOrder: number; isPublished: boolean; }
export interface ChapterInput { title: string; subjectId: number; displayOrder: number; isPublished: boolean; }
export interface LessonInput { title: string; chapterId: number; displayOrder: number; isPublished: boolean; }

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api`;

  // ---- Curriculum (student: published only) ----
  yearLevels() { return this.http.get<YearLevel[]>(`${this.base}/year-levels`); }
  subjects(yearId: number) { return this.http.get<Subject[]>(`${this.base}/year-levels/${yearId}/subjects`); }
  chapters(subjectId: number) { return this.http.get<Chapter[]>(`${this.base}/subjects/${subjectId}/chapters`); }
  lessons(chapterId: number) { return this.http.get<Lesson[]>(`${this.base}/chapters/${chapterId}/lessons`); }

  // ---- Progress ----
  chapterProgress(chapterId: number) { return this.http.get<LessonProgress[]>(`${this.base}/progress/chapters/${chapterId}`); }
  saveProgress(lessonId: number, body: ProgressInput) {
    return this.http.put<LessonProgress>(`${this.base}/progress/lessons/${lessonId}`, body);
  }

  // ---- Weekly plan ----
  plan(date?: string) {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<WeeklyPlan>(`${this.base}/weekly-plans`, { params });
  }
  addPlanItem(body: AddPlanItemInput) { return this.http.post<PlanItem>(`${this.base}/weekly-plans/items`, body); }
  updatePlanItem(id: number, body: UpdatePlanItemInput) { return this.http.put<PlanItem>(`${this.base}/weekly-plans/items/${id}`, body); }
  completeItem(id: number) { return this.http.post<PlanItem>(`${this.base}/weekly-plans/items/${id}/complete`, {}); }
  uncompleteItem(id: number) { return this.http.delete<PlanItem>(`${this.base}/weekly-plans/items/${id}/complete`); }
  deleteItem(id: number) { return this.http.delete<void>(`${this.base}/weekly-plans/items/${id}`); }

  // ---- Dashboard ----
  dashboard(yearLevelId: number | null) {
    let params = new HttpParams();
    if (yearLevelId) params = params.set('yearLevelId', yearLevelId);
    return this.http.get<Dashboard>(`${this.base}/dashboard`, { params });
  }

  // ---- Admin ----
  adminYearLevels() { return this.http.get<YearLevel[]>(`${this.base}/admin/year-levels`); }
  createYearLevel(b: YearLevelInput) { return this.http.post<YearLevel>(`${this.base}/admin/year-levels`, b); }
  updateYearLevel(id: number, b: YearLevelInput) { return this.http.put<YearLevel>(`${this.base}/admin/year-levels/${id}`, b); }

  adminSubjects(yearId: number) { return this.http.get<Subject[]>(`${this.base}/admin/year-levels/${yearId}/subjects`); }
  createSubject(b: SubjectInput) { return this.http.post<Subject>(`${this.base}/admin/subjects`, b); }
  updateSubject(id: number, b: SubjectInput) { return this.http.put<Subject>(`${this.base}/admin/subjects/${id}`, b); }

  adminChapters(subjectId: number) { return this.http.get<Chapter[]>(`${this.base}/admin/subjects/${subjectId}/chapters`); }
  createChapter(b: ChapterInput) { return this.http.post<Chapter>(`${this.base}/admin/chapters`, b); }
  updateChapter(id: number, b: ChapterInput) { return this.http.put<Chapter>(`${this.base}/admin/chapters/${id}`, b); }

  adminLessons(chapterId: number) { return this.http.get<Lesson[]>(`${this.base}/admin/chapters/${chapterId}/lessons`); }
  createLesson(b: LessonInput) { return this.http.post<Lesson>(`${this.base}/admin/lessons`, b); }
  updateLesson(id: number, b: LessonInput) { return this.http.put<Lesson>(`${this.base}/admin/lessons/${id}`, b); }
}
