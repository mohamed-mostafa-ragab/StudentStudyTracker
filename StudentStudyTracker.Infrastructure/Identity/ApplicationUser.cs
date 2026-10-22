using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace StudentStudyTracker.Infrastructure.Identity
{
    public class ApplicationUser:IdentityUser
    {
        public required string FullName { get; set; }
    }
}
