namespace LuzDeVida.API.Models.Dtos;

public record PublicImpactStoryDto(
    string? Headline,
    string? SummaryText,
    DateOnly? SnapshotDate,
    DateOnly? StoryPublishedAt
);

public record PublicImpactOkrDto(
    string Key,
    string Label,
    int Value,
    string Rationale
);

public record PublicImpactHighlightsDto(
    int SafehousesInNetwork,
    int SupportersAllTime,
    int CareTouchpointsLast12Months
);

public record PublicImpactTrendWindowDto(
    DateOnly From,
    DateOnly To,
    int Months
);

public record PublicImpactMonthlyTrendItemDto(
    string Month,
    int ActiveResidents,
    decimal? AvgEducationProgress,
    decimal? AvgHealthScore,
    int CounselingSessions,
    int HomeVisits
);

public record PublicImpactDto(
    PublicImpactStoryDto Story,
    PublicImpactOkrDto Okr,
    PublicImpactHighlightsDto Highlights,
    PublicImpactTrendWindowDto TrendWindow,
    IReadOnlyList<PublicImpactMonthlyTrendItemDto> MonthlyTrend,
    DateOnly MetricsAsOf
);
