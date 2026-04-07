using System;
using System.Collections.Generic;

namespace LuzDeVida.API.Models;

public partial class process_recording
{
    public int recording_id { get; set; }

    public int resident_id { get; set; }

    public DateOnly? session_date { get; set; }

    public string? social_worker { get; set; }

    public string? session_type { get; set; }

    public int? session_duration_minutes { get; set; }

    public string? emotional_state_observed { get; set; }

    public string? emotional_state_end { get; set; }

    public string? session_narrative { get; set; }

    public string? interventions_applied { get; set; }

    public string? follow_up_actions { get; set; }

    public bool? progress_noted { get; set; }

    public bool? concerns_flagged { get; set; }

    public bool? referral_made { get; set; }

    public string? notes_restricted { get; set; }

    public virtual resident resident { get; set; } = null!;
}
