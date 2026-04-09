using Microsoft.AspNetCore.Identity;

namespace LuzDeVida.API.Data;

/// <summary>
/// Initializes default identity data (roles and admin user) on application startup.
/// This ensures the system always has at least one admin user and all required roles.
/// Called once during application initialization.
/// </summary>
public static class AuthIdentityGenerator
{
    /// <summary>
    /// Creates default roles and admin user if they don't already exist.
    /// Called during application startup to ensure system has necessary roles and admin account.
    /// </summary>
    /// <param name="serviceProvider">Service provider to access UserManager and RoleManager</param>
    /// <param name="configuration">Configuration to read default admin credentials</param>
    /// <returns>Task for async execution</returns>
    public static async Task GenerateDefaultIdentityAsync(
        IServiceProvider serviceProvider, 
        IConfiguration configuration)
    {
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

        // Ensure all defined roles exist
        foreach (var roleName in new[] 
        { 
            AuthRoles.Admin, 
            AuthRoles.CaseWorker, 
            AuthRoles.PartnerManager,
            AuthRoles.Supporter 
        })
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                var createRoleResult = await roleManager.CreateAsync(new IdentityRole(roleName));

                if (!createRoleResult.Succeeded)
                {
                    var errors = string.Join(", ", createRoleResult.Errors.Select(e => e.Description));
                    throw new Exception($"Failed to create role '{roleName}': {errors}");
                }

                Console.WriteLine($"✓ Created role: {roleName}");
            }
        }

        // Create default admin user if it doesn't exist
        var adminSection = configuration.GetSection("DefaultAdmin");
        var adminEmail = adminSection["Email"] ?? "admin@luzdevida.local";
        var adminPassword = adminSection["Password"] ?? throw new InvalidOperationException(
            "DefaultAdmin:Password must be configured in appsettings or user secrets.");

        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true,
                created_at = DateTime.UtcNow,
                is_active = true
            };

            var createAdminResult = await userManager.CreateAsync(adminUser, adminPassword);
            if (!createAdminResult.Succeeded)
            {
                var errors = string.Join(", ", createAdminResult.Errors.Select(e => e.Description));
                throw new Exception($"Failed to create admin user: {errors}");
            }

            Console.WriteLine($"✓ Created admin user: {adminEmail}");
        }

        // Ensure admin user has Admin role
        if (!await userManager.IsInRoleAsync(adminUser, AuthRoles.Admin))
        {
            var addToRoleResult = await userManager.AddToRoleAsync(adminUser, AuthRoles.Admin);
            if (!addToRoleResult.Succeeded)
            {
                var errors = string.Join(", ", addToRoleResult.Errors.Select(e => e.Description));
                throw new Exception($"Failed to assign Admin role to user: {errors}");
            }

            Console.WriteLine($"✓ Assigned Admin role to: {adminEmail}");
        }
    }
}
