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
        // Latest published snapshot — editorial copy only
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

        // All-time counts
        var girlsSupported = await _context.residents.CountAsync();
        var safehousesInNetwork = await _context.safehouses.CountAsync();
        var supportersAllTime = await _context.supporters.CountAsync();

        // Pull all metric rows in one query
        var allMetrics = await _context.safehouse_monthly_metrics
            .Where(m => m.month_start != null)
            .ToListAsync();

        // Pull all residents for active case calculation
        var allResidents = await _context.residents.ToListAsync();

        if (allMetrics.Count == 0)
        {
            return new PublicImpactDto(
                Story: story,
                Okr: new PublicImpactOkrDto("girls_supported_all_time", "Girls supported", girlsSupported,
                    "Total girls who have received care and shelter in our safehouses since founding."),
                Highlights: new PublicImpactHighlightsDto(safehousesInNetwork, supportersAllTime, 0),
                QuarterlyTrend: [],
                MetricsAsOf: DateOnly.FromDateTime(DateTime.UtcNow)
            );
        }

        var careTouchpointsAllTime = allMetrics.Sum(m => (m.process_recording_count ?? 0) + (m.home_visitation_count ?? 0));
        var metricsAsOf = allMetrics.Max(m => m.month_start!.Value);

        // Build all-time quarterly trend
        var firstMonth = allMetrics.Min(m => m.month_start!.Value);
        var qStart = QuarterStart(firstMonth);
        var lastQStart = QuarterStart(metricsAsOf);

        var quarterlyTrend = new List<PublicImpactQuarterlyTrendItemDto>();

        while (qStart <= lastQStart)
        {
            var qNext = qStart.AddMonths(3);
            var rows = allMetrics.Where(m => m.month_start >= qStart && m.month_start < qNext).ToList();

            // Active residents: Count residents with case_status="Active" during this quarter
            // (admitted by end of quarter, and not closed before start of quarter)
            var activeResidents = allResidents.Count(r => 
                r.case_status == "Active" &&
                r.date_enrolled != null &&
                r.date_enrolled <= qNext.AddDays(-1) &&
                (r.date_closed == null || r.date_closed >= qStart)
            );

            // Care counts: sum across all months and safehouses in the quarter
            var counseling = rows.Sum(r => r.process_recording_count ?? 0);
            var homeVisits = rows.Sum(r => r.home_visitation_count ?? 0);

            // Education progress: weighted average across all rows with data
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

            // Health score: weighted average across all rows with data
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

            var progressReportingCount = rows
                .Where(r => r.avg_education_progress.HasValue || r.avg_health_score.HasValue)
                .Select(r => r.safehouse_id)
                .Distinct()
                .Count();

            int quarter = (qStart.Month - 1) / 3 + 1;
            quarterlyTrend.Add(new PublicImpactQuarterlyTrendItemDto(
                Quarter: $"Q{quarter} {qStart.Year}",
                ActiveResidents: activeResidents,
                AvgEducationProgress: avgEdu,
                AvgHealthScore: avgHealth,
                CounselingSessions: counseling,
                HomeVisits: homeVisits,
                ProgressReportingCount: progressReportingCount
            ));

            qStart = qNext;
        }

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
                CareTouchpointsAllTime: careTouchpointsAllTime
            ),
            QuarterlyTrend: quarterlyTrend,
            MetricsAsOf: metricsAsOf
        );
    }

    private static DateOnly QuarterStart(DateOnly d)
    {
        int firstMonthOfQuarter = ((d.Month - 1) / 3) * 3 + 1;
        return new DateOnly(d.Year, firstMonthOfQuarter, 1);
    }
}
