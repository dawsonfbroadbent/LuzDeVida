using LuzDeVida.API.Data;
using LuzDeVida.API.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace LuzDeVida.API.Services;

public class MlPredictionService
{
    private readonly LuzDeVidaDbContext _db;
    private readonly ILogger<MlPredictionService> _logger;

    public MlPredictionService(
        LuzDeVidaDbContext db,
        ILogger<MlPredictionService> logger)
    {
        _db = db;
        _logger = logger;
    }

    // =====================================================================
    //  DONOR CHURN — reads pre-computed predictions from DB
    // =====================================================================
    public async Task<DonorChurnResultDto> PredictDonorChurnAsync()
    {
        var rows = await _db.ml_donor_churn_predictions
            .OrderByDescending(p => p.churn_risk_score)
            .ToListAsync();

        if (rows.Count == 0)
            throw new InvalidOperationException(
                "No donor churn predictions found. Run the Python retraining script to generate predictions.");

        return new DonorChurnResultDto
        {
            generated_at = rows[0].scored_at,
            predictions = rows.Select(r => new DonorChurnPredictionDto
            {
                supporter_id = r.supporter_id,
                display_name = r.display_name,
                email = r.email,
                churn_risk_score = r.churn_risk_score,
                risk_tier = r.risk_tier,
            }).ToList(),
        };
    }

    // =====================================================================
    //  RESIDENT RISK — reads pre-computed predictions from DB
    // =====================================================================
    public async Task<ResidentRiskResultDto> PredictResidentRiskAsync()
    {
        var rows = await _db.ml_resident_risk_predictions
            .OrderByDescending(p => p.risk_score)
            .ToListAsync();

        if (rows.Count == 0)
            throw new InvalidOperationException(
                "No resident risk predictions found. Run the Python retraining script to generate predictions.");

        // Compute ranks (global + per-safehouse)
        var predictions = rows.Select(r => new ResidentRiskPredictionDto
        {
            resident_id = r.resident_id,
            case_control_no = r.case_control_no,
            internal_code = r.internal_code,
            safehouse_name = r.safehouse_name,
            risk_score = r.risk_score,
            risk_tier = r.risk_tier,
        }).ToList();

        int total = predictions.Count;
        for (int i = 0; i < total; i++)
        {
            predictions[i].rank_global = i + 1;
            predictions[i].total_residents = total;
        }

        foreach (var group in predictions.GroupBy(p => p.safehouse_name))
        {
            int safehouseTotal = group.Count();
            int rank = 1;
            foreach (var p in group)
            {
                p.rank_in_safehouse = rank++;
                p.total_in_safehouse = safehouseTotal;
            }
        }

        return new ResidentRiskResultDto
        {
            predictions = predictions,
            generated_at = rows[0].scored_at,
        };
    }

    // =====================================================================
    //  SOCIAL MEDIA — batch: reads pre-computed predictions from DB
    // =====================================================================
    public async Task<SocialMediaResultDto> PredictSocialMediaAsync()
    {
        var rows = await _db.ml_social_media_predictions
            .OrderByDescending(p => p.conversion_probability)
            .ToListAsync();

        if (rows.Count == 0)
            throw new InvalidOperationException(
                "No social media predictions found. Run the Python retraining script to generate predictions.");

        return new SocialMediaResultDto
        {
            generated_at = rows[0].scored_at,
            predictions = rows.Select(r => new SocialMediaPredictionDto
            {
                post_id = r.post_id,
                platform = r.platform,
                post_type = r.post_type,
                content_topic = r.content_topic,
                conversion_probability = r.conversion_probability,
                conversion_tier = r.conversion_tier,
            }).ToList(),
        };
    }

    // =====================================================================
    //  SOCIAL MEDIA — evaluate a single hypothetical post (real-time)
    // =====================================================================
    public MlPredictionItem EvaluateSocialMediaPost(SocialMediaEvaluateRequest req)
    {
        var row = EncodeSocialMediaFeaturesFromRequest(req);
        var prob = Math.Round(NativeTreeModels.PredictSocialMedia(row.Values.ToArray()), 4);

        return new MlPredictionItem
        {
            score = prob,
            tier = Tier(prob),
        };
    }

    // =====================================================================
    //  Social Media One-Hot Encoding (for single-post evaluator only)
    // =====================================================================
    private static Dictionary<string, float> EncodeSocialMediaFeaturesFromRequest(
        SocialMediaEvaluateRequest r)
    {
        return new Dictionary<string, float>
        {
            ["post_hour"] = r.post_hour,
            ["caption_length"] = r.caption_length,
            ["features_resident_story"] = r.features_resident_story ? 1f : 0f,
            ["is_boosted"] = r.is_boosted ? 1f : 0f,
            ["in_campaign"] = r.in_campaign ? 1f : 0f,
            ["platform_LinkedIn"] = (r.platform == "LinkedIn") ? 1f : 0f,
            ["post_type_EducationalContent"] = (r.post_type == "EducationalContent") ? 1f : 0f,
            ["post_type_EventPromotion"] = (r.post_type == "EventPromotion") ? 1f : 0f,
            ["post_type_ImpactStory"] = (r.post_type == "ImpactStory") ? 1f : 0f,
            ["post_type_ThankYou"] = (r.post_type == "ThankYou") ? 1f : 0f,
            ["media_type_Reel"] = (r.media_type == "Reel") ? 1f : 0f,
            ["media_type_Text"] = (r.media_type == "Text") ? 1f : 0f,
            ["sentiment_tone_Emotional"] = (r.sentiment_tone == "Emotional") ? 1f : 0f,
            ["sentiment_tone_Informative"] = (r.sentiment_tone == "Informative") ? 1f : 0f,
            ["call_to_action_type_None"] = (r.call_to_action_type == "None"
                || !r.has_call_to_action) ? 1f : 0f,
        };
    }

    private static string Tier(double score) =>
        score >= 0.6 ? "High" : score >= 0.3 ? "Medium" : "Low";
}
