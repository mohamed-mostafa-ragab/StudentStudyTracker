using System.Linq.Expressions;
using StudentStudyTracker.Application.DTOs.Plan;
using StudentStudyTracker.Domain.Entities;

namespace StudentStudyTracker.Infrastructure.Persistence;

public static class PlanProjections
{
    public static readonly Expression<Func<WeeklyPlanItem, PlanItemDto>> ItemToDto = i =>
        new PlanItemDto(
            i.Id,
            i.LessonId,
            i.Lesson.Title,
            i.Lesson.Chapter.Subject.Name,
            i.Type,
            i.DueDate,
            i.DurationInMinutes,
            i.Description,
            i.CompletedAt != null,
            i.CompletedAt);

    public static IQueryable<WeeklyPlanItem> WhereLessonPublished(this IQueryable<WeeklyPlanItem> items) =>
        items.Where(i => i.Lesson.IsPublished
                      && i.Lesson.Chapter.IsPublished
                      && i.Lesson.Chapter.Subject.IsPublished
                      && i.Lesson.Chapter.Subject.AcademicYearLevel.IsPublished);
}