namespace StudentStudyTracker.Application.Common;

public static class WeekCalendar
{

    public static DateOnly StartOfWeek(DateOnly date)
    {
        var diff = ((int)date.DayOfWeek - (int)DayOfWeek.Saturday + 7) % 7;
        return date.AddDays(-diff);
    }
}