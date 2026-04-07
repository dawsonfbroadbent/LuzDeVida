using System;
using System.Collections.Generic;

namespace LuzDeVida.API.Models;

public partial class partner
{
    public int partner_id { get; set; }

    public string partner_name { get; set; } = null!;

    public string? partner_type { get; set; }

    public string? role_type { get; set; }

    public string? contact_name { get; set; }

    public string? email { get; set; }

    public string? phone { get; set; }

    public string? region { get; set; }

    public string? status { get; set; }

    public DateOnly? start_date { get; set; }

    public DateOnly? end_date { get; set; }

    public string? notes { get; set; }

    public virtual ICollection<donation> donations { get; set; } = new List<donation>();

    public virtual ICollection<partner_assignment> partner_assignments { get; set; } = new List<partner_assignment>();
}
