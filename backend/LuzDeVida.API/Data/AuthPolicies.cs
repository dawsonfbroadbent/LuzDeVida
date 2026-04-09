namespace LuzDeVida.API.Data;

/// <summary>
/// Defines authorization policies for the LuzDeVida system.
/// Policies combine roles and claims to enforce fine-grained access control.
/// </summary>
public static class AuthPolicies
{
    /// <summary>
    /// Policy for managing residents: view, create, update, delete resident records.
    /// Required roles: Admin, CaseWorker
    /// </summary>
    public const string ManageResidents = "ManageResidents";

    /// <summary>
    /// Policy for managing safehouses: add, edit, or delete safehouse facilities.
    /// Required roles: Admin, PartnerManager
    /// </summary>
    public const string ManageSafehouses = "ManageSafehouses";

    /// <summary>
    /// Policy for managing donations: record and allocate donations.
    /// Required roles: Admin
    /// </summary>
    public const string ManageDonations = "ManageDonations";

    /// <summary>
    /// Policy for viewing public impact data: visible to anyone.
    /// No specific role required - public information.
    /// </summary>
    public const string ViewPublicImpact = "ViewPublicImpact";

    /// <summary>
    /// Policy for managing system users and roles.
    /// Required roles: Admin only
    /// </summary>
    public const string ManageUsers = "ManageUsers";

    /// <summary>
    /// Policy for deleting sensitive data (requires confirmation).
    /// Required roles: Admin
    /// </summary>
    public const string DeleteData = "DeleteData";
}
