using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using StudentStudyTracker.Domain.Constants;

namespace StudentStudyTracker.Infrastructure.Identity;

public static class IdentitySeeder
{
    public static async Task SeedIdentityAsync(this IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var sp = scope.ServiceProvider;

        var roleManager = sp.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = sp.GetRequiredService<UserManager<ApplicationUser>>();
        var config = sp.GetRequiredService<IConfiguration>();
        var logger = sp.GetRequiredService<ILoggerFactory>().CreateLogger("IdentitySeeder");

        foreach (var role in new[] { AppRoles.Student, AppRoles.Admin })
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                var result = await roleManager.CreateAsync(new IdentityRole(role));
                if (!result.Succeeded)
                    throw new InvalidOperationException(
                        $"Failed to create role {role}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }
        }

        var email = config["AdminSeed:Email"];
        var password = config["AdminSeed:Password"];
        var fullName = config["AdminSeed:FullName"] ?? "Administrator";

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            logger.LogWarning("AdminSeed settings are missing. Admin user was not created.");
            return;
        }

        if (await userManager.FindByEmailAsync(email) is not null)
            return;

        var admin = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FullName = fullName,
            EmailConfirmed = true
        };

        var create = await userManager.CreateAsync(admin, password);
        if (!create.Succeeded)
            throw new InvalidOperationException(
                $"Failed to create admin: {string.Join(", ", create.Errors.Select(e => e.Description))}");

        await userManager.AddToRoleAsync(admin, AppRoles.Admin);
    }
}