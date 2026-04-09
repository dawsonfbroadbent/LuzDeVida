namespace LuzDeVida.API.Models.Dtos;

// ── Shared ──────────────────────────────────────────────────────────────────

public class MlPredictionItem
{
    public double score { get; set; }
    public string tier { get; set; } = "";
}

public class MlPredictionResponse
{
    public List<MlPredictionItem> predictions { get; set; } = new();
}

// ── Donor Churn ─────────────────────────────────────────────────────────────

public class DonorChurnPredictionDto
{
    public int supporter_id { get; set; }
    public string? display_name { get; set; }
    public string? email { get; set; }
    public double churn_risk_score { get; set; }
    public string risk_tier { get; set; } = "";
}

public class DonorChurnResultDto
{
    public List<DonorChurnPredictionDto> predictions { get; set; } = new();
    public DateTime generated_at { get; set; }
}

// ── Resident Risk ───────────────────────────────────────────────────────────

public class ResidentRiskPredictionDto
{
    public int resident_id { get; set; }
    public string? case_control_no { get; set; }
    public string? internal_code { get; set; }
    public string? safehouse_name { get; set; }
    public double risk_score { get; set; }
    public int rank_global { get; set; }
    public int rank_in_safehouse { get; set; }
    public int total_residents { get; set; }
    public int total_in_safehouse { get; set; }
    public string risk_tier { get; set; } = "";
}

public class ResidentRiskResultDto
{
    public List<ResidentRiskPredictionDto> predictions { get; set; } = new();
    public DateTime generated_at { get; set; }
}

// ── Social Media ────────────────────────────────────────────────────────────

public class SocialMediaPredictionDto
{
    public int post_id { get; set; }
    public string? platform { get; set; }
    public string? post_type { get; set; }
    public string? content_topic { get; set; }
    public double conversion_probability { get; set; }
    public string conversion_tier { get; set; } = "";
}

public class SocialMediaResultDto
{
    public List<SocialMediaPredictionDto> predictions { get; set; } = new();
    public DateTime generated_at { get; set; }
}

// ── Evaluate a single hypothetical post (user fills a form) ─────────────────

public class SocialMediaEvaluateRequest
{
    public string platform { get; set; } = "";
    public string post_type { get; set; } = "";
    public string media_type { get; set; } = "";
    public string content_topic { get; set; } = "";
    public string sentiment_tone { get; set; } = "";
    public bool has_call_to_action { get; set; }
    public string call_to_action_type { get; set; } = "None";
    public bool features_resident_story { get; set; }
    public bool is_boosted { get; set; }
    public decimal boost_budget_php { get; set; }
    public bool in_campaign { get; set; }
    public int post_hour { get; set; }
    public int caption_length { get; set; }
    public string day_of_week { get; set; } = "";
    public int subscriber_count_at_post { get; set; }
}
