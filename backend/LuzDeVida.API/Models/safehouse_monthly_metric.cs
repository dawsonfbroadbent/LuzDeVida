using System;
using System.Collections.Generic;

namespace LuzDeVida.API.Models;

public partial class safehouse_monthly_metric
{
    public int metric_id { get; set; }

    public int safehouse_id { get; set; }

    public DateOnly? month_start { get; set; }

    public DateOnly? month_end { get; set; }

    public int? active_residents { get; set; }

    public decimal? avg_education_progress { get; set; }

    public decimal? avg_health_score { get; set; }

    public int? process_recording_count { get; set; }

    public int? home_visitation_count { get; set; }

    public int? incident_count { get; set; }

    public string? notes { get; set; }

    public virtual safehouse safehouse { get; set; } = null!;
}
