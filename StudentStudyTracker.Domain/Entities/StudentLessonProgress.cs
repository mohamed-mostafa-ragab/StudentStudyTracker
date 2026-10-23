using StudentStudyTracker.Domain.Enums;

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
        public LessonStatus Status
        {
            get
            {
                var done = (HasAttended ? 1 : 0) + (HasStudied ? 1 : 0) + (HasCompletedExercises ? 1 : 0);
                return done switch
                {
                    0 => LessonStatus.NotStarted,
                    3 => LessonStatus.Completed,
                    _ => LessonStatus.InProgress
                };
            }
        }
    }
}
