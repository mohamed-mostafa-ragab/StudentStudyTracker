// UpdatePlanItemRequest.cs
using System.ComponentModel.DataAnnotations;

namespace StudentStudyTracker.Application.DTOs.Plan;

public class UpdatePlanItemRequest
{
    public DateOnly DueDate { get; set; }

    [Range(5, 600)]
    public int DurationInMinutes { get; set; } = 30;

    [MaxLength(500)]
    public string? Description { get; set; }
}