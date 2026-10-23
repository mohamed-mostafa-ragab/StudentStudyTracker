using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace StudentStudyTracker.API.Controllers;

using StudentStudyTracker.Application.DTOs.Curriculum;
using StudentStudyTracker.Application.DTOs.Subject;
using StudentStudyTracker.Application.Interfaces;

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