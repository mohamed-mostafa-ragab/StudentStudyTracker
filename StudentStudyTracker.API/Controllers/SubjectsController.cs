using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentStudyTracker.Application.DTOs.Subject;
namespace StudentStudyTracker.API.Controllers;

[ApiController]
[Route("api/year-levels/{yearLevelId:int}/subjects")]
[Authorize]
public class SubjectsController : ControllerBase
{
    private readonly ISubjectService _service;

    public SubjectsController(ISubjectService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<List<SubjectDto>>> GetPublished(int yearLevelId)
        => Ok(await _service.GetPublishedByYearLevelAsync(yearLevelId));
}