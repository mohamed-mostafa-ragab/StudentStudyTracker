using StudentStudyTracker.Application.DTOs.Curriculum;

namespace StudentStudyTracker.Application.Interfaces;

public interface IChapterService
{
    Task<List<ChapterDto>> GetPublishedBySubjectAsync(int subjectId);
    Task<List<ChapterDto>> GetAllBySubjectAsync(int subjectId);
    Task<ChapterDto> CreateAsync(SaveChapterRequest request);
    Task<ChapterDto> UpdateAsync(int id, SaveChapterRequest request);
}