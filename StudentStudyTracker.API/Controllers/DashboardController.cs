using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentStudyTracker.API.Extensions;
using StudentStudyTracker.Application.DTOs.Dashboard;
using StudentStudyTracker.Application.Interfaces;
using StudentStudyTracker.Domain.Constants;

namespace StudentStudyTracker.API.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize(Roles = AppRoles.Student)]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _service;

    public DashboardController(IDashboardService service) => _service = service;

    // GET api/dashboard?yearLevelId=1  (من غير yearLevelId = كل المنهج المنشور)
    [HttpGet]
    public async Task<ActionResult<DashboardDto>> Get([FromQuery] int? yearLevelId)
        => Ok(await _service.GetAsync(User.GetUserId(), yearLevelId));
}