using System;
using System.Collections.Generic;

namespace LuzDeVida.API.Models;

public partial class supporter
{
    public int supporter_id { get; set; }

    public string? supporter_type { get; set; }

    public string? display_name { get; set; }

    public string? organization_name { get; set; }

    public string? first_name { get; set; }

    public string? last_name { get; set; }

    public string? relationship_type { get; set; }

    public string? region { get; set; }

    public string? country { get; set; }

    public string? email { get; set; }

    public string? phone { get; set; }

    public string? status { get; set; }

    public DateOnly? first_donation_date { get; set; }

    public string? acquisition_channel { get; set; }

    public DateTime? created_at { get; set; }

    public virtual ICollection<donation> donations { get; set; } = new List<donation>();
}
