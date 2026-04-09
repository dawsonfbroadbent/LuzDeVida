using System;

namespace LuzDeVida.API.Models;

public class ml_resident_risk_prediction
{
    public int resident_id { get; set; }
    public string? case_control_no { get; set; }
    public string? internal_code { get; set; }
    public string? safehouse_name { get; set; }
    public double risk_score { get; set; }
    public string risk_tier { get; set; } = "";
    public DateTime scored_at { get; set; }
}
