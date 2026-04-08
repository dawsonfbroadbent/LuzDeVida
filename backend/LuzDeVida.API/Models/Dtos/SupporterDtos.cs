namespace LuzDeVida.API.Models.Dtos;

public class SupporterStatsDto
{
    public int TotalSupporters { get; set; }
    public int ActiveSupporters { get; set; }
    public decimal TotalMonetaryDonated { get; set; }
    public int RecurringDonorsCount { get; set; }
    public int InKindDonorsCount { get; set; }
    public decimal AvgDonation { get; set; }
}

public class SupporterListItemDto
{
    public int SupporterId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string? SupporterType { get; set; }
    public string? Status { get; set; }
    public string? Region { get; set; }
    public decimal TotalGiven { get; set; }
    public DateOnly? LastDonationDate { get; set; }
    public List<string> ContributionTypes { get; set; } = new();
}

public class AllocationDto
{
    public int AllocationId { get; set; }
    public int SafehouseId { get; set; }
    public string? ProgramArea { get; set; }
    public decimal? AmountAllocated { get; set; }
    public DateOnly? AllocationDate { get; set; }
    public string? AllocationNotes { get; set; }
}

public class InKindItemDto
{
    public int ItemId { get; set; }
    public string? ItemName { get; set; }
    public string? ItemCategory { get; set; }
    public int? Quantity { get; set; }
    public string? UnitOfMeasure { get; set; }
    public decimal? EstimatedUnitValue { get; set; }
    public string? IntendedUse { get; set; }
    public string? ReceivedCondition { get; set; }
}

public class DonationDetailDto
{
    public int DonationId { get; set; }
    public string? DonationType { get; set; }
    public DateOnly? DonationDate { get; set; }
    public string? ChannelSource { get; set; }
    public string? CurrencyCode { get; set; }
    public decimal? Amount { get; set; }
    public decimal? EstimatedValue { get; set; }
    public string? ImpactUnit { get; set; }
    public bool? IsRecurring { get; set; }
    public string? CampaignName { get; set; }
    public string? Notes { get; set; }
    public List<AllocationDto> Allocations { get; set; } = new();
    public List<InKindItemDto> InKindItems { get; set; } = new();
}

public class SupporterDetailDto
{
    public int SupporterId { get; set; }
    public string? SupporterType { get; set; }
    public string? DisplayName { get; set; }
    public string? OrganizationName { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? RelationshipType { get; set; }
    public string? Region { get; set; }
    public string? Country { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Status { get; set; }
    public DateOnly? FirstDonationDate { get; set; }
    public string? AcquisitionChannel { get; set; }
    public DateTime? CreatedAt { get; set; }
    public List<DonationDetailDto> Donations { get; set; } = new();
}

public class SupporterPagedResultDto
{
    public List<SupporterListItemDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}

public class CreateSupporterDto
{
    public string? SupporterType { get; set; }
    public string? DisplayName { get; set; }
    public string? OrganizationName { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? RelationshipType { get; set; }
    public string? Region { get; set; }
    public string? Country { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Status { get; set; }
    public string? AcquisitionChannel { get; set; }
}

public class UpdateSupporterDto
{
    public string? SupporterType { get; set; }
    public string? DisplayName { get; set; }
    public string? OrganizationName { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? RelationshipType { get; set; }
    public string? Region { get; set; }
    public string? Country { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Status { get; set; }
    public string? AcquisitionChannel { get; set; }
}
