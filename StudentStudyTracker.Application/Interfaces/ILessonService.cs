using StudentStudyTracker.Application.DTOs.Curriculum;

namespace StudentStudyTracker.Application.Interfaces;

public interface ILessonService
{
    Task<List<LessonDto>> GetPublishedByChapterAsync(int chapterId);
    Task<List<LessonDto>> GetAllByChapterAsync(int chapterId);
    Task<LessonDto> CreateAsync(SaveLessonRequest request);
    Task<LessonDto> UpdateAsync(int id, SaveLessonRequest request);
}