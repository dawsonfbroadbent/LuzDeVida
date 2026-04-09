using LuzDeVida.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuzDeVida.API.Controllers;

[ApiController]
[Route("api/social-media-analytics")]
[Authorize(Roles = "Admin")]
public class SocialMediaAnalyticsController : ControllerBase
{
    private readonly SocialMediaAnalyticsService _service;
    private readonly ILogger<SocialMediaAnalyticsController> _logger;

    public SocialMediaAnalyticsController(
        SocialMediaAnalyticsService service,
        ILogger<SocialMediaAnalyticsController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAnalytics()
    {
        try
        {
            var data = await _service.GetAnalyticsAsync();
            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating social media analytics");
            return StatusCode(500, new
            {
                message = "Error generating social media analytics",
                error = ex.Message,
                inner = ex.InnerException?.Message,
                type = ex.GetType().Name,
            });
        }
    }
}
