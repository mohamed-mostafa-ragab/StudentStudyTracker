using Microsoft.EntityFrameworkCore;
using StudentStudyTracker.Application.DTOs.Curriculum;
using StudentStudyTracker.Application.Exceptions;
using StudentStudyTracker.Application.Interfaces;
using StudentStudyTracker.Domain.Entities;
using StudentStudyTracker.Infrastructure.Persistence;

namespace StudentStudyTracker.Infrastructure.Services
{
    internal class ChapterService(AppDbContext db) : IChapterService
    {
        public Task<List<ChapterDto>> GetPublishedBySubjectAsync(int subjectId)
        {
            return db.Chapters
                .AsNoTracking()
                .Where(c => c.SubjectId == subjectId
                         && c.IsPublished
                         && c.Subject.IsPublished
                         && c.Subject.AcademicYearLevel.IsPublished)
                .OrderBy(c => c.DisplayOrder)
                .ThenBy(c => c.Id)
                .Select(c => new ChapterDto(c.Id, c.SubjectId, c.Title, c.DisplayOrder, c.IsPublished))
                .ToListAsync();
        }

        public Task<List<ChapterDto>> GetAllBySubjectAsync(int subjectId)
        {
            return db.Chapters
                .AsNoTracking()
                .Where(c => c.SubjectId == subjectId)
                .OrderBy(c => c.DisplayOrder)
                .ThenBy(c => c.Id)
                .Select(c => new ChapterDto(c.Id, c.SubjectId, c.Title, c.DisplayOrder, c.IsPublished))
                .ToListAsync();
        }

        public async Task<ChapterDto> CreateAsync(SaveChapterRequest request)
        {
            var subjectExists = await db.Subjects.AnyAsync(s => s.Id == request.SubjectId);
            if (!subjectExists)
                throw new NotFoundException("Subject not found.");

            var chapter = new Chapter
            {
                Title = request.Title.Trim(),
                SubjectId = request.SubjectId,
                DisplayOrder = request.DisplayOrder,
                IsPublished = request.IsPublished
            };

            db.Chapters.Add(chapter);
            await db.SaveChangesAsync();

            return ToDto(chapter);
        }

        public async Task<ChapterDto> UpdateAsync(int id, SaveChapterRequest request)
        {
            var chapter = await db.Chapters.FindAsync(id)
                ?? throw new NotFoundException("Chapter not found.");

            if (chapter.SubjectId != request.SubjectId)
            {
                var subjectExists = await db.Subjects.AnyAsync(s => s.Id == request.SubjectId);
                if (!subjectExists)
                    throw new NotFoundException("Subject not found.");
            }

            chapter.Title = request.Title.Trim();
            chapter.SubjectId = request.SubjectId;
            chapter.DisplayOrder = request.DisplayOrder;
            chapter.IsPublished = request.IsPublished;

            await db.SaveChangesAsync();

            return ToDto(chapter);
        }

        private static ChapterDto ToDto(Chapter c) =>
            new(c.Id, c.SubjectId, c.Title, c.DisplayOrder, c.IsPublished);
    }
}