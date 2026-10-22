using StudentStudyTracker.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace StudentStudyTracker.Domain.Entities
{
    public class WeeklyPlanItem
    {
        public int Id { get; set; }
        public int WeeklyPlanId { get; set; }
        public WeeklyPlan WeeklyPlan { get; set; } = null!;
        public int LessonId { get; set; }
        public Lesson Lesson { get; set; } = null!;
        public DateOnly DueDate { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int DurationInMinutes { get; set; }
        public string Description { get; set; } = null!;
        public WeeklyPlanItemType Type { get; set; }
    }
}
