using StudentStudyTracker.Application.Exceptions;

namespace StudentStudyTracker.API.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                var statusCode = ex switch
                {
                    ConflictException => StatusCodes.Status409Conflict,
                    UnauthorizedException => StatusCodes.Status401Unauthorized,
                    BadRequestException => StatusCodes.Status400BadRequest,
                    _ => StatusCodes.Status500InternalServerError
                };

                if (statusCode == StatusCodes.Status500InternalServerError)
                    _logger.LogError(ex, "Unhandled exception while processing {Method} {Path}",
                        context.Request.Method, context.Request.Path);

                var message = statusCode == StatusCodes.Status500InternalServerError
                    ? "An unexpected error occurred."
                    : ex.Message;

                context.Response.StatusCode = statusCode;
                await context.Response.WriteAsJsonAsync(new { message });
            }
        }
    }
}
