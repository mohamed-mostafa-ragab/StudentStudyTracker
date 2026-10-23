using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace StudentStudyTracker.Application.DTOs.Curriculum
{
    public class SaveSubjectRequest
    {
        [Required, MaxLength(100)]
        public required string Name { get; set; }

        [Range(1, int.MaxValue)]
        public int AcademicYearLevelId { get; set; }

        public int DisplayOrder { get; set; }
        public bool IsPublished { get; set; }
    }
}
