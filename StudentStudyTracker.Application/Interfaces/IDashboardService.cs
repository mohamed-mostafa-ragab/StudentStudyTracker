using StudentStudyTracker.Application.DTOs.Dashboard;

namespace StudentStudyTracker.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardDto> GetAsync(string studentId, int? yearLevelId);
}