using StudentStudyTracker.Application.DTOs.Curriculum;

namespace StudentStudyTracker.Application.Interfaces;

public interface IYearLevelService
{
    Task<List<YearLevelDto>> GetPublishedAsync();                       
    Task<List<YearLevelDto>> GetAllAsync();                             
    Task<YearLevelDto> CreateAsync(SaveYearLevelRequest request);
    Task<YearLevelDto> UpdateAsync(int id, SaveYearLevelRequest request);
}