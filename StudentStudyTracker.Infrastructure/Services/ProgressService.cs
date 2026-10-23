using Microsoft.EntityFrameworkCore;
using StudentStudyTracker.Application.DTOs.Progress;
using StudentStudyTracker.Application.Exceptions;
using StudentStudyTracker.Application.Interfaces;
using StudentStudyTracker.Domain.Entities;
using StudentStudyTracker.Domain.Enums;
using StudentStudyTracker.Infrastructure.Persistence;

namespace StudentStudyTracker.Infrastructure.Services
{
    internal class ProgressService(AppDbContext db) : IProgressService
    {
        public async Task<LessonProgressDto> GetLessonProgressAsync(string studentId, int lessonId)
        {
            var lesson = await GetPublishedLessonAsync(lessonId);

            var progress = await db.StudentLessonProgresses
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.StudentId == studentId && p.LessonId == lessonId);

            return ToDto(lesson.Id, lesson.Title, progress);
        }

        public async Task<LessonProgressDto> SaveLessonProgressAsync(
            string studentId, int lessonId, SaveLessonProgressRequest request)
        {
            var lesson = await GetPublishedLessonAsync(lessonId);

            var progress = await db.StudentLessonProgresses
                .FirstOrDefaultAsync(p => p.StudentId == studentId && p.LessonId == lessonId);

            var isNew = progress is null;

            if (progress is null)
            {
                progress = new StudentLessonProgress
                {
                    StudentId = studentId,
                    LessonId = lessonId,
                    CreatedAt = DateTime.UtcNow
                };
                db.StudentLessonProgresses.Add(progress);
            }
            else
            {
                progress.UpdatedAt = DateTime.UtcNow;
            }

            progress.HasAttended = request.HasAttended;
            progress.HasStudied = request.HasStudied;
            progress.HasCompletedExercises = request.HasCompletedExercises;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException) when (isNew)
            {
                // طلبين متزامنين لنفس الدرس: الـ Unique Index منع التكرار
                throw new ConflictException("Progress was saved concurrently. Please try again.");
            }

            return ToDto(lesson.Id, lesson.Title, progress);
        }

        public async Task<List<LessonProgressDto>> GetChapterProgressAsync(string studentId, int chapterId)
        {
            var lessons = await db.Lessons
                .AsNoTracking()
                .Where(l => l.ChapterId == chapterId)
                .WherePublished()
                .OrderBy(l => l.DisplayOrder)
                .ThenBy(l => l.Id)
                .Select(l => new { l.Id, l.Title })
                .ToListAsync();

            var lessonIds = lessons.Select(l => l.Id).ToList();

            var progressByLesson = await db.StudentLessonProgresses
                .AsNoTracking()
                .Where(p => p.StudentId == studentId && lessonIds.Contains(p.LessonId))
                .ToDictionaryAsync(p => p.LessonId);

            return lessons
                .Select(l => ToDto(l.Id, l.Title, progressByLesson.GetValueOrDefault(l.Id)))
                .ToList();
        }

        private async Task<(int Id, string Title)> GetPublishedLessonAsync(int lessonId)
        {
            var lesson = await db.Lessons
                .AsNoTracking()
                .WherePublished()
                .Where(l => l.Id == lessonId)
                .Select(l => new { l.Id, l.Title })
                .FirstOrDefaultAsync()
                ?? throw new NotFoundException("Lesson not found.");

            return (lesson.Id, lesson.Title);
        }

        private static LessonProgressDto ToDto(int lessonId, string title, StudentLessonProgress? p) =>
            new(lessonId,
                title,
                p?.HasAttended ?? false,
                p?.HasStudied ?? false,
                p?.HasCompletedExercises ?? false,
                p?.Status ?? LessonStatus.NotStarted,
                p?.UpdatedAt);
    }
}