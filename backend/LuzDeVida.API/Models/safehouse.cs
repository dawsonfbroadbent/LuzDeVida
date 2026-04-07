using System;
using System.Collections.Generic;

namespace LuzDeVida.API.Models;

public partial class safehouse
{
    public int safehouse_id { get; set; }

    public string? safehouse_code { get; set; }

    public string name { get; set; } = null!;

    public string? region { get; set; }

    public string? city { get; set; }

    public string? province { get; set; }

    public string? country { get; set; }

    public DateOnly? open_date { get; set; }

    public string? status { get; set; }

    public int? capacity_girls { get; set; }

    public int? capacity_staff { get; set; }

    public int? current_occupancy { get; set; }

    public string? notes { get; set; }

    public virtual ICollection<donation_allocation> donation_allocations { get; set; } = new List<donation_allocation>();

    public virtual ICollection<incident_report> incident_reports { get; set; } = new List<incident_report>();

    public virtual ICollection<partner_assignment> partner_assignments { get; set; } = new List<partner_assignment>();

    public virtual ICollection<resident> residents { get; set; } = new List<resident>();

    public virtual ICollection<safehouse_monthly_metric> safehouse_monthly_metrics { get; set; } = new List<safehouse_monthly_metric>();
}
