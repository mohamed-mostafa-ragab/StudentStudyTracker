using StudentStudyTracker.Application.DTOs.Curriculum;
using StudentStudyTracker.Application.DTOs.Subject;
namespace StudentStudyTracker.Application.Interfaces;

public interface ISubjectService
{
    Task<List<SubjectDto>> GetPublishedByYearLevelAsync(int yearLevelId);   
    Task<List<SubjectDto>> GetAllByYearLevelAsync(int yearLevelId);         
    Task<SubjectDto> CreateAsync(SaveSubjectRequest request);
    Task<SubjectDto> UpdateAsync(int id, SaveSubjectRequest request);
}