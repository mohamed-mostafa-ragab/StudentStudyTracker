namespace StudentStudyTracker.Application.DTOs.Curriculum;

public record LessonDto(int Id, int ChapterId, string Title, int DisplayOrder, bool IsPublished);