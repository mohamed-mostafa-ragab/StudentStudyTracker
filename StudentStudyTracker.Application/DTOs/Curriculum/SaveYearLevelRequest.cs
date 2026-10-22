using System.ComponentModel.DataAnnotations;

namespace StudentStudyTracker.Application.DTOs.Curriculum;

public class SaveYearLevelRequest
{
    [Required, MaxLength(100)]
    public required string Name { get; set; }

    public bool IsPublished { get; set; }
}