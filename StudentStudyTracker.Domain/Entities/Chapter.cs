using System;
using System.Collections.Generic;
using System.Text;

namespace StudentStudyTracker.Domain.Entities
{
    public class Chapter
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public bool IsPublished { get; set; }
        public int SubjectId { get; set; }//Foreign key to Subject
        public int DisplayOrder { get; set; }
        public ICollection<Lesson> Lessons { get; set; } = new HashSet<Lesson>();
        public Subject Subject { get; set; } = null!;

    }
}
