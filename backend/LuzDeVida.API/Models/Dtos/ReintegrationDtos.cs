namespace LuzDeVida.API.Models.Dtos;

public class ReintegrationOKRDto
{
    public int total_girls_admitted_two_years { get; set; }
    public int girls_reintegrated { get; set; }
    public decimal reintegration_percent { get; set; }
    public string okr_status { get; set; } = ""; // "On Track", "At Risk", "Behind"
    public string status_color { get; set; } = ""; // CSS color or var
}
