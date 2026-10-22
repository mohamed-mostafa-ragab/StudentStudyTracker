using System.ComponentModel.DataAnnotations;

namespace StudentStudyTracker.Application.DTOs.Auth;

public class RegisterRequest
{
    [Required, MaxLength(100)]
    public required string FullName { get; set; } 

    [Required, EmailAddress]
    public required string Email { get; set; } 

    [Required, MinLength(8)]
    public required string Password { get; set; } 
}