using StudentStudyTracker.Application.DTOs.Plan;

namespace StudentStudyTracker.Application.Interfaces;

public interface IWeeklyPlanService
{
    Task<WeeklyPlanDto> GetWeekAsync(string studentId, DateOnly? date);
    Task<PlanItemDto> AddItemAsync(string studentId, AddPlanItemRequest request);
    Task<PlanItemDto> UpdateItemAsync(string studentId, int itemId, UpdatePlanItemRequest request);
    Task<PlanItemDto> SetCompletedAsync(string studentId, int itemId, bool completed);
    Task DeleteItemAsync(string studentId, int itemId);
}