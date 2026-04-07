using System;
using System.Collections.Generic;

namespace LuzDeVida.API.Models;

public partial class social_media_post
{
    public int post_id { get; set; }

    public string? platform { get; set; }

    public string? platform_post_id { get; set; }

    public string? post_url { get; set; }

    public DateTime? created_at { get; set; }

    public string? day_of_week { get; set; }

    public int? post_hour { get; set; }

    public string? post_type { get; set; }

    public string? media_type { get; set; }

    public string? caption { get; set; }

    public string? hashtags { get; set; }

    public int? num_hashtags { get; set; }

    public int? mentions_count { get; set; }

    public bool? has_call_to_action { get; set; }

    public string? call_to_action_type { get; set; }

    public string? content_topic { get; set; }

    public string? sentiment_tone { get; set; }

    public int? caption_length { get; set; }

    public bool? features_resident_story { get; set; }

    public string? campaign_name { get; set; }

    public bool? is_boosted { get; set; }

    public decimal? boost_budget_php { get; set; }

    public int? impressions { get; set; }

    public int? reach { get; set; }

    public int? likes { get; set; }

    public int? comments { get; set; }

    public int? shares { get; set; }

    public int? saves { get; set; }

    public int? click_throughs { get; set; }

    public int? video_views { get; set; }

    public decimal? engagement_rate { get; set; }

    public int? profile_visits { get; set; }

    public int? donation_referrals { get; set; }

    public decimal? estimated_donation_value_php { get; set; }

    public int? follower_count_at_post { get; set; }

    public int? watch_time_seconds { get; set; }

    public int? avg_view_duration_seconds { get; set; }

    public int? subscriber_count_at_post { get; set; }

    public int? forwards { get; set; }

    public virtual ICollection<donation> donations { get; set; } = new List<donation>();
}
