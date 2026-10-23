using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentStudyTracker.Application.DTOs.Curriculum;
using StudentStudyTracker.Application.Interfaces;

namespace StudentStudyTracker.API.Controllers;

[ApiController]
[Route("api/subjects/{subjectId:int}/chapters")]
[Authorize]
public class ChaptersController : ControllerBase
{
    private readonly IChapterService _service;

    public ChaptersController(IChapterService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<List<ChapterDto>>> GetPublished(int subjectId)
        => Ok(await _service.GetPublishedBySubjectAsync(subjectId));
}