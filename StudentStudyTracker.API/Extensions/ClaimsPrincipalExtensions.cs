using System.Security.Claims;
using StudentStudyTracker.Application.Exceptions;

namespace StudentStudyTracker.API.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static string GetUserId(this ClaimsPrincipal user) =>
        user.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedException("Invalid token.");
}