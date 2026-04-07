using System;
using System.Collections.Generic;

namespace LuzDeVida.API.Models;

public partial class resident
{
    public int resident_id { get; set; }

    public string? case_control_no { get; set; }

    public string? internal_code { get; set; }

    public int? safehouse_id { get; set; }

    public string? case_status { get; set; }

    public string? sex { get; set; }

    public DateOnly? date_of_birth { get; set; }

    public string? birth_status { get; set; }

    public string? place_of_birth { get; set; }

    public string? religion { get; set; }

    public string? case_category { get; set; }

    public bool? sub_cat_orphaned { get; set; }

    public bool? sub_cat_trafficked { get; set; }

    public bool? sub_cat_child_labor { get; set; }

    public bool? sub_cat_physical_abuse { get; set; }

    public bool? sub_cat_sexual_abuse { get; set; }

    public bool? sub_cat_osaec { get; set; }

    public bool? sub_cat_cicl { get; set; }

    public bool? sub_cat_at_risk { get; set; }

    public bool? sub_cat_street_child { get; set; }

    public bool? sub_cat_child_with_hiv { get; set; }

    public bool? is_pwd { get; set; }

    public string? pwd_type { get; set; }

    public bool? has_special_needs { get; set; }

    public string? special_needs_diagnosis { get; set; }

    public bool? family_is_4ps { get; set; }

    public bool? family_solo_parent { get; set; }

    public bool? family_indigenous { get; set; }

    public bool? family_parent_pwd { get; set; }

    public bool? family_informal_settler { get; set; }

    public DateOnly? date_of_admission { get; set; }

    public string? age_upon_admission { get; set; }

    public string? present_age { get; set; }

    public string? length_of_stay { get; set; }

    public string? referral_source { get; set; }

    public string? referring_agency_person { get; set; }

    public DateOnly? date_colb_registered { get; set; }

    public DateOnly? date_colb_obtained { get; set; }

    public string? assigned_social_worker { get; set; }

    public string? initial_case_assessment { get; set; }

    public DateOnly? date_case_study_prepared { get; set; }

    public string? reintegration_type { get; set; }

    public string? reintegration_status { get; set; }

    public string? initial_risk_level { get; set; }

    public string? current_risk_level { get; set; }

    public DateOnly? date_enrolled { get; set; }

    public DateOnly? date_closed { get; set; }

    public DateTime? created_at { get; set; }

    public string? notes_restricted { get; set; }

    public virtual ICollection<education_record> education_records { get; set; } = new List<education_record>();

    public virtual ICollection<health_wellbeing_record> health_wellbeing_records { get; set; } = new List<health_wellbeing_record>();

    public virtual ICollection<home_visitation> home_visitations { get; set; } = new List<home_visitation>();

    public virtual ICollection<incident_report> incident_reports { get; set; } = new List<incident_report>();

    public virtual ICollection<intervention_plan> intervention_plans { get; set; } = new List<intervention_plan>();

    public virtual ICollection<process_recording> process_recordings { get; set; } = new List<process_recording>();

    public virtual safehouse? safehouse { get; set; }
}
