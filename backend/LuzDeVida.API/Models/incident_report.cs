using System;
using System.Collections.Generic;

namespace LuzDeVida.API.Models;

public partial class incident_report
{
    public int incident_id { get; set; }

    public int resident_id { get; set; }

    public int safehouse_id { get; set; }

    public DateOnly? incident_date { get; set; }

    public string? incident_type { get; set; }

    public string? severity { get; set; }

    public string? description { get; set; }

    public string? response_taken { get; set; }

    public bool? resolved { get; set; }

    public DateOnly? resolution_date { get; set; }

    public string? reported_by { get; set; }

    public bool? follow_up_required { get; set; }

    public virtual resident resident { get; set; } = null!;

    public virtual safehouse safehouse { get; set; } = null!;
}
