using Microsoft.EntityFrameworkCore;
using StudentStudyTracker.Application.Common;
using StudentStudyTracker.Application.DTOs.Dashboard;
using StudentStudyTracker.Application.Interfaces;
using StudentStudyTracker.Domain.Enums;
using StudentStudyTracker.Infrastructure.Persistence;

namespace StudentStudyTracker.Infrastructure.Services
{
    internal class DashboardService(AppDbContext db) : IDashboardService
    {
        private sealed record LessonRow(
            int LessonId,
            string Title,
            int SubjectId,
            string SubjectName,
            int SubjectOrder,
            bool Completed,
            bool Started);

        public async Task<DashboardDto> GetAsync(string studentId, int? yearLevelId)
        {
            var today = AppClock.Today;
            var weekStart = WeekCalendar.StartOfWeek(today);

            // 1) الدروس المنشورة + حالة كل درس للطالب، في query واحدة
            var rows = await db.Lessons
                .AsNoTracking()
                .WherePublished()
                .Where(l => yearLevelId == null || l.Chapter.Subject.AcademicYearLevelId == yearLevelId)
                .Select(l => new LessonRow(
                    l.Id,
                    l.Title,
                    l.Chapter.SubjectId,
                    l.Chapter.Subject.Name,
                    l.Chapter.Subject.DisplayOrder,
                    l.StudentLessonProgresses.Any(p => p.StudentId == studentId
                        && p.HasAttended && p.HasStudied && p.HasCompletedExercises),
                    l.StudentLessonProgresses.Any(p => p.StudentId == studentId
                        && (p.HasAttended || p.HasStudied || p.HasCompletedExercises))))
                .ToListAsync();

            var total = rows.Count;
            var completed = rows.Count(r => r.Completed);
            var inProgress = rows.Count(r => r.Started && !r.Completed);

            var summary = new ProgressSummaryDto(
                total, completed, inProgress, total - completed - inProgress, Percent(completed, total));

            var subjects = rows
                .GroupBy(r => new { r.SubjectId, r.SubjectName, r.SubjectOrder })
                .OrderBy(g => g.Key.SubjectOrder).ThenBy(g => g.Key.SubjectId)
                .Select(g => new SubjectProgressDto(
                    g.Key.SubjectId,
                    g.Key.SubjectName,
                    g.Count(),
                    g.Count(r => r.Completed),
                    Percent(g.Count(r => r.Completed), g.Count())))
                .ToList();

            var unfinished = rows
                .Where(r => r.Started && !r.Completed)
                .Take(20)
                .Select(r => new UnfinishedLessonDto(r.LessonId, r.Title, r.SubjectName, LessonStatus.InProgress))
                .ToList();

            // 2) المتأخر: درس جديد في الخطة عدّى ميعاده ولسه ما اتعلّمش مكتمل
            var overdue = await db.WeeklyPlanItems
                .AsNoTracking()
                .Where(i => i.WeeklyPlan.StudentId == studentId
                         && i.Type == WeeklyPlanItemType.NewLesson
                         && i.CompletedAt == null
                         && i.DueDate < today)
                .WhereLessonPublished()
                .OrderBy(i => i.DueDate).ThenBy(i => i.Id)
                .Take(50)
                .Select(PlanProjections.ItemToDto)
                .ToListAsync();

            // 3) المراجعات المستحقة: ميعادها النهارده أو قبل كده ولسه ما اتعملتش
            var dueReviews = await db.WeeklyPlanItems
                .AsNoTracking()
                .Where(i => i.WeeklyPlan.StudentId == studentId
                         && i.Type == WeeklyPlanItemType.Review
                         && i.CompletedAt == null
                         && i.DueDate <= today)
                .WhereLessonPublished()
                .OrderBy(i => i.DueDate).ThenBy(i => i.Id)
                .Take(50)
                .Select(PlanProjections.ItemToDto)
                .ToListAsync();

            // 4) ملخص الأسبوع الحالي
            var weekItems = db.WeeklyPlanItems
                .AsNoTracking()
                .Where(i => i.WeeklyPlan.StudentId == studentId && i.WeeklyPlan.WeekStartDate == weekStart)
                .WhereLessonPublished();

            var weekTotal = await weekItems.CountAsync();
            var weekDone = await weekItems.CountAsync(i => i.CompletedAt != null);

            return new DashboardDto(
                summary,
                subjects,
                unfinished,
                overdue,
                dueReviews,
                new WeekSummaryDto(weekStart, weekStart.AddDays(6), weekTotal, weekDone));
        }

        private static double Percent(int done, int total) =>
            total == 0 ? 0 : Math.Round(100.0 * done / total, 1);
    }
}