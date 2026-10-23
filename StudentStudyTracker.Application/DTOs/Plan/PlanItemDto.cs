using StudentStudyTracker.Domain.Enums;

namespace StudentStudyTracker.Application.DTOs.Plan;

public record PlanItemDto(
    int Id,
    int LessonId,
    string LessonTitle,
    string SubjectName,
    WeeklyPlanItemType Type,
    DateOnly DueDate,
    int DurationInMinutes,
    string? Description,
    bool IsCompleted,
    DateTime? CompletedAt);