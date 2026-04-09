using LuzDeVida.API.Data;
using LuzDeVida.API.Models.Dtos;
using Microsoft.EntityFrameworkCore;
using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;

namespace LuzDeVida.API.Services;

/// <summary>
/// Holds the three ONNX InferenceSessions (singleton, thread-safe).
/// </summary>
public class OnnxModelHolder : IDisposable
{
    public InferenceSession DonorChurn { get; }
    public InferenceSession ResidentRisk { get; }
    public InferenceSession SocialMedia { get; }

    public OnnxModelHolder(string modelsDir)
    {
        DonorChurn   = new InferenceSession(Path.Combine(modelsDir, "donor_churn_model.onnx"));
        ResidentRisk = new InferenceSession(Path.Combine(modelsDir, "resident_risk_model.onnx"));
        SocialMedia  = new InferenceSession(Path.Combine(modelsDir, "social_media_model.onnx"));
    }

    public void Dispose()
    {
        DonorChurn.Dispose();
        ResidentRisk.Dispose();
        SocialMedia.Dispose();
    }
}

public class MlPredictionService
{
    private readonly LuzDeVidaDbContext _db;
    private readonly OnnxModelHolder _models;
    private readonly ILogger<MlPredictionService> _logger;

    public MlPredictionService(
        LuzDeVidaDbContext db,
        OnnxModelHolder models,
        ILogger<MlPredictionService> logger)
    {
        _db = db;
        _models = models;
        _logger = logger;
    }

    // =====================================================================
    //  DONOR CHURN
    // =====================================================================
    public async Task<DonorChurnResultDto> PredictDonorChurnAsync()
    {
        var supporters = await _db.supporters
            .Where(s => s.status == "active")
            .ToListAsync();

        var donations = await _db.donations.ToListAsync();
        var allocations = await _db.donation_allocations.ToListAsync();
        var socialPosts = await _db.social_media_posts.ToListAsync();

        var numericRows = new List<Dictionary<string, float>>();
        var categoricalRows = new List<Dictionary<string, string>>();
        var metaList = new List<(int id, string? name, string? email)>();

        foreach (var s in supporters)
        {
            var sDonations = donations
                .Where(d => d.supporter_id == s.supporter_id)
                .OrderBy(d => d.donation_date)
                .ToList();

            if (sDonations.Count == 0) continue;

            // avg_days_between_donations
            float avgDaysBetween = 0;
            var dates = sDonations
                .Where(d => d.donation_date.HasValue)
                .Select(d => d.donation_date!.Value.ToDateTime(TimeOnly.MinValue))
                .OrderBy(d => d).ToList();
            if (dates.Count > 1)
            {
                var gaps = new List<double>();
                for (int i = 1; i < dates.Count; i++)
                    gaps.Add((dates[i] - dates[i - 1]).TotalDays);
                avgDaysBetween = (float)gaps.Average();
            }

            var monetary = sDonations.Where(d => d.donation_type == "monetary").ToList();
            float avgAmount = monetary.Count > 0
                ? (float)monetary.Average(d => d.amount ?? 0) : 0;

            int numCampaigns = sDonations
                .Where(d => !string.IsNullOrEmpty(d.campaign_name))
                .Select(d => d.campaign_name).Distinct().Count();
            int numChannels = sDonations
                .Select(d => d.channel_source).Distinct().Count();

            var donationIds = sDonations.Select(d => d.donation_id).ToHashSet();
            var sAllocations = allocations
                .Where(a => donationIds.Contains(a.donation_id)).ToList();
            int numProgramAreas = sAllocations
                .Select(a => a.program_area).Distinct().Count();

            var inkind = sDonations.Where(d => d.donation_type == "in-kind").ToList();

            var referralPostIds = sDonations
                .Where(d => d.referral_post_id.HasValue)
                .Select(d => d.referral_post_id!.Value).ToList();
            float avgRefEngagement = 0;
            if (referralPostIds.Count > 0)
            {
                var refPosts = socialPosts
                    .Where(p => referralPostIds.Contains(p.post_id)).ToList();
                if (refPosts.Count > 0)
                    avgRefEngagement = (float)refPosts
                        .Average(p => p.engagement_rate ?? 0);
            }

            string preferredChannel = sDonations
                .Where(d => !string.IsNullOrEmpty(d.channel_source))
                .GroupBy(d => d.channel_source)
                .OrderByDescending(g => g.Count())
                .Select(g => g.Key!).FirstOrDefault() ?? "unknown";

            string preferredProgramArea = sAllocations
                .Where(a => !string.IsNullOrEmpty(a.program_area))
                .GroupBy(a => a.program_area)
                .OrderByDescending(g => g.Count())
                .Select(g => g.Key!).FirstOrDefault() ?? "unknown";

            numericRows.Add(new Dictionary<string, float>
            {
                ["avg_days_between_donations"] = avgDaysBetween,
                ["avg_donation_amount"] = avgAmount,
                ["num_campaigns"] = numCampaigns,
                ["num_channels"] = numChannels,
                ["num_program_areas"] = numProgramAreas,
                ["inkind_donation_count"] = inkind.Count,
                ["has_inkind"] = inkind.Count > 0 ? 1f : 0f,
                ["num_social_referrals"] = referralPostIds.Count,
                ["avg_referral_post_engagement"] = avgRefEngagement,
            });

            categoricalRows.Add(new Dictionary<string, string>
            {
                ["supporter_type"] = s.supporter_type ?? "unknown",
                ["acquisition_channel"] = s.acquisition_channel ?? "unknown",
                ["region"] = s.region ?? "unknown",
                ["relationship_type"] = s.relationship_type ?? "unknown",
                ["preferred_channel"] = preferredChannel,
                ["preferred_program_area"] = preferredProgramArea,
            });

            metaList.Add((s.supporter_id, s.display_name, s.email));
        }

        if (numericRows.Count == 0)
            return new DonorChurnResultDto { predictions = new(), generated_at = DateTime.UtcNow };

        var probas = RunDonorChurnInference(numericRows, categoricalRows);

        var result = new DonorChurnResultDto { generated_at = DateTime.UtcNow };
        for (int i = 0; i < probas.Count; i++)
        {
            result.predictions.Add(new DonorChurnPredictionDto
            {
                supporter_id = metaList[i].id,
                display_name = metaList[i].name,
                email = metaList[i].email,
                churn_risk_score = probas[i],
                risk_tier = Tier(probas[i]),
            });
        }
        return result;
    }

    // =====================================================================
    //  RESIDENT RISK
    // =====================================================================
    public async Task<ResidentRiskResultDto> PredictResidentRiskAsync()
    {
        var residents = await _db.residents
            .Where(r => r.case_status == "active")
            .Include(r => r.safehouse)
            .ToListAsync();

        var healthRecords = await _db.health_wellbeing_records.ToListAsync();
        var visitations = await _db.home_visitations.ToListAsync();
        var recordings = await _db.process_recordings.ToListAsync();
        var incidents = await _db.incident_reports.ToListAsync();
        var eduRecords = await _db.education_records.ToListAsync();

        var rows = new List<Dictionary<string, float>>();
        var metaList = new List<(int id, string? ccn, string? code, string? sh)>();

        foreach (var r in residents)
        {
            var rHealth = healthRecords.Where(h => h.resident_id == r.resident_id).ToList();
            var rVisits = visitations.Where(v => v.resident_id == r.resident_id).ToList();
            var rSessions = recordings.Where(p => p.resident_id == r.resident_id).ToList();
            var rIncidents = incidents.Where(i => i.resident_id == r.resident_id).ToList();
            var rEdu = eduRecords.Where(e => e.resident_id == r.resident_id).ToList();

            float lengthOfStay = r.date_of_admission.HasValue
                ? (float)((DateTime.UtcNow - r.date_of_admission.Value
                    .ToDateTime(TimeOnly.MinValue)).TotalDays / 30.44) : 0;

            float healthMean = rHealth.Count > 0
                ? (float)rHealth.Average(h => h.general_health_score ?? 0) : 0;
            float nutritionMean = rHealth.Count > 0
                ? (float)rHealth.Average(h => h.nutrition_score ?? 0) : 0;
            float sleepMean = rHealth.Count > 0
                ? (float)rHealth.Average(h => h.sleep_score ?? 0) : 0;
            float energyMean = rHealth.Count > 0
                ? (float)rHealth.Average(h => h.energy_score ?? 0) : 0;
            float bmiLatest = rHealth.Count > 0
                ? (float)(rHealth.OrderByDescending(h => h.record_date).First().bmi ?? 0) : 0;
            float medicalProp = rHealth.Count > 0
                ? rHealth.Count(h => h.medical_checkup_done == true) / (float)rHealth.Count : 0;
            float dentalProp = rHealth.Count > 0
                ? rHealth.Count(h => h.dental_checkup_done == true) / (float)rHealth.Count : 0;
            float psychProp = rHealth.Count > 0
                ? rHealth.Count(h => h.psychological_checkup_done == true) / (float)rHealth.Count : 0;

            float progressMean = rEdu.Count > 0
                ? (float)rEdu.Average(e => e.progress_percent ?? 0) : 0;

            float incidentResRate = rIncidents.Count > 0
                ? rIncidents.Count(i => i.resolved == true) / (float)rIncidents.Count : 0;

            float emotionalEndMean = 0;
            if (rSessions.Count > 0)
            {
                var endScores = rSessions
                    .Where(s => float.TryParse(s.emotional_state_end, out _))
                    .Select(s => float.Parse(s.emotional_state_end!)).ToList();
                if (endScores.Count > 0)
                    emotionalEndMean = endScores.Average();
            }

            float sessionDurMean = rSessions.Count > 0
                ? (float)rSessions.Average(s => s.session_duration_minutes ?? 0) : 0;

            int swDistinct = rSessions
                .Select(s => s.social_worker)
                .Where(sw => !string.IsNullOrEmpty(sw))
                .Distinct().Count();

            var allDates = new List<DateTime>();
            allDates.AddRange(rHealth.Where(h => h.record_date.HasValue)
                .Select(h => h.record_date!.Value.ToDateTime(TimeOnly.MinValue)));
            allDates.AddRange(rVisits.Where(v => v.visit_date.HasValue)
                .Select(v => v.visit_date!.Value.ToDateTime(TimeOnly.MinValue)));
            allDates.AddRange(rSessions.Where(s => s.session_date.HasValue)
                .Select(s => s.session_date!.Value.ToDateTime(TimeOnly.MinValue)));
            float monthsOfData = allDates.Count >= 2
                ? (float)((allDates.Max() - allDates.Min()).TotalDays / 30.44) : 0;

            rows.Add(new Dictionary<string, float>
            {
                ["capacity_girls"] = r.safehouse?.capacity_girls ?? 0,
                ["length_of_stay_months"] = lengthOfStay,
                ["progress_percent_mean"] = progressMean,
                ["general_health_score_mean"] = healthMean,
                ["nutrition_score_mean"] = nutritionMean,
                ["sleep_quality_score_mean"] = sleepMean,
                ["energy_level_score_mean"] = energyMean,
                ["bmi_latest"] = bmiLatest,
                ["medical_checkup_done_prop"] = medicalProp,
                ["dental_checkup_done_prop"] = dentalProp,
                ["psychological_checkup_done_prop"] = psychProp,
                ["incident_resolution_rate"] = incidentResRate,
                ["emotional_state_end_mean"] = emotionalEndMean,
                ["session_duration_mean"] = sessionDurMean,
                ["sw_distinct_count"] = swDistinct,
                ["months_of_data_available"] = monthsOfData,
            });

            metaList.Add((r.resident_id, r.case_control_no, r.internal_code,
                          r.safehouse?.name));
        }

        if (rows.Count == 0)
            return new ResidentRiskResultDto { predictions = new(), generated_at = DateTime.UtcNow };

        var probas = RunNumericInference(_models.ResidentRisk, rows);

        var result = new ResidentRiskResultDto { generated_at = DateTime.UtcNow };
        for (int i = 0; i < probas.Count; i++)
        {
            result.predictions.Add(new ResidentRiskPredictionDto
            {
                resident_id = metaList[i].id,
                case_control_no = metaList[i].ccn,
                internal_code = metaList[i].code,
                safehouse_name = metaList[i].sh,
                risk_score = probas[i],
                risk_tier = Tier(probas[i]),
            });
        }
        return result;
    }

    // =====================================================================
    //  SOCIAL MEDIA -- batch (all posts)
    // =====================================================================
    public async Task<SocialMediaResultDto> PredictSocialMediaAsync()
    {
        var posts = await _db.social_media_posts.ToListAsync();

        var rows = new List<Dictionary<string, float>>();
        var metaList = new List<(int id, string? platform, string? postType, string? topic)>();

        foreach (var p in posts)
        {
            rows.Add(EncodeSocialMediaFeatures(p));
            metaList.Add((p.post_id, p.platform, p.post_type, p.content_topic));
        }

        if (rows.Count == 0)
            return new SocialMediaResultDto { predictions = new(), generated_at = DateTime.UtcNow };

        var probas = RunNumericInference(_models.SocialMedia, rows);

        var result = new SocialMediaResultDto { generated_at = DateTime.UtcNow };
        for (int i = 0; i < probas.Count; i++)
        {
            result.predictions.Add(new SocialMediaPredictionDto
            {
                post_id = metaList[i].id,
                platform = metaList[i].platform,
                post_type = metaList[i].postType,
                content_topic = metaList[i].topic,
                conversion_probability = probas[i],
                conversion_tier = Tier(probas[i]),
            });
        }
        return result;
    }

    // =====================================================================
    //  SOCIAL MEDIA -- evaluate a single hypothetical post
    // =====================================================================
    public MlPredictionItem EvaluateSocialMediaPost(SocialMediaEvaluateRequest req)
    {
        var row = EncodeSocialMediaFeaturesFromRequest(req);
        var probas = RunNumericInference(_models.SocialMedia,
            new List<Dictionary<string, float>> { row });

        return new MlPredictionItem
        {
            score = probas[0],
            tier = Tier(probas[0]),
        };
    }

    // =====================================================================
    //  ONNX Inference Helpers
    // =====================================================================

    /// <summary>
    /// Run donor churn inference with mixed float + string inputs.
    /// Each column is a separate named input of shape [N, 1].
    /// </summary>
    private List<double> RunDonorChurnInference(
        List<Dictionary<string, float>> numericRows,
        List<Dictionary<string, string>> categoricalRows)
    {
        int n = numericRows.Count;
        var inputs = new List<NamedOnnxValue>();

        // Numeric columns
        foreach (var col in numericRows[0].Keys)
        {
            var data = new float[n];
            for (int i = 0; i < n; i++)
                data[i] = numericRows[i][col];
            var tensor = new DenseTensor<float>(data, new[] { n, 1 });
            inputs.Add(NamedOnnxValue.CreateFromTensor(col, tensor));
        }

        // Categorical columns (string tensors)
        foreach (var col in categoricalRows[0].Keys)
        {
            var data = new string[n];
            for (int i = 0; i < n; i++)
                data[i] = categoricalRows[i][col];
            var tensor = new DenseTensor<string>(data, new[] { n, 1 });
            inputs.Add(NamedOnnxValue.CreateFromTensor(col, tensor));
        }

        return ExtractProbabilities(_models.DonorChurn, inputs);
    }

    /// <summary>
    /// Run inference for all-numeric models (resident risk, social media).
    /// Each column is a separate named input of shape [N, 1].
    /// </summary>
    private static List<double> RunNumericInference(
        InferenceSession session,
        List<Dictionary<string, float>> rows)
    {
        int n = rows.Count;
        var inputs = new List<NamedOnnxValue>();

        foreach (var col in rows[0].Keys)
        {
            var data = new float[n];
            for (int i = 0; i < n; i++)
                data[i] = rows[i][col];
            var tensor = new DenseTensor<float>(data, new[] { n, 1 });
            inputs.Add(NamedOnnxValue.CreateFromTensor(col, tensor));
        }

        return ExtractProbabilities(session, inputs);
    }

    /// <summary>
    /// Runs the ONNX session and extracts class-1 probabilities from
    /// the probabilities output tensor (shape [N, 2]).
    /// </summary>
    private static List<double> ExtractProbabilities(
        InferenceSession session, List<NamedOnnxValue> inputs)
    {
        using var results = session.Run(inputs);

        // With zipmap=False, "probabilities" is a float tensor of shape [N, 2]
        var probOutput = results.First(r => r.Name == "probabilities");
        var tensor = probOutput.AsTensor<float>();

        var probas = new List<double>();
        int n = tensor.Dimensions[0];
        for (int i = 0; i < n; i++)
        {
            // Column 1 = probability of class 1
            probas.Add(Math.Round(tensor[i, 1], 4));
        }
        return probas;
    }

    // =====================================================================
    //  Social Media One-Hot Encoding
    // =====================================================================

    /// <summary>
    /// The social media model expects pre-encoded one-hot features.
    /// This replicates the pd.get_dummies(drop_first=True) encoding.
    /// </summary>
    private static Dictionary<string, float> EncodeSocialMediaFeatures(
        LuzDeVida.API.Models.social_media_post p)
    {
        return new Dictionary<string, float>
        {
            ["post_hour"] = p.post_hour ?? 12,
            ["caption_length"] = p.caption_length ?? 0,
            ["features_resident_story"] = (p.features_resident_story == true) ? 1f : 0f,
            ["is_boosted"] = (p.is_boosted == true) ? 1f : 0f,
            ["in_campaign"] = !string.IsNullOrEmpty(p.campaign_name) ? 1f : 0f,
            // One-hot: platform (reference = Facebook)
            ["platform_LinkedIn"] = (p.platform == "LinkedIn") ? 1f : 0f,
            // One-hot: post_type (reference = FundraisingAppeal)
            ["post_type_EducationalContent"] = (p.post_type == "EducationalContent") ? 1f : 0f,
            ["post_type_EventPromotion"] = (p.post_type == "EventPromotion") ? 1f : 0f,
            ["post_type_ImpactStory"] = (p.post_type == "ImpactStory") ? 1f : 0f,
            ["post_type_ThankYou"] = (p.post_type == "ThankYou") ? 1f : 0f,
            // One-hot: media_type (reference = Photo)
            ["media_type_Reel"] = (p.media_type == "Reel") ? 1f : 0f,
            ["media_type_Text"] = (p.media_type == "Text") ? 1f : 0f,
            // One-hot: sentiment_tone (reference = Celebratory)
            ["sentiment_tone_Emotional"] = (p.sentiment_tone == "Emotional") ? 1f : 0f,
            ["sentiment_tone_Informative"] = (p.sentiment_tone == "Informative") ? 1f : 0f,
            // One-hot: call_to_action_type (reference = DonateNow)
            ["call_to_action_type_None"] = (p.call_to_action_type == "None"
                || !p.has_call_to_action.GetValueOrDefault()) ? 1f : 0f,
        };
    }

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

    // =====================================================================
    //  Tier Helper
    // =====================================================================
    private static string Tier(double score) =>
        score >= 0.6 ? "High" : score >= 0.3 ? "Medium" : "Low";
}
