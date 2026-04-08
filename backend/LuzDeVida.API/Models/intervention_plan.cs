using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace LuzDeVida.API.Models;

public partial class intervention_plan
{
    public int plan_id { get; set; }

    public int resident_id { get; set; }

    public string? plan_category { get; set; }

    public string? plan_description { get; set; }

    public string? services_provided { get; set; }

    public decimal? target_value { get; set; }

    public DateOnly? target_date { get; set; }

    public string? status { get; set; }

    public DateOnly? case_conference_date { get; set; }

    public DateTime? created_at { get; set; }

    public DateTime? updated_at { get; set; }

    [JsonIgnore]
    public virtual resident? resident { get; set; }
}
