using Microsoft.AspNetCore.Identity;

namespace LuzDeVida.API.Models.Identity;

public class ApplicationUser : IdentityUser<Guid>
{
    public string? FullName { get; set; }
    public string? Role { get; set; } // "admin", "staff", "donor"
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    public bool IsMFAEnabled { get; set; } = false;
}

public class ApplicationRole : IdentityRole<Guid>
{
    public string? Description { get; set; }
}
