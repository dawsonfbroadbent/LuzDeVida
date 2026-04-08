using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace LuzDeVida.API.Models;

public partial class home_visitation
{
    public int visitation_id { get; set; }

    public int resident_id { get; set; }

    public DateOnly? visit_date { get; set; }

    public string? social_worker { get; set; }

    public string? visit_type { get; set; }

    public string? location_visited { get; set; }

    public string? family_members_present { get; set; }

    public string? purpose { get; set; }

    public string? observations { get; set; }

    public string? family_cooperation_level { get; set; }

    public bool? safety_concerns_noted { get; set; }

    public bool? follow_up_needed { get; set; }

    public string? follow_up_notes { get; set; }

    public string? visit_outcome { get; set; }

    [JsonIgnore]
    public virtual resident? resident { get; set; }
}
