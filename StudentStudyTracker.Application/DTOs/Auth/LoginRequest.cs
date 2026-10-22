using System.ComponentModel.DataAnnotations;

namespace StudentStudyTracker.Application.DTOs.Auth
{
    public class LoginRequest
    {
        [Required]
        public required string  Email { get; set; }
        [Required]
        public required string Password { get; set; }
    }
}
