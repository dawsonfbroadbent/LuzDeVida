using LuzDeVida.API.Models.Dtos;
using LuzDeVida.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace LuzDeVida.API.Controllers;

[ApiController]
[Route("api/public-impact")]
public class PublicImpactController : ControllerBase
{
    private readonly PublicImpactService _service;
    private readonly ILogger<PublicImpactController> _logger;

    public PublicImpactController(PublicImpactService service, ILogger<PublicImpactController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        try
        {
            var data = await _service.GetAsync();
            return Ok(new ApiResponseDto<PublicImpactDto>(
                Success: true,
                Data: data,
                Error: null,
                Meta: new ApiMetaDto(DateTimeOffset.UtcNow)
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving public impact data");
            return StatusCode(500, new ApiResponseDto<PublicImpactDto>(
                Success: false,
                Data: null,
                Error: new ApiErrorDto("ERR_INTERNAL", "An unexpected error occurred.", Array.Empty<string>()),
                Meta: new ApiMetaDto(DateTimeOffset.UtcNow)
            ));
        }
    }
}
