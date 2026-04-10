using LuzDeVida.API.Data;
using LuzDeVida.API.Models.Dtos;
using LuzDeVida.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuzDeVida.API.Controllers;

[ApiController]
[Route("api/ml")]
[Authorize(Policy = AuthPolicies.RequireAdmin)]
public class MlController : ControllerBase
{
    private readonly MlPredictionService _service;
    private readonly ILogger<MlController> _logger;

    public MlController(MlPredictionService service, ILogger<MlController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// Diagnostic: confirms ML models are available (now built-in, no ONNX files needed).
    /// </summary>
    [HttpGet("status")]
    public IActionResult GetModelStatus()
    {
        return Ok(new
        {
            engine = "NativeTreeModels (pure C#)",
            donorChurnLoaded = true,
            residentRiskLoaded = true,
            socialMediaLoaded = true,
        });
    }

    /// <summary>
    /// Returns churn risk scores for all active donors.
    /// </summary>
    [HttpGet("donor-churn")]
    public async Task<IActionResult> GetDonorChurn()
    {
        try
        {
            var data = await _service.PredictDonorChurnAsync();
            return Ok(new ApiResponseDto<DonorChurnResultDto>(
                Success: true,
                Data: data,
                Error: null,
                Meta: new ApiMetaDto(DateTimeOffset.UtcNow)));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error running donor churn predictions");
            return StatusCode(500, new ApiResponseDto<DonorChurnResultDto>(
                Success: false,
                Data: null,
                Error: new ApiErrorDto("ML_ERROR", "Failed to generate donor churn predictions",
                    new List<string> { ex.Message }),
                Meta: new ApiMetaDto(DateTimeOffset.UtcNow)));
        }
    }

    /// <summary>
    /// Returns risk scores for all active residents.
    /// </summary>
    [HttpGet("resident-risk")]
    public async Task<IActionResult> GetResidentRisk()
    {
        try
        {
            var data = await _service.PredictResidentRiskAsync();
            return Ok(new ApiResponseDto<ResidentRiskResultDto>(
                Success: true,
                Data: data,
                Error: null,
                Meta: new ApiMetaDto(DateTimeOffset.UtcNow)));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error running resident risk predictions");
            return StatusCode(500, new ApiResponseDto<ResidentRiskResultDto>(
                Success: false,
                Data: null,
                Error: new ApiErrorDto("ML_ERROR", "Failed to generate resident risk predictions",
                    new List<string> { ex.Message }),
                Meta: new ApiMetaDto(DateTimeOffset.UtcNow)));
        }
    }

    /// <summary>
    /// Returns conversion predictions for all social media posts.
    /// </summary>
    [HttpGet("social-media")]
    public async Task<IActionResult> GetSocialMedia()
    {
        try
        {
            var data = await _service.PredictSocialMediaAsync();
            return Ok(new ApiResponseDto<SocialMediaResultDto>(
                Success: true,
                Data: data,
                Error: null,
                Meta: new ApiMetaDto(DateTimeOffset.UtcNow)));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error running social media predictions");
            return StatusCode(500, new ApiResponseDto<SocialMediaResultDto>(
                Success: false,
                Data: null,
                Error: new ApiErrorDto("ML_ERROR", "Failed to generate social media predictions",
                    new List<string> { ex.Message }),
                Meta: new ApiMetaDto(DateTimeOffset.UtcNow)));
        }
    }

    /// <summary>
    /// Evaluates a single hypothetical social media post before publishing.
    /// </summary>
    [HttpPost("social-media/evaluate")]
    public IActionResult EvaluateSocialMediaPost(
        [FromBody] SocialMediaEvaluateRequest req)
    {
        try
        {
            var pred = _service.EvaluateSocialMediaPost(req);
            return Ok(new ApiResponseDto<MlPredictionItem>(
                Success: true,
                Data: pred,
                Error: null,
                Meta: new ApiMetaDto(DateTimeOffset.UtcNow)));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error evaluating social media post");
            return StatusCode(500, new ApiResponseDto<MlPredictionItem>(
                Success: false,
                Data: null,
                Error: new ApiErrorDto("ML_ERROR", "Failed to evaluate post",
                    new List<string> { ex.Message }),
                Meta: new ApiMetaDto(DateTimeOffset.UtcNow)));
        }
    }
}
