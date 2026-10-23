using StudentStudyTracker.Application.DTOs.Plan;
using StudentStudyTracker.Domain.Enums;

namespace StudentStudyTracker.Application.DTOs.Dashboard;

public record ProgressSummaryDto(
    int TotalLessons,
    int CompletedLessons,
    int InProgressLessons,
    int NotStartedLessons,
    double CompletionPercent);

public record SubjectProgressDto(
    int SubjectId,
    string SubjectName,
    int TotalLessons,
    int CompletedLessons,
    double CompletionPercent);

public record UnfinishedLessonDto(
    int LessonId,
    string LessonTitle,
    string SubjectName,
    LessonStatus Status);

public record WeekSummaryDto(
    DateOnly WeekStartDate,
    DateOnly WeekEndDate,
    int TotalItems,
    int CompletedItems);

public record DashboardDto(
    ProgressSummaryDto Summary,
    List<SubjectProgressDto> Subjects,
    List<UnfinishedLessonDto> UnfinishedLessons,
    List<PlanItemDto> OverdueItems,
    List<PlanItemDto> DueReviews,
    WeekSummaryDto ThisWeek);