using StudentStudyTracker.Application.DTOs.Auth;
namespace StudentStudyTracker.Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
    }
}
