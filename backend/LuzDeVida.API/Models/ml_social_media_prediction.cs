using System;

namespace LuzDeVida.API.Models;

public class ml_social_media_prediction
{
    public int post_id { get; set; }
    public string? platform { get; set; }
    public string? post_type { get; set; }
    public string? content_topic { get; set; }
    public double conversion_probability { get; set; }
    public string conversion_tier { get; set; } = "";
    public DateTime scored_at { get; set; }
}
