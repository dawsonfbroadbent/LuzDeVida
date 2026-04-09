using LuzDeVida.API.Data;
// using LuzDeVida.API.Models;
// using LuzDeVida.API.Models.Dtos;
using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;
// using Microsoft.IdentityModel.Tokens;
// using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
// using System.Text;

namespace LuzDeVida.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager) : ControllerBase
{
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentSession()
    {
        if (User.Identity?.IsAuthenticated != true)
        {
            return Ok(new 
            { 
                IsAuthenticated = false,
                userName = (string?)null,
                email = (string?)null,
                roles = Array.Empty<string>(),
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
            IsAuthenticated = true,
            userName = user?.UserName ?? User.Identity?.Name,
            email = user?.Email,
            roles
        });


    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {

        await signInManager.SignOutAsync();

        return Ok(new { message = "Logged out successfully." });

    }
}

//     [HttpPost("register")]
//     public async Task<IActionResult> Register([FromBody] RegisterDto dto)
//     {
//         if (string.IsNullOrWhiteSpace(dto.FirstName) ||
//             string.IsNullOrWhiteSpace(dto.LastName) ||
//             string.IsNullOrWhiteSpace(dto.Email) ||
//             string.IsNullOrWhiteSpace(dto.Password))
//             return BadRequest(new { message = "All fields are required." });

//         if (dto.Password.Length < 8)
//             return BadRequest(new { message = "Password must be at least 8 characters." });

//         if (!dto.Email.Contains('@') || !dto.Email.Contains('.'))
//             return BadRequest(new { message = "Please enter a valid email address." });

//         var emailExists = await _context.app_users
//             .AnyAsync(u => u.email.ToLower() == dto.Email.ToLower());

//         if (emailExists)
//             return Conflict(new { message = "An account with that email already exists." });

//         await using var transaction = await _context.Database.BeginTransactionAsync();
//         try
//         {
//             var displayName = $"{dto.FirstName.Trim()} {dto.LastName.Trim()}";

//             // Get next supporter ID (supporters table uses assigned IDs)
//             var maxSupporterId = await _context.supporters.MaxAsync(s => (int?)s.supporter_id) ?? 0;
//             var newSupporterId = maxSupporterId + 1;

//             var newSupporter = new supporter
//             {
//                 supporter_id   = newSupporterId,
//                 first_name     = dto.FirstName.Trim(),
//                 last_name      = dto.LastName.Trim(),
//                 display_name   = displayName,
//                 email          = dto.Email.Trim().ToLower(),
//                 supporter_type = "individual",
//                 status         = "active",
//                 relationship_type = "supporter",
//                 acquisition_channel = "self_registration",
//                 created_at     = DateTime.UtcNow,
//             };

//             _context.supporters.Add(newSupporter);
//             await _context.SaveChangesAsync();

//             var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

//             var newUser = new app_user
//             {
//                 email         = dto.Email.Trim().ToLower(),
//                 password_hash = passwordHash,
//                 role          = "supporter",
//                 supporter_id  = newSupporterId,
//                 is_active     = true,
//                 created_at    = DateTime.UtcNow,
//             };

//             _context.app_users.Add(newUser);
//             await _context.SaveChangesAsync();

//             await transaction.CommitAsync();

//             var token = GenerateJwt(newUser.user_id, newUser.email, newUser.role, displayName);

//             return Ok(new AuthResponseDto
//             {
//                 Token       = token,
//                 Email       = newUser.email,
//                 DisplayName = displayName,
//                 Role        = newUser.role,
//                 UserId      = newUser.user_id,
//             });
//         }
//         catch
//         {
//             await transaction.RollbackAsync();
//             throw;
//         }
//     }

//     [HttpPost("login")]
//     public async Task<IActionResult> Login([FromBody] LoginDto dto)
//     {
//         if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
//             return BadRequest(new { message = "Email and password are required." });

//         var user = await _context.app_users
//             .Include(u => u.supporter)
//             .FirstOrDefaultAsync(u => u.email.ToLower() == dto.Email.Trim().ToLower());

//         if (user == null || !user.is_active)
//             return Unauthorized(new { message = "Invalid email or password." });

//         var valid = BCrypt.Net.BCrypt.Verify(dto.Password, user.password_hash);
//         if (!valid)
//             return Unauthorized(new { message = "Invalid email or password." });

//         var displayName = user.supporter?.display_name ?? user.email;
//         var token = GenerateJwt(user.user_id, user.email, user.role, displayName);

//         return Ok(new AuthResponseDto
//         {
//             Token       = token,
//             Email       = user.email,
//             DisplayName = displayName,
//             Role        = user.role,
//             UserId      = user.user_id,
//         });
//     }

//     private string GenerateJwt(int userId, string email, string role, string displayName)
//     {
//         var key    = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
//         var creds  = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

//         var claims = new[]
//         {
//             new Claim(JwtRegisteredClaimNames.Sub,   userId.ToString()),
//             new Claim(JwtRegisteredClaimNames.Email, email),
//             new Claim(ClaimTypes.Role,               role),
//             new Claim("displayName",                 displayName),
//             new Claim(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString()),
//         };

//         var token = new JwtSecurityToken(
//             issuer:             _config["Jwt:Issuer"],
//             audience:           _config["Jwt:Audience"],
//             claims:             claims,
//             expires:            DateTime.UtcNow.AddDays(7),
//             signingCredentials: creds
//         );

//         return new JwtSecurityTokenHandler().WriteToken(token);
//     }
// }
