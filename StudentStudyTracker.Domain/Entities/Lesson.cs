using System;
using System.Collections.Generic;
using System.Text;

namespace StudentStudyTracker.Domain.Entities
{
    public class Lesson
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public bool IsPublished { get; set; }
        public int ChapterId { get; set; }//Foreign key to Chapter
        public int DisplayOrder { get; set; }
        public Chapter Chapter { get; set; } = null!;
        public ICollection<StudentLessonProgress> StudentLessonProgresses { get; set; } = new HashSet<StudentLessonProgress>();

    }
}
