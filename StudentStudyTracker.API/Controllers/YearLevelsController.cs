using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentStudyTracker.Application.DTOs.Curriculum.YearLevel;
using StudentStudyTracker.Application.Interfaces;

namespace StudentStudyTracker.API.Controllers;

[ApiController]
[Route("api/year-levels")]
[Authorize]
public class YearLevelsController : ControllerBase
{
    private readonly IYearLevelService _service;

    public YearLevelsController(IYearLevelService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<List<YearLevelDto>>> GetPublished()
        => Ok(await _service.GetPublishedAsync());
}