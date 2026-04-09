using System.Security.Claims;
using LuzDeVida.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LuzDeVida.API.Controllers;

/// <summary>
/// Authentication controller for user authentication and account management.
/// Handles login, logout, registration, and session information.
/// Uses ASP.NET Core Identity for secure credential management.
/// </summary>
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _roleManager = roleManager;
    }

    /// <summary>
    /// Get the current authenticated user's session information.
    /// Does NOT require authentication - allows clients to check auth status.
    /// </summary>
    /// <returns>User info if authenticated, or anonymous response if not</returns>
    [AllowAnonymous]
    [HttpGet("me")]
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

        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Ok(new
            {
                isAuthenticated = false,
                userName = (string?)null,
                email = (string?)null,
                roles = Array.Empty<string>()
            });
        }

        // Get user's roles
        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new
        {
            isAuthenticated = true,
            userName = user.UserName,
            email = user.Email,
            roles = roles.OrderBy(r => r).ToArray()
        });
    }

    /// <summary>
    /// Get the current user's detailed profile information.
    /// Requires authentication.
    /// </summary>
    [Authorize]
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return NotFound(new { error = "User not found" });
        }

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new
        {
            user.Id,
            user.UserName,
            user.Email,
            user.EmailConfirmed,
            user.created_at,
            user.is_active,
            user.last_login,
            roles = roles.ToArray()
        });
    }

    /// <summary>
    /// Update current user's password.
    /// Requires authentication and current password verification.
    /// </summary>
    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.CurrentPassword) || 
            string.IsNullOrWhiteSpace(dto.NewPassword))
        {
            return BadRequest(new { error = "Current password and new password are required" });
        }

        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return NotFound(new { error = "User not found" });
        }

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return BadRequest(new { error = errors });
        }

        return Ok(new { message = "Password changed successfully" });
    }

    /// <summary>
    /// Logout the current user and clear authentication cookie.
    /// </summary>
    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return Ok(new { message = "Logout successful" });
    }

    /// <summary>
    /// Access denied response.
    /// </summary>
    [AllowAnonymous]
    [HttpGet("access-denied")]
    public IActionResult AccessDenied()
    {
        return Forbid();
    }
}

/// <summary>
/// DTO for login requests (handled by ASP.NET Identity endpoints).
/// </summary>
public class LoginDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool RememberMe { get; set; }
}

/// <summary>
/// DTO for password change requests.
/// </summary>
public class ChangePasswordDto
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

            // Get next supporter ID (supporters table uses assigned IDs)
            var maxSupporterId = await _context.supporters.MaxAsync(s => (int?)s.supporter_id) ?? 0;
            var newSupporterId = maxSupporterId + 1;

            var newSupporter = new supporter
            {
                supporter_id   = newSupporterId,
                first_name     = dto.FirstName.Trim(),
                last_name      = dto.LastName.Trim(),
                display_name   = displayName,
                email          = dto.Email.Trim().ToLower(),
                supporter_type = "individual",
                status         = "active",
                relationship_type = "supporter",
                acquisition_channel = "self_registration",
                created_at     = DateTime.UtcNow,
            };

            _context.supporters.Add(newSupporter);
            await _context.SaveChangesAsync();

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var newUser = new app_user
            {
                email         = dto.Email.Trim().ToLower(),
                password_hash = passwordHash,
                role          = "supporter",
                supporter_id  = newSupporterId,
                is_active     = true,
                created_at    = DateTime.UtcNow,
            };

            _context.app_users.Add(newUser);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            var token = GenerateJwt(newUser.user_id, newUser.email, newUser.role, displayName);

            return Ok(new AuthResponseDto
            {
                Token       = token,
                Email       = newUser.email,
                DisplayName = displayName,
                Role        = newUser.role,
                UserId      = newUser.user_id,
            });
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Email and password are required." });

        var user = await _context.app_users
            .Include(u => u.supporter)
            .FirstOrDefaultAsync(u => u.email.ToLower() == dto.Email.Trim().ToLower());

        if (user == null || !user.is_active)
            return Unauthorized(new { message = "Invalid email or password." });

        var valid = BCrypt.Net.BCrypt.Verify(dto.Password, user.password_hash);
        if (!valid)
            return Unauthorized(new { message = "Invalid email or password." });

        var displayName = user.supporter?.display_name ?? user.email;
        var token = GenerateJwt(user.user_id, user.email, user.role, displayName);

        return Ok(new AuthResponseDto
        {
            Token       = token,
            Email       = user.email,
            DisplayName = displayName,
            Role        = user.role,
            UserId      = user.user_id,
        });
    }

    private string GenerateJwt(int userId, string email, string role, string displayName)
    {
        var key    = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds  = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub,   userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(ClaimTypes.Role,               role),
            new Claim("displayName",                 displayName),
            new Claim(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer:             _config["Jwt:Issuer"],
            audience:           _config["Jwt:Audience"],
            claims:             claims,
            expires:            DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
