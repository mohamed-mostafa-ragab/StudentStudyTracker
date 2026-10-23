using StudentStudyTracker.Domain.Enums;

namespace StudentStudyTracker.Application.DTOs.Progress;

public record LessonProgressDto(
    int LessonId,
    string LessonTitle,
    bool HasAttended,
    bool HasStudied,
    bool HasCompletedExercises,
    LessonStatus Status,
    DateTime? UpdatedAt);