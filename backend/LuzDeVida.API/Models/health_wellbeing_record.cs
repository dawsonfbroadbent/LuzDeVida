using System;
using System.Collections.Generic;

namespace LuzDeVida.API.Models;

public partial class health_wellbeing_record
{
    public int health_record_id { get; set; }

    public int resident_id { get; set; }

    public DateOnly? record_date { get; set; }

    public decimal? weight_kg { get; set; }

    public decimal? height_cm { get; set; }

    public decimal? bmi { get; set; }

    public decimal? nutrition_score { get; set; }

    public decimal? sleep_score { get; set; }

    public decimal? energy_score { get; set; }

    public decimal? general_health_score { get; set; }

    public bool? medical_checkup_done { get; set; }

    public bool? dental_checkup_done { get; set; }

    public bool? psychological_checkup_done { get; set; }

    public string? medical_notes_restricted { get; set; }

    public virtual resident resident { get; set; } = null!;
}
