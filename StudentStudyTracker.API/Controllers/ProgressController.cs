using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentStudyTracker.API.Extensions;
using StudentStudyTracker.Application.DTOs.Progress;
using StudentStudyTracker.Application.Interfaces;
using StudentStudyTracker.Domain.Constants;

namespace StudentStudyTracker.API.Controllers;

[ApiController]
[Route("api/progress")]
[Authorize(Roles = AppRoles.Student)]
public class ProgressController : ControllerBase
{
    private readonly IProgressService _service;

    public ProgressController(IProgressService service) => _service = service;

    [HttpGet("lessons/{lessonId:int}")]
    public async Task<ActionResult<LessonProgressDto>> GetLesson(int lessonId)
        => Ok(await _service.GetLessonProgressAsync(User.GetUserId(), lessonId));

    [HttpPut("lessons/{lessonId:int}")]
    public async Task<ActionResult<LessonProgressDto>> SaveLesson(
        int lessonId, SaveLessonProgressRequest request)
        => Ok(await _service.SaveLessonProgressAsync(User.GetUserId(), lessonId, request));

    [HttpGet("chapters/{chapterId:int}")]
    public async Task<ActionResult<List<LessonProgressDto>>> GetChapter(int chapterId)
        => Ok(await _service.GetChapterProgressAsync(User.GetUserId(), chapterId));
}