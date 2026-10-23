using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentStudyTracker.Application.DTOs.Curriculum;
using StudentStudyTracker.Application.Interfaces;
using StudentStudyTracker.Domain.Constants;

namespace StudentStudyTracker.API.Controllers.Admin;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = AppRoles.Admin)]
public class AdminLessonsController : ControllerBase
{
    private readonly ILessonService _service;

    public AdminLessonsController(ILessonService service) => _service = service;

    [HttpGet("chapters/{chapterId:int}/lessons")]
    public async Task<ActionResult<List<LessonDto>>> GetAll(int chapterId)
        => Ok(await _service.GetAllByChapterAsync(chapterId));

    [HttpPost("lessons")]
    public async Task<ActionResult<LessonDto>> Create(SaveLessonRequest request)
    {
        var dto = await _service.CreateAsync(request);
        return Created($"api/admin/lessons/{dto.Id}", dto);
    }

    [HttpPut("lessons/{id:int}")]
    public async Task<ActionResult<LessonDto>> Update(int id, SaveLessonRequest request)
        => Ok(await _service.UpdateAsync(id, request));
}