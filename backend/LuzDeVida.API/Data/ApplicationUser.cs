using Microsoft.AspNetCore.Identity;

namespace LuzDeVida.API.Data;

/// <summary>
/// Custom ApplicationUser that extends IdentityUser with LuzDeVida-specific properties.
/// Used for authentication and authorization in ASP.NET Core Identity.
/// </summary>
public class ApplicationUser : IdentityUser
{
    /// <summary>
    /// Foreign key to the supporter record (if this user is a supporter/donor).
    /// </summary>
    public int? supporter_id { get; set; }

    /// <summary>
    /// Foreign key to the partner record (if this user is a partner representative).
    /// </summary>
    public int? partner_id { get; set; }

    /// <summary>
    /// Timestamp when the account was created.
    /// </summary>
    public DateTime created_at { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Indicates if the account is active. Can be set to false to deactivate without deleting.
    /// </summary>
    public bool is_active { get; set; } = true;

    /// <summary>
    /// Last login timestamp for audit purposes.
    /// </summary>
    public DateTime? last_login { get; set; }
}
