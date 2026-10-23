using System.ComponentModel.DataAnnotations;

namespace StudentStudyTracker.Application.DTOs.Curriculum;

public class SaveChapterRequest
{
    [Required, MaxLength(200)]
    public required string Title { get; set; }

    [Range(1, int.MaxValue)]
    public int SubjectId { get; set; }

    public int DisplayOrder { get; set; }
    public bool IsPublished { get; set; }
}