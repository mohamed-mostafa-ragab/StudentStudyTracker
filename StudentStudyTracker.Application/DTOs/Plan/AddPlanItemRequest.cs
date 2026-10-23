// AddPlanItemRequest.cs
using System.ComponentModel.DataAnnotations;
using StudentStudyTracker.Domain.Enums;

namespace StudentStudyTracker.Application.DTOs.Plan;

public class AddPlanItemRequest
{
    [Range(1, int.MaxValue)]
    public int LessonId { get; set; }

    [EnumDataType(typeof(WeeklyPlanItemType))]
    public WeeklyPlanItemType Type { get; set; }

    public DateOnly DueDate { get; set; }

    [Range(5, 600)]
    public int DurationInMinutes { get; set; } = 30;

    [MaxLength(500)]
    public string? Description { get; set; }
}