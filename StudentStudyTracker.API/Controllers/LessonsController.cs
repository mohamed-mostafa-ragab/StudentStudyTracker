using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentStudyTracker.Application.DTOs.Curriculum;
using StudentStudyTracker.Application.Interfaces;

namespace StudentStudyTracker.API.Controllers;

[ApiController]
[Route("api/chapters/{chapterId:int}/lessons")]
[Authorize]
public class LessonsController : ControllerBase
{
    private readonly ILessonService _service;

    public LessonsController(ILessonService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<List<LessonDto>>> GetPublished(int chapterId)
        => Ok(await _service.GetPublishedByChapterAsync(chapterId));
}
