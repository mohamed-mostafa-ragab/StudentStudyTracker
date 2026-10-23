export type LessonStatus = 'NotStarted' | 'InProgress' | 'Completed';
export type PlanItemType = 'NewLesson' | 'Review';

export interface AuthResponse {
  token: string;
  expiresAt: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface YearLevel { id: number; name: string; isPublished: boolean; }
export interface Subject { id: number; academicYearLevelId: number; name: string; displayOrder: number; isPublished: boolean; }
export interface Chapter { id: number; subjectId: number; title: string; displayOrder: number; isPublished: boolean; }
export interface Lesson { id: number; chapterId: number; title: string; displayOrder: number; isPublished: boolean; }

export interface LessonProgress {
  lessonId: number;
  lessonTitle: string;
  hasAttended: boolean;
  hasStudied: boolean;
  hasCompletedExercises: boolean;
  status: LessonStatus;
  updatedAt: string | null;
}
export interface ProgressInput { hasAttended: boolean; hasStudied: boolean; hasCompletedExercises: boolean; }

export interface PlanItem {
  id: number;
  lessonId: number;
  lessonTitle: string;
  subjectName: string;
  type: PlanItemType;
  dueDate: string; // yyyy-MM-dd
  durationInMinutes: number;
  description: string | null;
  isCompleted: boolean;
  completedAt: string | null;
}
export interface WeeklyPlan { id: number | null; weekStartDate: string; weekEndDate: string; items: PlanItem[]; }
export interface AddPlanItemInput { lessonId: number; type: PlanItemType; dueDate: string; durationInMinutes: number; description: string | null; }
export interface UpdatePlanItemInput { dueDate: string; durationInMinutes: number; description: string | null; }

export interface ProgressSummary { totalLessons: number; completedLessons: number; inProgressLessons: number; notStartedLessons: number; completionPercent: number; }
export interface SubjectProgress { subjectId: number; subjectName: string; totalLessons: number; completedLessons: number; completionPercent: number; }
export interface UnfinishedLesson { lessonId: number; lessonTitle: string; subjectName: string; status: LessonStatus; }
export interface WeekSummary { weekStartDate: string; weekEndDate: string; totalItems: number; completedItems: number; }
export interface Dashboard {
  summary: ProgressSummary;
  subjects: SubjectProgress[];
  unfinishedLessons: UnfinishedLesson[];
  overdueItems: PlanItem[];
  dueReviews: PlanItem[];
  thisWeek: WeekSummary;
}
