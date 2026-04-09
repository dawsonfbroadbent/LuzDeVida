const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:5289/api'
  : 'https://luzdevidabackend-aegdcxe9grhucsfm.francecentral-01.azurewebsites.net/api'

export interface ReportsDonationSummary {
  total_monetary: number
  monetary_count: number
  total_in_kind_estimated: number
  in_kind_count: number
  unique_donor_count: number
  recurring_donor_count: number
}

export interface ReportsMonthlyDonation {
  month_label: string
  month_key: string
  monetary_total: number
  monetary_count: number
  in_kind_total: number
  in_kind_count: number
}

export interface ReportsQuarterlyOutcome {
  quarter: string
  active_residents: number
  avg_education_progress: number | null
  avg_attendance_rate: number | null
  avg_health_score: number | null
  avg_nutrition_score: number | null
  education_record_count: number
  health_record_count: number
}

export interface ReportsSafehouseComparison {
  safehouse_id: number
  safehouse_name: string
  safehouse_code: string | null
  region: string | null
  active_residents: number
  capacity: number | null
  occupancy_rate: number
  avg_education_progress: number | null
  avg_health_score: number | null
  process_recording_count: number
  home_visitation_count: number
  incident_count: number
  intervention_plans_active: number
  intervention_plans_completed: number
}

export interface ReintegrationByType {
  reintegration_type: string
  count: number
  rate: number
}

export interface ReportsReintegration {
  total_closed: number
  total_reintegrated: number
  reintegration_rate: number
  by_type: ReintegrationByType[]
  avg_days_to_close: number
}

export interface ReportsAar {
  total_residents_served: number
  new_admissions_in_year: number
  closed_cases_in_year: number
  active_residents_end_of_year: number
  medical_checkups_done: number
  dental_checkups_done: number
  psychological_checkups_done: number
  total_health_records: number
  students_enrolled: number
  students_completed: number
  avg_attendance_rate: number
  counseling_sessions_total: number
  total_session_minutes: number
  sessions_with_progress_noted: number
  sessions_with_concerns_flagged: number
  home_visitations_total: number
  home_visitations_with_safety_concerns: number
  incidents_total: number
  incidents_resolved: number
  total_monetary_received: number
  total_in_kind_estimated: number
}

export interface ReportsOverview {
  year: number
  donation_summary: ReportsDonationSummary
  donation_trend: ReportsMonthlyDonation[]
  quarterly_outcomes: ReportsQuarterlyOutcome[]
  safehouse_comparisons: ReportsSafehouseComparison[]
  reintegration: ReportsReintegration
  aar: ReportsAar
  generated_at: string
}

export async function fetchReportsOverview(year: number): Promise<ReportsOverview> {
  const res = await fetch(`${API_BASE_URL}/reports/overview?year=${year}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
