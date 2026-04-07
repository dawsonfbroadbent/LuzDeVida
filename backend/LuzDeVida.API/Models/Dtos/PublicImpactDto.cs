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
    int CareTouchpointsAllTime
);

public record PublicImpactQuarterlyTrendItemDto(
    string Quarter,
    int ActiveResidents,
    decimal? AvgEducationProgress,
    decimal? AvgHealthScore,
    int CounselingSessions,
    int HomeVisits,
    int ProgressReportingCount
);

public record PublicImpactDto(
    PublicImpactStoryDto Story,
    PublicImpactOkrDto Okr,
    PublicImpactHighlightsDto Highlights,
    IReadOnlyList<PublicImpactQuarterlyTrendItemDto> QuarterlyTrend,
    DateOnly MetricsAsOf
);
