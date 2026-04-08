export interface AdminDashboardMetrics {
  active_residents_total: number
  residents_by_safehouse: Array<{
    safehouse_id: number
    safehouse_name: string
    active_resident_count: number
  }>
  recent_donations_total: number
  recent_donations_count: number
  recent_donations: Array<{
    donation_id: number
    donation_date: string
    amount: number
    donation_type: string
    currency_code: string
  }>
  upcoming_case_conferences_count: number
  upcoming_case_conferences: Array<{
    plan_id: number
    case_conference_date: string
    resident_id: number
    plan_category: string
    status: string
  }>
  progress_data: {
    avg_nutrition_score: number | null
    avg_sleep_score: number | null
    avg_energy_score: number | null
    avg_general_health_score: number | null
    health_records_count: number
    medical_checkups_completed: number
    psychological_checkups_completed: number
  }
  safehouses_total: number
  timestamp: string
}

const API_BASE_URL = 'http://localhost:5289/api'

export const fetchAdminDashboardMetrics = async (): Promise<AdminDashboardMetrics> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admindashboard/metrics`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const data: AdminDashboardMetrics = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching admin dashboard metrics:', error)
    throw error
  }
}
