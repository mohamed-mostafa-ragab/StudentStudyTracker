using Microsoft.EntityFrameworkCore;
using StudentStudyTracker.Application.Exceptions;
using StudentStudyTracker.Domain.Entities;
using StudentStudyTracker.Infrastructure.Persistence;
using StudentStudyTracker.Application.Interfaces;
using StudentStudyTracker.Application.DTOs.Curriculum;
using StudentStudyTracker.Application.DTOs.Subject;
namespace StudentStudyTracker.Infrastructure.Services
{
    internal class SubjectService(AppDbContext db) : ISubjectService
    {
        private readonly AppDbContext _db = db;
        public Task<List<SubjectDto>> GetPublishedByYearLevelAsync(int yearLevelId)
        {
            return _db.Subjects.Where(s=>s.IsPublished&&s.AcademicYearLevel.IsPublished&&s.AcademicYearLevelId==yearLevelId)
                .AsNoTracking()
                .OrderBy(s => s.DisplayOrder)
                .ThenBy(s => s.Id)
                .Select(s => new SubjectDto(
                    s.Id,
                    s.AcademicYearLevelId,
                    s.Name,
                    s.DisplayOrder,
                    s.IsPublished
                     ))
                     .ToListAsync();
        }
        public async Task<SubjectDto> CreateAsync(SaveSubjectRequest request)
        {
            var yearLevelExists = await _db.AcademicYearLevels
                    .AnyAsync(y => y.Id == request.AcademicYearLevelId);
            if (!yearLevelExists)
                throw new NotFoundException("Year level not found.");
            var subject = new Subject
            {
                Name = request.Name.Trim(),
                AcademicYearLevelId = request.AcademicYearLevelId,
                DisplayOrder = request.DisplayOrder,
                IsPublished = request.IsPublished
            };
            _db.Subjects.Add(subject);
            await _db.SaveChangesAsync();

            return new SubjectDto(
                subject.Id,
                subject.AcademicYearLevelId,
                subject.Name,
                subject.DisplayOrder,
                subject.IsPublished);
        }
        public Task<List<SubjectDto>> GetAllByYearLevelAsync(int yearLevelId)
        {
            return _db.Subjects
                .Where(s=>s.AcademicYearLevelId == yearLevelId)
                .OrderBy(s => s.DisplayOrder)
                .Select(s=>new SubjectDto(
                    s.Id,
                    s.AcademicYearLevelId,
                    s.Name,
                    s.DisplayOrder,
                    s.IsPublished
                ))
                .ToListAsync();
        }
        public async Task<SubjectDto> UpdateAsync(int id, SaveSubjectRequest request)
        {
            var subject =await _db.Subjects.FindAsync(id) ?? throw new NotFoundException("Subject not found.");
            if (subject.AcademicYearLevelId != request.AcademicYearLevelId)
            {
                var yearLevelExists = await _db.AcademicYearLevels
                    .AnyAsync(y => y.Id == request.AcademicYearLevelId);

                if (!yearLevelExists)
                    throw new NotFoundException("Year level not found.");
            }
            subject.Name = request.Name.Trim();
            subject.AcademicYearLevelId = request.AcademicYearLevelId;
            subject.DisplayOrder = request.DisplayOrder;
            subject.IsPublished = request.IsPublished;
            await _db.SaveChangesAsync();
            return new SubjectDto(
                subject.Id,
                subject.AcademicYearLevelId,
                subject.Name,
                subject.DisplayOrder,   
                subject.IsPublished);
        }
    }
}
