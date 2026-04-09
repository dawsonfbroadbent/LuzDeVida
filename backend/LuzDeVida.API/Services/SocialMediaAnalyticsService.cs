using LuzDeVida.API.Data;
using LuzDeVida.API.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace LuzDeVida.API.Services;

public class SocialMediaAnalyticsService
{
    private readonly LuzDeVidaDbContext _context;

    public SocialMediaAnalyticsService(LuzDeVidaDbContext context)
    {
        _context = context;
    }

    public async Task<SocialMediaAnalyticsDto> GetAnalyticsAsync()
    {
        var posts = await _context.social_media_posts
            .Select(p => new
            {
                p.post_id,
                p.platform,
                p.post_type,
                p.media_type,
                p.content_topic,
                p.sentiment_tone,
                p.post_hour,
                p.day_of_week,
                p.caption_length,
                p.created_at,
                p.impressions,
                p.reach,
                p.likes,
                p.comments,
                p.shares,
                p.saves,
                p.click_throughs,
                p.engagement_rate,
                p.donation_referrals,
                p.estimated_donation_value_php,
                p.follower_count_at_post,
                p.is_boosted,
                p.boost_budget_php,
                p.features_resident_story,
                p.campaign_name,
                p.profile_visits,
            })
            .ToListAsync();

        var totalPosts = posts.Count;
        var convertedCount = posts.Count(p => (p.donation_referrals ?? 0) > 0);
        var overallConversionRate = totalPosts > 0 ? (double)convertedCount / totalPosts : 0;

        // ── Platform Scorecards ─────────────────────────────────────────────
        var platformScorecards = posts
            .Where(p => !string.IsNullOrEmpty(p.platform))
            .GroupBy(p => p.platform!)
            .Select(g =>
            {
                var count = g.Count();
                var converted = g.Count(p => (p.donation_referrals ?? 0) > 0);
                var latest = g.OrderByDescending(p => p.created_at).FirstOrDefault();
                return new PlatformScorecardDto
                {
                    platform = g.Key,
                    post_count = count,
                    latest_follower_count = latest?.follower_count_at_post ?? 0,
                    avg_reach = g.Average(p => (double)(p.reach ?? 0)),
                    avg_engagement_rate = g.Average(p => (double)(p.engagement_rate ?? 0)),
                    total_donation_referrals = g.Sum(p => p.donation_referrals ?? 0),
                    total_donation_value_php = g.Sum(p => p.estimated_donation_value_php ?? 0),
                    conversion_rate = count > 0 ? (double)converted / count : 0,
                };
            })
            .OrderByDescending(s => s.total_donation_referrals)
            .ToList();

        // ── Hourly Distribution ─────────────────────────────────────────────
        var hourlyGroups = posts
            .Where(p => p.post_hour.HasValue)
            .GroupBy(p => p.post_hour!.Value)
            .ToDictionary(g => g.Key, g => g.ToList());

        var hourlyDistribution = Enumerable.Range(0, 24).Select(h =>
        {
            var group = hourlyGroups.GetValueOrDefault(h);
            var conv = group?.Count(p => (p.donation_referrals ?? 0) > 0) ?? 0;
            var total = group?.Count ?? 0;
            return new HourlyDistributionDto
            {
                hour = h,
                converted_count = conv,
                not_converted_count = total - conv,
                total_count = total,
            };
        }).ToList();

        // ── Content Breakdowns ──────────────────────────────────────────────
        var byPostType = BuildBreakdown(posts, p => p.post_type);
        var byMediaType = BuildBreakdown(posts, p => p.media_type);
        var byContentTopic = BuildBreakdown(posts, p => p.content_topic);
        var bySentimentTone = BuildBreakdown(posts, p => p.sentiment_tone);

        var dayOrder = new[] { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" };
        var byDayOfWeek = BuildBreakdown(posts, p => p.day_of_week)
            .OrderBy(d => Array.IndexOf(dayOrder, d.category) is var idx && idx >= 0 ? idx : 99)
            .ToList();

        // ── Conversion Funnel ───────────────────────────────────────────────
        var funnel = new ConversionFunnelDto
        {
            total_impressions = posts.Sum(p => (long)(p.impressions ?? 0)),
            total_reach = posts.Sum(p => (long)(p.reach ?? 0)),
            total_engagement = posts.Sum(p =>
                (long)(p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0) + (p.saves ?? 0)),
            total_click_throughs = posts.Sum(p => (long)(p.click_throughs ?? 0)),
            total_donation_referrals = posts.Sum(p => p.donation_referrals ?? 0),
        };

        // ── Boosted vs Organic ──────────────────────────────────────────────
        var boostedPosts = posts.Where(p => p.is_boosted == true).ToList();
        var organicPosts = posts.Where(p => p.is_boosted != true).ToList();

        var boostedVsOrganic = new BoostedVsOrganicDto
        {
            boosted = BuildSegment(boostedPosts),
            organic = BuildSegment(organicPosts),
        };

        // ── Top Posts ───────────────────────────────────────────────────────
        var topPosts = posts.Select(p => new TopPostDto
        {
            post_id = p.post_id,
            platform = p.platform,
            post_type = p.post_type,
            content_topic = p.content_topic,
            media_type = p.media_type,
            created_at = p.created_at,
            post_hour = p.post_hour,
            day_of_week = p.day_of_week,
            engagement_rate = p.engagement_rate ?? 0,
            impressions = p.impressions ?? 0,
            reach = p.reach ?? 0,
            likes = p.likes ?? 0,
            comments = p.comments ?? 0,
            shares = p.shares ?? 0,
            click_throughs = p.click_throughs ?? 0,
            donation_referrals = p.donation_referrals ?? 0,
            estimated_donation_value_php = p.estimated_donation_value_php ?? 0,
            is_boosted = p.is_boosted ?? false,
            features_resident_story = p.features_resident_story ?? false,
        }).ToList();

        return new SocialMediaAnalyticsDto
        {
            platform_scorecards = platformScorecards,
            hourly_distribution = hourlyDistribution,
            by_post_type = byPostType,
            by_media_type = byMediaType,
            by_content_topic = byContentTopic,
            by_sentiment_tone = bySentimentTone,
            by_day_of_week = byDayOfWeek,
            funnel = funnel,
            boosted_vs_organic = boostedVsOrganic,
            top_posts = topPosts,
            total_posts = totalPosts,
            overall_conversion_rate = overallConversionRate,
            generated_at = DateTime.UtcNow,
        };
    }

    private static List<ContentBreakdownDto> BuildBreakdown<T>(
        IEnumerable<T> posts,
        Func<T, string?> categorySelector)
        where T : class
    {
        // We need access to donation_referrals and engagement_rate on the anonymous type.
        // Use dynamic dispatch since all callers pass the same anonymous type.
        return posts
            .Where(p => !string.IsNullOrEmpty(categorySelector(p)))
            .GroupBy(p => categorySelector(p)!)
            .Select(g =>
            {
                var items = g.Cast<dynamic>().ToList();
                var count = items.Count;
                var converted = items.Count(p => ((int?)p.donation_referrals ?? 0) > 0);
                return new ContentBreakdownDto
                {
                    category = g.Key,
                    post_count = count,
                    converted_count = converted,
                    conversion_rate = count > 0 ? (double)converted / count : 0,
                    avg_engagement_rate = items.Average(p => (double)((decimal?)p.engagement_rate ?? 0m)),
                    total_donation_referrals = items.Sum(p => (int)((int?)p.donation_referrals ?? 0)),
                };
            })
            .OrderByDescending(b => b.conversion_rate)
            .ToList();
    }

    private static BoostedSegmentDto BuildSegment(IEnumerable<dynamic> posts)
    {
        var list = posts.ToList();
        var count = list.Count;
        var converted = list.Count(p => ((int?)p.donation_referrals ?? 0) > 0);
        return new BoostedSegmentDto
        {
            post_count = count,
            avg_engagement_rate = count > 0 ? list.Average(p => (double)((decimal?)p.engagement_rate ?? 0m)) : 0,
            avg_reach = count > 0 ? list.Average(p => (double)((int?)p.reach ?? 0)) : 0,
            conversion_rate = count > 0 ? (double)converted / count : 0,
            total_donation_referrals = list.Sum(p => (int)((int?)p.donation_referrals ?? 0)),
            total_boost_spend_php = list.Sum(p => (decimal)((decimal?)p.boost_budget_php ?? 0m)),
            total_donation_value_php = list.Sum(p => (decimal)((decimal?)p.estimated_donation_value_php ?? 0m)),
        };
    }
}
