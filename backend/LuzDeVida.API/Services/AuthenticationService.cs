using LuzDeVida.API.Models.Identity;
using Microsoft.AspNetCore.Identity;

namespace LuzDeVida.API.Services;

public interface IAuthService
{
    Task<(bool Success, string Message, ApplicationUser? User)> LoginAsync(string username, string password);
    Task<(bool Success, string Message)> LogoutAsync(ApplicationUser user);
    Task<(bool Success, string Message, ApplicationUser? User)> RegisterAsync(string username, string email, string password, string? fullName, string? role);
}

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _logger = logger;
    }

    public async Task<(bool Success, string Message, ApplicationUser? User)> LoginAsync(string username, string password)
    {
        try
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user is null)
            {
                _logger.LogWarning($"Login attempt for non-existent user: {username}");
                return (false, "Invalid username or password.", null);
            }

            if (!user.IsActive)
            {
                _logger.LogWarning($"Login attempt for inactive user: {username}");
                return (false, "This account is inactive.", null);
            }

            var result = await _signInManager.PasswordSignInAsync(user, password, isPersistent: true, lockoutOnFailure: true);

            if (result.Succeeded)
            {
                user.LastLoginAt = DateTime.UtcNow;
                await _userManager.UpdateAsync(user);
                _logger.LogInformation($"User {username} logged in successfully.");
                return (true, "Login successful.", user);
            }

            if (result.IsLockedOut)
            {
                _logger.LogWarning($"Login attempt for locked-out user: {username}");
                return (false, "Account is locked due to too many failed login attempts.", null);
            }

            _logger.LogWarning($"Failed login attempt for user: {username}");
            return (false, "Invalid username or password.", null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login");
            return (false, "An error occurred during login.", null);
        }
    }

    public async Task<(bool Success, string Message)> LogoutAsync(ApplicationUser user)
    {
        try
        {
            await _signInManager.SignOutAsync();
            _logger.LogInformation($"User {user.UserName} logged out.");
            return (true, "Logout successful.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            return (false, "An error occurred during logout.");
        }
    }

    public async Task<(bool Success, string Message, ApplicationUser? User)> RegisterAsync(string username, string email, string password, string? fullName, string? role)
    {
        try
        {
            var existingUser = await _userManager.FindByNameAsync(username);
            if (existingUser is not null)
            {
                return (false, "Username already exists.", null);
            }

            var user = new ApplicationUser
            {
                UserName = username,
                Email = email,
                FullName = fullName,
                Role = role ?? "staff"
            };

            var result = await _userManager.CreateAsync(user, password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                _logger.LogWarning($"Registration failed for {username}: {errors}");
                return (false, $"Registration failed: {errors}", null);
            }

            // Assign role
            if (!string.IsNullOrEmpty(role))
            {
                var roleResult = await _userManager.AddToRoleAsync(user, role);
                if (!roleResult.Succeeded)
                {
                    _logger.LogWarning($"Failed to assign role {role} to user {username}");
                }
            }

            _logger.LogInformation($"User {username} registered successfully.");
            return (true, "Registration successful.", user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration");
            return (false, "An error occurred during registration.", null);
        }
    }
}
