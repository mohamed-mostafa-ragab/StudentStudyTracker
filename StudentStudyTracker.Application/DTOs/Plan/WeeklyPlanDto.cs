// WeeklyPlanDto.cs
namespace StudentStudyTracker.Application.DTOs.Plan;

public record WeeklyPlanDto(
    int? Id,
    DateOnly WeekStartDate,
    DateOnly WeekEndDate,
    List<PlanItemDto> Items);