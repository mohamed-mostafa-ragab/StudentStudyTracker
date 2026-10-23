using System.ComponentModel.DataAnnotations;

namespace StudentStudyTracker.Application.DTOs.Auth;

public class ChangePasswordRequest
{
    [Required]
    public required string CurrentPassword { get; set; }

    [Required, MinLength(8)]
    public required string NewPassword { get; set; }
}