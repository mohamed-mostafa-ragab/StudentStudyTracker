using System;
using System.Collections.Generic;
using System.Text;

namespace StudentStudyTracker.Domain.Entities
{
    public class WeeklyPlan
    {
        public int Id { get; set; }
        public string StudentId { get; set; } = null!;
        public DateOnly WeekStartDate { get; set; }
        public DateOnly WeekEndDate { get; set; }
        public ICollection<WeeklyPlanItem> Items { get; set; } = new HashSet<WeeklyPlanItem>();
    }
}
