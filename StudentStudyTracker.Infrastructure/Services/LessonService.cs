using Microsoft.EntityFrameworkCore;
using StudentStudyTracker.Application.DTOs.Curriculum;
using StudentStudyTracker.Application.Exceptions;
using StudentStudyTracker.Application.Interfaces;
using StudentStudyTracker.Domain.Entities;
using StudentStudyTracker.Infrastructure.Persistence;

namespace StudentStudyTracker.Infrastructure.Services
{
    internal class LessonService(AppDbContext db) : ILessonService
    {
        public Task<List<LessonDto>> GetPublishedByChapterAsync(int chapterId)
        {
            return db.Lessons
                .AsNoTracking()
                .Where(l => l.ChapterId == chapterId)
                .WherePublished()
                .OrderBy(l => l.DisplayOrder)
                .ThenBy(l => l.Id)
                .Select(l => new LessonDto(l.Id, l.ChapterId, l.Title, l.DisplayOrder, l.IsPublished))
                .ToListAsync();
        }

        public Task<List<LessonDto>> GetAllByChapterAsync(int chapterId)
        {
            return db.Lessons
                .AsNoTracking()
                .Where(l => l.ChapterId == chapterId)
                .OrderBy(l => l.DisplayOrder)
                .ThenBy(l => l.Id)
                .Select(l => new LessonDto(l.Id, l.ChapterId, l.Title, l.DisplayOrder, l.IsPublished))
                .ToListAsync();
        }

        public async Task<LessonDto> CreateAsync(SaveLessonRequest request)
        {
            var chapterExists = await db.Chapters.AnyAsync(c => c.Id == request.ChapterId);
            if (!chapterExists)
                throw new NotFoundException("Chapter not found.");

            var lesson = new Lesson
            {
                Title = request.Title.Trim(),
                ChapterId = request.ChapterId,
                DisplayOrder = request.DisplayOrder,
                IsPublished = request.IsPublished
            };

            db.Lessons.Add(lesson);
            await db.SaveChangesAsync();

            return ToDto(lesson);
        }

        public async Task<LessonDto> UpdateAsync(int id, SaveLessonRequest request)
        {
            var lesson = await db.Lessons.FindAsync(id)
                ?? throw new NotFoundException("Lesson not found.");

            if (lesson.ChapterId != request.ChapterId)
            {
                var chapterExists = await db.Chapters.AnyAsync(c => c.Id == request.ChapterId);
                if (!chapterExists)
                    throw new NotFoundException("Chapter not found.");
            }

            lesson.Title = request.Title.Trim();
            lesson.ChapterId = request.ChapterId;
            lesson.DisplayOrder = request.DisplayOrder;
            lesson.IsPublished = request.IsPublished;

            await db.SaveChangesAsync();

            return ToDto(lesson);
        }

        private static LessonDto ToDto(Lesson l) =>
            new(l.Id, l.ChapterId, l.Title, l.DisplayOrder, l.IsPublished);
    }
}