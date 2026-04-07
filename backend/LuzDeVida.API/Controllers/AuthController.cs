using LuzDeVida.API.Models.DTOs;
using LuzDeVida.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuzDeVida.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Error = new ErrorDetail { Code = "VALIDATION_ERROR", Message = "Invalid input" }
            });
        }

        var (success, message, user) = await _authService.LoginAsync(request.Username, request.Password);

        if (!success)
        {
            return Unauthorized(new ApiResponse<object>
            {
                Success = false,
                Error = new ErrorDetail { Code = "LOGIN_FAILED", Message = message }
            });
        }

        var response = new LoginResponse
        {
            Id = user.Id,
            Username = user.UserName,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role
        };

        return Ok(new ApiResponse<LoginResponse>
        {
            Success = true,
            Data = response,
            Meta = new MetaInfo { Timestamp = DateTime.UtcNow }
        });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var user = HttpContext.Items["User"] as dynamic;
        var (success, message) = await _authService.LogoutAsync(new LuzDeVida.API.Models.Identity.ApplicationUser { UserName = user?.UserName });

        if (!success)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Error = new ErrorDetail { Code = "LOGOUT_FAILED", Message = message }
            });
        }

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Meta = new MetaInfo { Timestamp = DateTime.UtcNow }
        });
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult GetCurrentUser()
    {
        var username = User.Identity?.Name;
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = new { Username = username, Role = User.FindFirst("role")?.Value },
            Meta = new MetaInfo { Timestamp = DateTime.UtcNow }
        });
    }
}
