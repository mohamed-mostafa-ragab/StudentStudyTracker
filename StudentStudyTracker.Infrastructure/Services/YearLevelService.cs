using Microsoft.EntityFrameworkCore;
using StudentStudyTracker.Application.DTOs.Curriculum.YearLevel;
using StudentStudyTracker.Application.Exceptions;
using StudentStudyTracker.Application.Interfaces;
using StudentStudyTracker.Domain.Entities;
using StudentStudyTracker.Infrastructure.Persistence;

namespace StudentStudyTracker.Infrastructure.Services;

public class YearLevelService : IYearLevelService
{
    private readonly AppDbContext _db;

    public YearLevelService(AppDbContext db) => _db = db;

    public Task<List<YearLevelDto>> GetPublishedAsync() =>
        _db.AcademicYearLevels.AsNoTracking()
            .Where(y => y.IsPublished)
            .OrderBy(y => y.Id)
            .Select(y => new YearLevelDto(y.Id, y.Name, y.IsPublished))
            .ToListAsync();

    public Task<List<YearLevelDto>> GetAllAsync() =>
        _db.AcademicYearLevels.AsNoTracking()
            .OrderBy(y => y.Id)
            .Select(y => new YearLevelDto(y.Id, y.Name, y.IsPublished))
            .ToListAsync();

    public async Task<YearLevelDto> CreateAsync(SaveYearLevelRequest request)
    {
        var entity = new AcademicYearLevel
        {
            Name = request.Name.Trim(),
            IsPublished = request.IsPublished
        };

        _db.AcademicYearLevels.Add(entity);
        await _db.SaveChangesAsync();

        return new YearLevelDto(entity.Id, entity.Name, entity.IsPublished);
    }

    public async Task<YearLevelDto> UpdateAsync(int id, SaveYearLevelRequest request)
    {
        var entity = await _db.AcademicYearLevels.FindAsync(id)
            ?? throw new NotFoundException("Year level not found.");

        entity.Name = request.Name.Trim();
        entity.IsPublished = request.IsPublished;
        await _db.SaveChangesAsync();

        return new YearLevelDto(entity.Id, entity.Name, entity.IsPublished);
    }
}