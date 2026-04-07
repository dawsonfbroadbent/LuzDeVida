using System;
using System.Collections.Generic;

namespace LuzDeVida.API.Models;

public partial class education_record
{
    public int education_record_id { get; set; }

    public int resident_id { get; set; }

    public DateOnly? record_date { get; set; }

    public string? enrollment_status { get; set; }

    public string? school_name { get; set; }

    public string? education_level { get; set; }

    public decimal? attendance_rate { get; set; }

    public decimal? progress_percent { get; set; }

    public string? completion_status { get; set; }

    public string? notes { get; set; }

    public virtual resident resident { get; set; } = null!;
}
