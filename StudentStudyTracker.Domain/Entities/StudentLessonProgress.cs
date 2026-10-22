namespace StudentStudyTracker.Domain.Entities
{
    public class StudentLessonProgress
    {
        public int Id { get; set; }
        public string StudentId { get; set; } = null!; // Foreign key to Student
        public int LessonId { get; set; } // Foreign key to Lesson
        public bool HasAttended { get; set; }
        public bool HasStudied { get; set; }
        public bool HasCompletedExercises { get; set; }  
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Lesson Lesson { get; set; } = null!;
    }
}
