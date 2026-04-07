using LuzDeVida.API.Data;
using LuzDeVida.API.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace LuzDeVida.API.Services;

public class PublicImpactService
{
    private readonly LuzDeVidaDbContext _context;

    public PublicImpactService(LuzDeVidaDbContext context)
    {
        _context = context;
    }

    public async Task<PublicImpactDto> GetAsync()
    {
        // Latest published snapshot — editorial copy only; metric_payload_json unused in v1
        var snapshot = await _context.public_impact_snapshots
            .Where(s => s.is_published == true)
            .OrderByDescending(s => s.published_at)
            .ThenByDescending(s => s.snapshot_id)
            .FirstOrDefaultAsync();

        var story = new PublicImpactStoryDto(
            Headline: snapshot?.headline,
            SummaryText: snapshot?.summary_text,
            SnapshotDate: snapshot?.snapshot_date,
            StoryPublishedAt: snapshot?.published_at
        );

        // All-time counts (no identifiers exposed)
        var girlsSupported = await _context.residents.CountAsync();
        var safehousesInNetwork = await _context.safehouses.CountAsync();
        var supportersAllTime = await _context.supporters.CountAsync();

        // Trailing 12-month window anchored to the latest available metric month
        var latestMonth = await _context.safehouse_monthly_metrics
            .MaxAsync(m => m.month_start);

        DateOnly windowEnd;
        DateOnly windowStart;

        if (latestMonth.HasValue)
        {
            windowEnd = latestMonth.Value;
            windowStart = windowEnd.AddMonths(-11);
        }
        else
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            windowEnd = new DateOnly(today.Year, today.Month, 1);
            windowStart = windowEnd.AddMonths(-11);
        }

        var rawMetrics = await _context.safehouse_monthly_metrics
            .Where(m => m.month_start >= windowStart && m.month_start <= windowEnd)
            .ToListAsync();

        var monthlyTrend = new List<PublicImpactMonthlyTrendItemDto>(12);
        var careTouchpoints = 0;

        for (var i = 0; i < 12; i++)
        {
            var monthDate = windowStart.AddMonths(i);
            var rows = rawMetrics.Where(m => m.month_start == monthDate).ToList();

            var activeResidents = rows.Sum(r => r.active_residents ?? 0);
            var counseling = rows.Sum(r => r.process_recording_count ?? 0);
            var homeVisits = rows.Sum(r => r.home_visitation_count ?? 0);
            careTouchpoints += counseling + homeVisits;

            // Weighted average by active_residents; fallback to simple average when weight is zero
            decimal? avgEdu = null;
            var eduRows = rows.Where(r => r.avg_education_progress.HasValue).ToList();
            if (eduRows.Count > 0)
            {
                var totalWeight = eduRows.Sum(r => r.active_residents ?? 1);
                avgEdu = totalWeight > 0
                    ? eduRows.Sum(r => r.avg_education_progress!.Value * (r.active_residents ?? 1)) / totalWeight
                    : eduRows.Average(r => r.avg_education_progress!.Value);
                avgEdu = Math.Round(avgEdu.Value, 1);
            }

            decimal? avgHealth = null;
            var healthRows = rows.Where(r => r.avg_health_score.HasValue).ToList();
            if (healthRows.Count > 0)
            {
                var totalWeight = healthRows.Sum(r => r.active_residents ?? 1);
                avgHealth = totalWeight > 0
                    ? healthRows.Sum(r => r.avg_health_score!.Value * (r.active_residents ?? 1)) / totalWeight
                    : healthRows.Average(r => r.avg_health_score!.Value);
                avgHealth = Math.Round(avgHealth.Value, 1);
            }

            monthlyTrend.Add(new PublicImpactMonthlyTrendItemDto(
                Month: monthDate.ToString("MMM yyyy"),
                ActiveResidents: activeResidents,
                AvgEducationProgress: avgEdu,
                AvgHealthScore: avgHealth,
                CounselingSessions: counseling,
                HomeVisits: homeVisits
            ));
        }

        var metricsAsOf = latestMonth ?? DateOnly.FromDateTime(DateTime.UtcNow);

        return new PublicImpactDto(
            Story: story,
            Okr: new PublicImpactOkrDto(
                Key: "girls_supported_all_time",
                Label: "Girls supported",
                Value: girlsSupported,
                Rationale: "Total girls who have received care and shelter in our safehouses since founding."
            ),
            Highlights: new PublicImpactHighlightsDto(
                SafehousesInNetwork: safehousesInNetwork,
                SupportersAllTime: supportersAllTime,
                CareTouchpointsLast12Months: careTouchpoints
            ),
            TrendWindow: new PublicImpactTrendWindowDto(
                From: windowStart,
                To: windowEnd,
                Months: 12
            ),
            MonthlyTrend: monthlyTrend,
            MetricsAsOf: metricsAsOf
        );
    }
}
