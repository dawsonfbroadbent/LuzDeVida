namespace LuzDeVida.API.Models.Dtos;

public class CreateDonationDto
{
    public decimal Amount { get; set; }
    public bool IsRecurring { get; set; }
    public string? CampaignName { get; set; }
    public string? Notes { get; set; }
}
