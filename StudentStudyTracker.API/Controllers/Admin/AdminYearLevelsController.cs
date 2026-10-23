using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentStudyTracker.Application.DTOs.Curriculum;
using StudentStudyTracker.Application.Interfaces;
using StudentStudyTracker.Domain.Constants;

namespace StudentStudyTracker.API.Controllers.Admin;

[ApiController]
[Route("api/admin/year-levels")]
[Authorize(Roles = AppRoles.Admin)]
public class AdminYearLevelsController : ControllerBase
{
    private readonly IYearLevelService _service;

    public AdminYearLevelsController(IYearLevelService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<List<YearLevelDto>>> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpPost]
    public async Task<ActionResult<YearLevelDto>> Create(SaveYearLevelRequest request)
    {
        var dto = await _service.CreateAsync(request);
        return Created($"api/admin/year-levels/{dto.Id}", dto);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<YearLevelDto>> Update(int id, SaveYearLevelRequest request)
        => Ok(await _service.UpdateAsync(id, request));
}