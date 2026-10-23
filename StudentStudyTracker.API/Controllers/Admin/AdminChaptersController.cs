using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentStudyTracker.Application.DTOs.Curriculum;
using StudentStudyTracker.Application.Interfaces;
using StudentStudyTracker.Domain.Constants;

namespace StudentStudyTracker.API.Controllers.Admin;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = AppRoles.Admin)]
public class AdminChaptersController : ControllerBase
{
    private readonly IChapterService _service;

    public AdminChaptersController(IChapterService service) => _service = service;

    [HttpGet("subjects/{subjectId:int}/chapters")]
    public async Task<ActionResult<List<ChapterDto>>> GetAll(int subjectId)
        => Ok(await _service.GetAllBySubjectAsync(subjectId));

    [HttpPost("chapters")]
    public async Task<ActionResult<ChapterDto>> Create(SaveChapterRequest request)
    {
        var dto = await _service.CreateAsync(request);
        return Created($"api/admin/chapters/{dto.Id}", dto);
    }

    [HttpPut("chapters/{id:int}")]
    public async Task<ActionResult<ChapterDto>> Update(int id, SaveChapterRequest request)
        => Ok(await _service.UpdateAsync(id, request));
}