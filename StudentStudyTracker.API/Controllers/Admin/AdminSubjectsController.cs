using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentStudyTracker.Application.DTOs.Subject;
using StudentStudyTracker.Domain.Constants;

namespace StudentStudyTracker.API.Controllers.Admin;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = AppRoles.Admin)]
public class AdminSubjectsController : ControllerBase
{
    private readonly ISubjectService _service;

    public AdminSubjectsController(ISubjectService service) => _service = service;

    [HttpGet("year-levels/{yearLevelId:int}/subjects")]
    public async Task<ActionResult<List<SubjectDto>>> GetAll(int yearLevelId)
        => Ok(await _service.GetAllByYearLevelAsync(yearLevelId));

    [HttpPost("subjects")]
    public async Task<ActionResult<SubjectDto>> Create(SaveSubjectRequest request)
    {
        var dto = await _service.CreateAsync(request);
        return Created($"api/admin/subjects/{dto.Id}", dto);
    }

    [HttpPut("subjects/{id:int}")]
    public async Task<ActionResult<SubjectDto>> Update(int id, SaveSubjectRequest request)
        => Ok(await _service.UpdateAsync(id, request));
}