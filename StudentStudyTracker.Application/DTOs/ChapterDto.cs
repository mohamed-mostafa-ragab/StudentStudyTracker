namespace StudentStudyTracker.Application.DTOs.Curriculum;

public record ChapterDto(int Id, int SubjectId, string Title, int DisplayOrder, bool IsPublished);