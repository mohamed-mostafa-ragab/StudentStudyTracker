using System;
using System.Collections.Generic;
using System.Text;

namespace StudentStudyTracker.Infrastructure.Identity
{
    public class JwtSettings
    {
        public required string Key { get; set; }
        public required string Issuer { get; set; }
        public required string Audience { get; set; }
        public required int ExpiryMinutesDurationInMinutes { get; set; }
    }
}
