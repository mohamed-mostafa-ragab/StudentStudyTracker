using System;
using System.Collections.Generic;
using System.Text;

namespace StudentStudyTracker.Domain.Entities
{
    public class Subject
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public bool IsPublished { get; set; }
        public int DisplayOrder { get; set; }
        public int AcademicYearLevelId { get; set; }//Foreign key to AcademicYearLevel
        public ICollection<Chapter> Chapters { get; set; } = new HashSet<Chapter>();
        public AcademicYearLevel AcademicYearLevel { get; set; } = null!;
    }
}
