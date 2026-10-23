using StudentStudyTracker.Domain.Entities;

namespace StudentStudyTracker.Infrastructure.Persistence;

public static class LessonQueryExtensions
{
    public static IQueryable<Lesson> WherePublished(this IQueryable<Lesson> lessons) =>
        lessons.Where(l => l.IsPublished
                        && l.Chapter.IsPublished
                        && l.Chapter.Subject.IsPublished
                        && l.Chapter.Subject.AcademicYearLevel.IsPublished);
}