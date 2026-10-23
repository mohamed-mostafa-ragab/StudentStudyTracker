namespace StudentStudyTracker.Application.DTOs.Progress;

public class SaveLessonProgressRequest
{
    public bool HasAttended { get; set; }
    public bool HasStudied { get; set; }
    public bool HasCompletedExercises { get; set; }
}