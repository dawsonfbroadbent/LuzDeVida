export interface PublicImpactStory {
  headline: string | null
  summaryText: string | null
  snapshotDate: string | null
  storyPublishedAt: string | null
}

export interface PublicImpactOkr {
  key: string
  label: string
  value: number
  rationale: string
}

export interface PublicImpactHighlights {
  safehousesInNetwork: number
  supportersAllTime: number
  careTouchpointsLast12Months: number
}

export interface PublicImpactTrendWindow {
  from: string
  to: string
  months: number
}

export interface PublicImpactMonthlyTrendItem {
  month: string
  activeResidents: number
  avgEducationProgress: number | null
  avgHealthScore: number | null
  counselingSessions: number
  homeVisits: number
}

export interface PublicImpactData {
  story: PublicImpactStory
  okr: PublicImpactOkr
  highlights: PublicImpactHighlights
  trendWindow: PublicImpactTrendWindow
  monthlyTrend: PublicImpactMonthlyTrendItem[]
  metricsAsOf: string
}

interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: { code: string; message: string; details: string[] } | null
  meta: { timestamp: string }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export async function fetchPublicImpact(): Promise<PublicImpactData> {
  const res = await fetch(`${BASE_URL}/api/public-impact`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json: ApiResponse<PublicImpactData> = await res.json()
  if (!json.success || !json.data) throw new Error(json.error?.message ?? 'Unknown error')
  return json.data
}
