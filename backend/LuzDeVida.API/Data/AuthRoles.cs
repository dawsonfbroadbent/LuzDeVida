namespace LuzDeVida.API.Data;

/// <summary>
/// Defines all available roles in the LuzDeVida system.
/// Roles are assigned to users to control access to different features and data.
/// </summary>
public static class AuthRoles
{
    /// <summary>
    /// Administrator role: Can manage all data, users, and system settings.
    /// Used for staff and system administrators.
    /// </summary>
    public const string Admin = "Admin";

    /// <summary>
    /// Partner Manager role: Can manage partner organizations and their assignments.
    /// Staff members who coordinate with partner organizations.
    /// </summary>
    public const string PartnerManager = "PartnerManager";

    /// <summary>
    /// Case Worker role: Can manage resident cases, visits, and intervention plans.
    /// Front-line staff working directly with residents.
    /// </summary>
    public const string CaseWorker = "CaseWorker";

    /// <summary>
    /// Supporter role: Can view their donation history and impact.
    /// Donors and volunteers who want to see how their contributions help.
    /// </summary>
    public const string Supporter = "Supporter";
}
