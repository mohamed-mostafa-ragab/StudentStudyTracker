using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentStudyTracker.API.Extensions;
using StudentStudyTracker.Application.DTOs.Plan;
using StudentStudyTracker.Application.Interfaces;
using StudentStudyTracker.Domain.Constants;

namespace StudentStudyTracker.API.Controllers;

[ApiController]
[Route("api/weekly-plans")]
[Authorize(Roles = AppRoles.Student)]
public class WeeklyPlansController : ControllerBase
{
    private readonly IWeeklyPlanService _service;

    public WeeklyPlansController(IWeeklyPlanService service) => _service = service;

    // GET api/weekly-plans?date=2026-10-24  (من غير date = الأسبوع الحالي)
    [HttpGet]
    public async Task<ActionResult<WeeklyPlanDto>> GetWeek([FromQuery] DateOnly? date)
        => Ok(await _service.GetWeekAsync(User.GetUserId(), date));

    [HttpPost("items")]
    public async Task<ActionResult<PlanItemDto>> AddItem(AddPlanItemRequest request)
    {
        var dto = await _service.AddItemAsync(User.GetUserId(), request);
        return Created($"api/weekly-plans/items/{dto.Id}", dto);
    }

    [HttpPut("items/{id:int}")]
    public async Task<ActionResult<PlanItemDto>> UpdateItem(int id, UpdatePlanItemRequest request)
        => Ok(await _service.UpdateItemAsync(User.GetUserId(), id, request));

    [HttpPost("items/{id:int}/complete")]
    public async Task<ActionResult<PlanItemDto>> Complete(int id)
        => Ok(await _service.SetCompletedAsync(User.GetUserId(), id, true));

    [HttpDelete("items/{id:int}/complete")]
    public async Task<ActionResult<PlanItemDto>> Uncomplete(int id)
        => Ok(await _service.SetCompletedAsync(User.GetUserId(), id, false));

    [HttpDelete("items/{id:int}")]
    public async Task<IActionResult> DeleteItem(int id)
    {
        await _service.DeleteItemAsync(User.GetUserId(), id);
        return NoContent();
    }
}