const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:5289/api'
  : 'https://luzdevidabackend-aegdcxe9grhucsfm.francecentral-01.azurewebsites.net/api'

/* ── Analytics DTOs ─────────────────────────────────────────────────────────── */

export interface PlatformScorecard {
  platform: string
  post_count: number
  latest_follower_count: number
  avg_reach: number
  avg_engagement_rate: number
  total_donation_referrals: number
  total_donation_value_php: number
  conversion_rate: number
}

export interface HourlyDistribution {
  hour: number
  converted_count: number
  not_converted_count: number
  total_count: number
}

export interface ContentBreakdown {
  category: string
  post_count: number
  converted_count: number
  conversion_rate: number
  avg_engagement_rate: number
  total_donation_referrals: number
}

export interface ConversionFunnel {
  total_impressions: number
  total_reach: number
  total_engagement: number
  total_click_throughs: number
  total_donation_referrals: number
}

export interface BoostedSegment {
  post_count: number
  avg_engagement_rate: number
  avg_reach: number
  conversion_rate: number
  total_donation_referrals: number
  total_boost_spend_php: number
  total_donation_value_php: number
}

export interface BoostedVsOrganic {
  boosted: BoostedSegment
  organic: BoostedSegment
}

export interface TopPost {
  post_id: number
  platform: string | null
  post_type: string | null
  content_topic: string | null
  media_type: string | null
  created_at: string | null
  post_hour: number | null
  day_of_week: string | null
  engagement_rate: number
  impressions: number
  reach: number
  likes: number
  comments: number
  shares: number
  click_throughs: number
  donation_referrals: number
  estimated_donation_value_php: number
  is_boosted: boolean
  features_resident_story: boolean
}

export interface SocialMediaAnalytics {
  platform_scorecards: PlatformScorecard[]
  hourly_distribution: HourlyDistribution[]
  by_post_type: ContentBreakdown[]
  by_media_type: ContentBreakdown[]
  by_content_topic: ContentBreakdown[]
  by_sentiment_tone: ContentBreakdown[]
  by_day_of_week: ContentBreakdown[]
  funnel: ConversionFunnel
  boosted_vs_organic: BoostedVsOrganic
  top_posts: TopPost[]
  total_posts: number
  overall_conversion_rate: number
  generated_at: string
}

/* ── ML Evaluate DTOs ───────────────────────────────────────────────────────── */

export interface SocialMediaEvaluateRequest {
  platform: string
  post_type: string
  media_type: string
  content_topic: string
  sentiment_tone: string
  has_call_to_action: boolean
  call_to_action_type: string
  features_resident_story: boolean
  is_boosted: boolean
  boost_budget_php: number
  in_campaign: boolean
  post_hour: number
  caption_length: number
  day_of_week: string
  subscriber_count_at_post: number
}

export interface MlPredictionItem {
  score: number
  tier: string
}

/* ── Fetch functions ────────────────────────────────────────────────────────── */

export async function fetchSocialMediaAnalytics(): Promise<SocialMediaAnalytics> {
  const res = await fetch(`${API_BASE_URL}/social-media-analytics`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok)
    throw new Error((data as { message?: string }).message ?? 'Failed to load social media analytics.')
  return data as SocialMediaAnalytics
}

export async function evaluateSocialMediaPost(
  req: SocialMediaEvaluateRequest,
): Promise<MlPredictionItem> {
  const res = await fetch(`${API_BASE_URL}/ml/social-media/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok)
    throw new Error((data as { message?: string }).message ?? 'Failed to evaluate post.')
  // The ML endpoint wraps in ApiResponseDto
  return (data as { data: MlPredictionItem }).data
}
