namespace LuzDeVida.API.Models.Dtos;

public record ApiResponseDto<T>(
    bool Success,
    T? Data,
    ApiErrorDto? Error,
    ApiMetaDto Meta
);

public record ApiErrorDto(
    string Code,
    string Message,
    IReadOnlyList<string> Details
);

public record ApiMetaDto(
    DateTimeOffset Timestamp
);
