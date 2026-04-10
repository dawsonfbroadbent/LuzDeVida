using System.Security.Claims;
using LuzDeVida.API.Data;
using LuzDeVida.API.Models;
using LuzDeVida.API.Models.Dtos;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;

namespace LuzDeVida.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    IConfiguration configuration,
    LuzDeVidaDbContext dbContext) : ControllerBase
{
    private const string DefaultFrontendUrl = "http://localhost:3000";
    private const string DefaultExternalReturnPath = "/";

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto request)
    {
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            var errors = result.Errors
                .GroupBy(e => e.Code)
                .ToDictionary(g => g.Key, g => g.Select(e => e.Description).ToArray());
            return ValidationProblem(new ValidationProblemDetails(errors));
        }

        await userManager.AddToRoleAsync(user, AuthRoles.Supporter);

        try
        {
            var firstName = request.FirstName?.Trim() ?? "";
            var lastName = request.LastName?.Trim() ?? "";
            var displayName = string.IsNullOrWhiteSpace(firstName) && string.IsNullOrWhiteSpace(lastName)
                ? request.Email
                : $"{firstName} {lastName}".Trim();

            var maxSupporterId = await dbContext.supporters
                .AsNoTracking()
                .MaxAsync(s => (int?)s.supporter_id) ?? 0;

            var newSupporter = new supporter
            {
                supporter_id = maxSupporterId + 1,
                first_name = string.IsNullOrWhiteSpace(firstName) ? null : firstName,
                last_name = string.IsNullOrWhiteSpace(lastName) ? null : lastName,
                display_name = displayName,
                email = request.Email.Trim().ToLower(),
                supporter_type = "individual",
                status = "active",
                relationship_type = "supporter",
                acquisition_channel = "self_registration",
                created_at = DateTime.UtcNow,
            };

            dbContext.supporters.Add(newSupporter);
            await dbContext.SaveChangesAsync();

            var newAppUser = new app_user
            {
                email = request.Email.Trim().ToLower(),
                password_hash = "IDENTITY_MANAGED",
                role = "supporter",
                supporter_id = newSupporter.supporter_id,
                is_active = true,
                created_at = DateTime.UtcNow,
            };

            dbContext.app_users.Add(newAppUser);
            await dbContext.SaveChangesAsync();
        }
        catch
        {
            // Identity user was created but supporter/app_user failed — clean up
            await userManager.DeleteAsync(user);
            return StatusCode(500, new { title = "Registration failed. Please try again." });
        }

        return Ok();
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginDto request,
        [FromQuery] bool? useCookies,
        [FromQuery] bool? useSessionCookies)
    {
        var isPersistent = useCookies == true && useSessionCookies != true;
        var result = await signInManager.PasswordSignInAsync(
            request.Email, request.Password, isPersistent, lockoutOnFailure: false);

        if (!result.Succeeded)
            return Problem("Invalid email or password.", statusCode: StatusCodes.Status401Unauthorized);

        return Ok();
    }

    [HttpGet("me")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public async Task<IActionResult> GetCurrentSession()
    {
        if (User.Identity?.IsAuthenticated != true)
        {
            return Ok(new
            {
                isAuthenticated = false,
                userName = (string?)null,
                email = (string?)null,
                roles = Array.Empty<string>()
            });
        }

        var user = await userManager.GetUserAsync(User);
        var roles = User.Claims
            .Where(claim => claim.Type == ClaimTypes.Role)
            .Select(claim => claim.Value)
            .Distinct()
            .OrderBy(role => role)
            .ToArray();

        return Ok(new
        {
            isAuthenticated = true,
            userName = user?.UserName ?? User.Identity?.Name,
            email = user?.Email,
            roles
        });
    }

    [HttpGet("providers")]
    public IActionResult GetExternalProviders()
    {
        var providers = new List<object>();

        if (IsGoogleConfigured())
        {
            providers.Add(new
            {
                name = GoogleDefaults.AuthenticationScheme,
                displayName = "Google"
            });
        }

        return Ok(providers);
    }

    [HttpGet("external-login")]
    public IActionResult ExternalLogin(
        [FromQuery] string provider,
        [FromQuery] string? returnPath = null)
    {
        if (!string.Equals(provider, GoogleDefaults.AuthenticationScheme, StringComparison.OrdinalIgnoreCase) ||
            !IsGoogleConfigured())
        {
            return BadRequest(new { message = "The requested external login provider is not available." });
        }

        var callbackUrl = Url.Action(nameof(ExternalLoginCallback), new
        {
            returnPath = NormalizeReturnPath(returnPath)
        });

        if (string.IsNullOrWhiteSpace(callbackUrl))
        {
            return Problem("Unable to create the external login callback URL.");
        }

        var properties = signInManager.ConfigureExternalAuthenticationProperties(
            GoogleDefaults.AuthenticationScheme,
            callbackUrl);

        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    [HttpGet("external-callback")]
    public async Task<IActionResult> ExternalLoginCallback(
        [FromQuery] string? returnPath = null,
        [FromQuery] string? remoteError = null)
    {
        if (!string.IsNullOrWhiteSpace(remoteError))
        {
            return Redirect(BuildFrontendErrorUrl("External login failed."));
        }

        var info = await signInManager.GetExternalLoginInfoAsync();

        if (info is null)
        {
            return Redirect(BuildFrontendErrorUrl("External login information was unavailable."));
        }

        var signInResult = await signInManager.ExternalLoginSignInAsync(
            info.LoginProvider,
            info.ProviderKey,
            isPersistent: false,
            bypassTwoFactor: true);

        if (signInResult.Succeeded)
        {
            return Redirect(BuildFrontendSuccessUrl(returnPath));
        }

        var email = info.Principal.FindFirstValue(ClaimTypes.Email) ??
            info.Principal.FindFirstValue("email");

        if (string.IsNullOrWhiteSpace(email))
        {
            return Redirect(BuildFrontendErrorUrl("The external provider did not return an email address."));
        }

        var user = await userManager.FindByEmailAsync(email);

        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true
            };

            var createResult = await userManager.CreateAsync(user);

            if (!createResult.Succeeded)
            {
                return Redirect(BuildFrontendErrorUrl("Unable to create a local account for the external login."));
            }

            await userManager.AddToRoleAsync(user, AuthRoles.Supporter);
            await EnsureSupporterAndAppUser(email, info);
        }

        var addLoginResult = await userManager.AddLoginAsync(user, info);

        if (!addLoginResult.Succeeded)
        {
            return Redirect(BuildFrontendErrorUrl("Unable to associate the external login with the local account."));
        }

        await signInManager.SignInAsync(user, isPersistent: false, info.LoginProvider);
        return Redirect(BuildFrontendSuccessUrl(returnPath));
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await signInManager.SignOutAsync();
        return Ok(new { message = "Logout successful." });
    }

    private async Task EnsureSupporterAndAppUser(string email, ExternalLoginInfo? info = null)
    {
        var normalizedEmail = email.Trim().ToLower();

        var existingAppUser = await dbContext.app_users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.email.ToLower() == normalizedEmail);

        if (existingAppUser != null)
            return;

        var firstName = info?.Principal.FindFirstValue(ClaimTypes.GivenName) ?? "";
        var lastName = info?.Principal.FindFirstValue(ClaimTypes.Surname) ?? "";
        var displayName = string.IsNullOrWhiteSpace(firstName) && string.IsNullOrWhiteSpace(lastName)
            ? normalizedEmail
            : $"{firstName} {lastName}".Trim();

        var maxSupporterId = await dbContext.supporters
            .AsNoTracking()
            .MaxAsync(s => (int?)s.supporter_id) ?? 0;

        var newSupporter = new supporter
        {
            supporter_id = maxSupporterId + 1,
            first_name = string.IsNullOrWhiteSpace(firstName) ? null : firstName,
            last_name = string.IsNullOrWhiteSpace(lastName) ? null : lastName,
            display_name = displayName,
            email = normalizedEmail,
            supporter_type = "individual",
            status = "active",
            relationship_type = "supporter",
            acquisition_channel = info != null ? "google" : "self_registration",
            created_at = DateTime.UtcNow,
        };

        dbContext.supporters.Add(newSupporter);
        await dbContext.SaveChangesAsync();

        var newAppUser = new app_user
        {
            email = normalizedEmail,
            password_hash = "IDENTITY_MANAGED",
            role = "supporter",
            supporter_id = newSupporter.supporter_id,
            is_active = true,
            created_at = DateTime.UtcNow,
        };

        dbContext.app_users.Add(newAppUser);
        await dbContext.SaveChangesAsync();
    }

    private bool IsGoogleConfigured() =>
        !string.IsNullOrWhiteSpace(configuration["Authentication:Google:ClientId"]) &&
        !string.IsNullOrWhiteSpace(configuration["Authentication:Google:ClientSecret"]);

    private static string NormalizeReturnPath(string? returnPath)
    {
        if (string.IsNullOrWhiteSpace(returnPath) || !returnPath.StartsWith('/'))
            return DefaultExternalReturnPath;
        return returnPath;
    }

    private string BuildFrontendSuccessUrl(string? returnPath)
    {
        var frontendUrl = configuration["FrontendUrl"] ?? DefaultFrontendUrl;
        return $"{frontendUrl.TrimEnd('/')}{NormalizeReturnPath(returnPath)}";
    }

    private string BuildFrontendErrorUrl(string errorMessage)
    {
        var frontendUrl = configuration["FrontendUrl"] ?? DefaultFrontendUrl;
        var loginUrl = $"{frontendUrl.TrimEnd('/')}/login";
        return QueryHelpers.AddQueryString(loginUrl, "externalError", errorMessage);
    }
}
