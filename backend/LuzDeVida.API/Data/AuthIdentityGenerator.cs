using Microsoft.AspNetCore.Identity;

namespace LuzDeVida.API.Data
{
    public class AuthIdentityGenerator
    {
        public static async Task GenerateDefaultIdentityAsync(IServiceProvider serviceProvider)
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            foreach (var roleName in new[] { AuthRoles.Admin, AuthRoles.Supporter })
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    var createRoleResult = await roleManager.CreateAsync(new IdentityRole(roleName));

                    if (!createRoleResult.Succeeded)
                    {
                        throw new Exception($"Failed to create role '{roleName}': {string.Join(", ", createRoleResult.Errors.Select(e => e.Description))}");
                    }
                }
            }
        }
    }
}
