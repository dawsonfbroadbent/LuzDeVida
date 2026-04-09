namespace LuzDeVida.API.Models.Dtos;

public class SocialMediaAnalyticsDto
{
    public List<PlatformScorecardDto> platform_scorecards { get; set; } = new();
    public List<HourlyDistributionDto> hourly_distribution { get; set; } = new();
    public List<ContentBreakdownDto> by_post_type { get; set; } = new();
    public List<ContentBreakdownDto> by_media_type { get; set; } = new();
    public List<ContentBreakdownDto> by_content_topic { get; set; } = new();
    public List<ContentBreakdownDto> by_sentiment_tone { get; set; } = new();
    public List<ContentBreakdownDto> by_day_of_week { get; set; } = new();
    public ConversionFunnelDto funnel { get; set; } = new();
    public BoostedVsOrganicDto boosted_vs_organic { get; set; } = new();
    public List<TopPostDto> top_posts { get; set; } = new();
    public int total_posts { get; set; }
    public double overall_conversion_rate { get; set; }
    public DateTime generated_at { get; set; }
}

public class PlatformScorecardDto
{
    public string platform { get; set; } = "";
    public int post_count { get; set; }
    public int latest_follower_count { get; set; }
    public double avg_reach { get; set; }
    public double avg_engagement_rate { get; set; }
    public int total_donation_referrals { get; set; }
    public decimal total_donation_value_php { get; set; }
    public double conversion_rate { get; set; }
}

public class HourlyDistributionDto
{
    public int hour { get; set; }
    public int converted_count { get; set; }
    public int not_converted_count { get; set; }
    public int total_count { get; set; }
}

public class ContentBreakdownDto
{
    public string category { get; set; } = "";
    public int post_count { get; set; }
    public int converted_count { get; set; }
    public double conversion_rate { get; set; }
    public double avg_engagement_rate { get; set; }
    public int total_donation_referrals { get; set; }
}

public class ConversionFunnelDto
{
    public long total_impressions { get; set; }
    public long total_reach { get; set; }
    public long total_engagement { get; set; }
    public long total_click_throughs { get; set; }
    public int total_donation_referrals { get; set; }
}

public class BoostedVsOrganicDto
{
    public BoostedSegmentDto boosted { get; set; } = new();
    public BoostedSegmentDto organic { get; set; } = new();
}

public class BoostedSegmentDto
{
    public int post_count { get; set; }
    public double avg_engagement_rate { get; set; }
    public double avg_reach { get; set; }
    public double conversion_rate { get; set; }
    public int total_donation_referrals { get; set; }
    public decimal total_boost_spend_php { get; set; }
    public decimal total_donation_value_php { get; set; }
}

public class TopPostDto
{
    public int post_id { get; set; }
    public string? platform { get; set; }
    public string? post_type { get; set; }
    public string? content_topic { get; set; }
    public string? media_type { get; set; }
    public DateTime? created_at { get; set; }
    public int? post_hour { get; set; }
    public string? day_of_week { get; set; }
    public decimal engagement_rate { get; set; }
    public int impressions { get; set; }
    public int reach { get; set; }
    public int likes { get; set; }
    public int comments { get; set; }
    public int shares { get; set; }
    public int click_throughs { get; set; }
    public int donation_referrals { get; set; }
    public decimal estimated_donation_value_php { get; set; }
    public bool is_boosted { get; set; }
    public bool features_resident_story { get; set; }
}
