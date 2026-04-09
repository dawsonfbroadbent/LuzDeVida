using System;

namespace LuzDeVida.API.Models;

public class ml_donor_churn_prediction
{
    public int supporter_id { get; set; }
    public string? display_name { get; set; }
    public string? email { get; set; }
    public double churn_risk_score { get; set; }
    public string risk_tier { get; set; } = "";
    public DateTime scored_at { get; set; }
}
