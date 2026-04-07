using System;
using System.Collections.Generic;

namespace LuzDeVida.API.Models;

public partial class public_impact_snapshot
{
    public int snapshot_id { get; set; }

    public DateOnly? snapshot_date { get; set; }

    public string? headline { get; set; }

    public string? summary_text { get; set; }

    public string? metric_payload_json { get; set; }

    public bool? is_published { get; set; }

    public DateOnly? published_at { get; set; }
}
