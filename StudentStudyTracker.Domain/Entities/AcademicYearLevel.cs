using System;
using System.Collections.Generic;
using System.Text;

namespace StudentStudyTracker.Domain.Entities
{
    public class AcademicYearLevel
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public bool IsPublished { get; set; }
        public ICollection<Subject> Subjects { get; set; } = new HashSet<Subject>();
    }
}
