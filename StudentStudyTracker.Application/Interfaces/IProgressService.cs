using StudentStudyTracker.Application.DTOs.Progress;

namespace StudentStudyTracker.Application.Interfaces;

public interface IProgressService
{
    Task<LessonProgressDto> GetLessonProgressAsync(string studentId, int lessonId);
    Task<LessonProgressDto> SaveLessonProgressAsync(string studentId, int lessonId, SaveLessonProgressRequest request);
    Task<List<LessonProgressDto>> GetChapterProgressAsync(string studentId, int chapterId);
}