import { apiUrl, authenticatedFetch } from './apiConfig'

// ── Resident Risk ──────────────────────────────────────────────────────────

export interface ResidentRiskPrediction {
  resident_id: number
  case_control_no: string | null
  internal_code: string | null
  safehouse_name: string | null
  risk_score: number
  rank_global: number
  rank_in_safehouse: number
  total_residents: number
  total_in_safehouse: number
  risk_tier: string
}

interface ResidentRiskResult {
  predictions: ResidentRiskPrediction[]
  generated_at: string
}

// ── Donor Churn ────────────────────────────────────────────────────────────

export interface DonorChurnPrediction {
  supporter_id: number
  display_name: string | null
  email: string | null
  churn_risk_score: number
  risk_tier: string
}

interface DonorChurnResult {
  predictions: DonorChurnPrediction[]
  generated_at: string
}

// ── Fetch functions ────────────────────────────────────────────────────────

export async function fetchResidentRiskPredictions(): Promise<ResidentRiskPrediction[]> {
  const res = await authenticatedFetch(apiUrl('/api/ml/resident-risk'))
  if (!res.ok) throw new Error('Failed to fetch resident risk predictions')
  const json = await res.json()
  return (json as { data: ResidentRiskResult }).data.predictions
}

export async function fetchDonorChurnPredictions(): Promise<DonorChurnPrediction[]> {
  const res = await authenticatedFetch(apiUrl('/api/ml/donor-churn'))
  if (!res.ok) throw new Error('Failed to fetch donor churn predictions')
  const json = await res.json()
  return (json as { data: DonorChurnResult }).data.predictions
}
