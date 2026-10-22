using System;
using System.Collections.Generic;
using System.Text;

namespace StudentStudyTracker.Application.DTOs.Auth
{
    public class AuthResponse
    {
        public string Token { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
        public IList<string> Roles { get; set; } = new List<string>();


    }
}
