using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StudentStudyTracker.Application.Interfaces;
using StudentStudyTracker.Infrastructure.Identity;
using StudentStudyTracker.Infrastructure.Persistence;
using StudentStudyTracker.Infrastructure.Services;


namespace StudentStudyTracker.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(
        this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

            services.AddIdentityCore<ApplicationUser>()
                .AddRoles<IdentityRole>()
                .AddEntityFrameworkStores<AppDbContext>();
            services.Configure<JwtSettings>(configuration.GetSection("Jwt"));
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IYearLevelService, YearLevelService>();
            services.AddScoped<ISubjectService, SubjectService>();
            return services;
        }
    }
}
