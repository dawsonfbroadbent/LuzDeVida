import { useEffect, useState } from 'react'
import {
  fetchSocialMediaAnalytics,
  evaluateSocialMediaPost,
  type SocialMediaAnalytics,
  type ContentBreakdown,
  type HourlyDistribution,
  type SocialMediaEvaluateRequest,
  type MlPredictionItem,
} from '../api/SocialMediaAPI'
import '../styles/SocialMediaPerformance.css'

/* ═══════════════════════════════════════════════════════════════════════════
   SVG Chart Components
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── DensityChart — post-hour converted vs not-converted distribution ──── */

interface DensityChartProps {
  data: HourlyDistribution[]
}

function DensityChart({ data }: DensityChartProps) {
  const W = 600, H = 240
  const PAD = { top: 20, right: 20, bottom: 50, left: 56 }
  const iW = W - PAD.left - PAD.right
  const iH = H - PAD.top - PAD.bottom

  const totalConverted = data.reduce((s, d) => s + d.converted_count, 0)
  const totalNot = data.reduce((s, d) => s + d.not_converted_count, 0)

  const densityData = data.map(d => ({
    hour: d.hour,
    conv: totalConverted > 0 ? d.converted_count / totalConverted : 0,
    notConv: totalNot > 0 ? d.not_converted_count / totalNot : 0,
  }))

  const maxD = Math.max(...densityData.map(d => Math.max(d.conv, d.notConv)), 0.01)
  const barGroupW = iW / 24
  const barW = barGroupW * 0.38

  const hourLabel = (h: number) => {
    if (h === 0) return '12 AM'
    if (h < 12) return `${h} AM`
    if (h === 12) return '12 PM'
    return `${h - 12} PM`
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      {/* Y-axis gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map(frac => {
        const val = maxD * frac
        const y = PAD.top + iH - (frac * iH)
        return (
          <g key={frac}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
              stroke="var(--cream-darker)" strokeWidth="1" />
            <text x={PAD.left - 8} y={y} textAnchor="end" fontSize="10"
              fill="var(--text-light)" dominantBaseline="middle">
              {val.toFixed(2)}
            </text>
          </g>
        )
      })}
      {/* Y-axis label */}
      <text x={14} y={PAD.top + iH / 2} textAnchor="middle" fontSize="11"
        fill="var(--text-mid)" transform={`rotate(-90, 14, ${PAD.top + iH / 2})`}>
        Density
      </text>
      {/* Bars */}
      {densityData.map((d, i) => {
        const gx = PAD.left + i * barGroupW
        const notH = (d.notConv / maxD) * iH
        const convH = (d.conv / maxD) * iH
        return (
          <g key={d.hour}>
            <rect x={gx + barGroupW * 0.06} y={PAD.top + iH - notH}
              width={barW} height={notH} fill="var(--sm-not-converted)"
              opacity="0.55" rx="2" />
            <rect x={gx + barGroupW * 0.06 + barW + 1} y={PAD.top + iH - convH}
              width={barW} height={convH} fill="var(--sm-converted)"
              opacity="0.55" rx="2" />
          </g>
        )
      })}
      {/* X-axis labels — every 3 hours */}
      {densityData.filter((_, i) => i % 3 === 0).map(d => {
        const x = PAD.left + d.hour * barGroupW + barGroupW / 2
        return (
          <text key={d.hour} x={x} y={H - 12} textAnchor="middle"
            fontSize="10" fill="var(--text-mid)">
            {hourLabel(d.hour)}
          </text>
        )
      })}
    </svg>
  )
}

/* ── HorizontalBarChart — conversion rate by category ─────────────────── */

interface HBarChartProps {
  data: ContentBreakdown[]
  overallRate: number
}

function HorizontalBarChart({ data, overallRate }: HBarChartProps) {
  const sorted = [...data].sort((a, b) => a.conversion_rate - b.conversion_rate)
  const barH = 28, gap = 8
  const W = 560
  const PAD = { top: 10, right: 80, bottom: 30, left: 150 }
  const H = PAD.top + sorted.length * (barH + gap) + PAD.bottom
  const iW = W - PAD.left - PAD.right
  const maxRate = Math.max(...sorted.map(d => d.conversion_rate), overallRate, 0.01)
  const scale = iW / Math.min(maxRate * 1.15, 1)

  const overallX = PAD.left + overallRate * scale

  return (
    <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      {/* Dashed overall line */}
      <line x1={overallX} y1={PAD.top - 4} x2={overallX} y2={H - PAD.bottom + 8}
        stroke="var(--text-light)" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.7" />
      <text x={overallX} y={H - 8} textAnchor="middle" fontSize="10"
        fill="var(--text-light)">
        Overall ({(overallRate * 100).toFixed(1)}%)
      </text>
      {/* Bars */}
      {sorted.map((d, i) => {
        const y = PAD.top + i * (barH + gap)
        const bW = Math.max(d.conversion_rate * scale, 2)
        const above = d.conversion_rate >= overallRate
        return (
          <g key={d.category}>
            <text x={PAD.left - 8} y={y + barH / 2} textAnchor="end"
              fontSize="12" fill="var(--text-dark)" dominantBaseline="middle">
              {d.category}
            </text>
            <rect x={PAD.left} y={y} width={bW} height={barH}
              fill={above ? 'var(--sm-converted)' : 'var(--sm-not-converted)'}
              rx="3" />
            <text x={PAD.left + bW + 6} y={y + barH / 2} fontSize="11"
              fill="var(--text-light)" dominantBaseline="middle">
              n={d.post_count}
            </text>
          </g>
        )
      })}
      {/* X-axis ticks */}
      {[0, 0.25, 0.5, 0.75, 1].filter(v => v * scale + PAD.left < W - PAD.right + 20).map(v => (
        <text key={v} x={PAD.left + v * scale} y={H - PAD.bottom + 22}
          textAnchor="middle" fontSize="10" fill="var(--text-light)">
          {(v * 100).toFixed(0)}%
        </text>
      ))}
    </svg>
  )
}

/* ── ConversionGauge — semicircular arc for predictor result ──────────── */

interface GaugeProps {
  score: number
  tier: string
}

function ConversionGauge({ score, tier }: GaugeProps) {
  const R = 80, cx = 100, cy = 95, strokeW = 14
  const startAngle = Math.PI
  const endAngle = 0
  const sweepAngle = Math.PI * Math.max(0, Math.min(score, 1))

  const arcPath = (angle: number) => {
    const x = cx + R * Math.cos(Math.PI - angle)
    const y = cy - R * Math.sin(angle)
    return `${x} ${y}`
  }

  const bgD = `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`
  const fillEnd = sweepAngle
  const fillX = cx + R * Math.cos(Math.PI - fillEnd)
  const fillY = cy - R * Math.sin(fillEnd)
  const largeArc = fillEnd > Math.PI / 2 ? 1 : 0
  const fillD = `M ${cx - R} ${cy} A ${R} ${R} 0 ${largeArc} 1 ${fillX} ${fillY}`

  const tierColor = tier === 'High' ? 'var(--sm-high)' : tier === 'Medium' ? 'var(--sm-medium)' : 'var(--sm-low)'

  return (
    <div className="sm-gauge">
      <svg viewBox="0 0 200 110" width="200" height="110">
        <path d={bgD} fill="none" stroke="var(--cream-darker)" strokeWidth={strokeW}
          strokeLinecap="round" />
        <path d={fillD} fill="none" stroke={tierColor} strokeWidth={strokeW}
          strokeLinecap="round" />
      </svg>
      <span className="sm-gauge__score">{(score * 100).toFixed(0)}%</span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════════ */

function fmt(n: number, decimals = 0): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: decimals })
}

function fmtPct(n: number): string {
  return (n * 100).toFixed(1) + '%'
}

function fmtPHP(n: number): string {
  return '₱' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

/* ═══════════════════════════════════════════════════════════════════════════
   Section definitions
   ═══════════════════════════════════════════════════════════════════════════ */

type SocialMediaSection =
  | 'platforms' | 'timing' | 'content' | 'top-posts'
  | 'funnel' | 'boosted' | 'predictor'

const SECTION_LABELS: { id: SocialMediaSection; label: string }[] = [
  { id: 'platforms',  label: 'Platform Scorecards' },
  { id: 'timing',     label: 'Best Time to Post' },
  { id: 'content',    label: 'Content Strategy' },
  { id: 'top-posts',  label: 'Top Performing Posts' },
  { id: 'funnel',     label: 'Conversion Funnel' },
  { id: 'boosted',    label: 'Boosted vs Organic' },
  { id: 'predictor',  label: 'Post Predictor' },
]

type ContentSubTab = 'post_type' | 'media_type' | 'content_topic' | 'sentiment_tone' | 'day_of_week'

const CONTENT_SUB_LABELS: { id: ContentSubTab; label: string }[] = [
  { id: 'post_type',      label: 'Post Type' },
  { id: 'media_type',     label: 'Media Type' },
  { id: 'content_topic',  label: 'Content Topic' },
  { id: 'sentiment_tone', label: 'Sentiment' },
  { id: 'day_of_week',    label: 'Day of Week' },
]

/* ═══════════════════════════════════════════════════════════════════════════
   Section Components
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Platforms ────────────────────────────────────────────────────────────── */

function SectionPlatforms({ data }: { data: SocialMediaAnalytics }) {
  return (
    <div className="sm-section-panel">
      <h3 className="sm-section-panel__title">Platform Scorecards</h3>
      <div className="sm-explanation">
        These cards show how each social media platform is performing for Luz de Vida.
        Look at the "Donation Referrals" number to see which platforms actually drive
        donations, not just likes. The conversion rate tells you what percentage of
        posts on each platform led to at least one donation.
      </div>
      <div className="sm-stat-strip">
        {data.platform_scorecards.map(p => (
          <div className="sm-scorecard" key={p.platform}>
            <div className="sm-scorecard__platform">{p.platform}</div>
            <div className="sm-scorecard__followers">{fmt(p.latest_follower_count)}</div>
            <div className="sm-scorecard__followers-label">Followers</div>
            <div className="sm-scorecard__stats">
              <div>
                <div className="sm-scorecard__stat-value">{fmt(p.post_count)}</div>
                <div className="sm-scorecard__stat-label">Posts</div>
              </div>
              <div>
                <div className="sm-scorecard__stat-value">{fmt(Math.round(p.avg_reach))}</div>
                <div className="sm-scorecard__stat-label">Avg Reach</div>
              </div>
              <div>
                <div className="sm-scorecard__stat-value">{fmtPct(p.avg_engagement_rate)}</div>
                <div className="sm-scorecard__stat-label">Avg Engagement</div>
              </div>
              <div>
                <div className="sm-scorecard__stat-value">{fmt(p.total_donation_referrals)}</div>
                <div className="sm-scorecard__stat-label">Donation Referrals</div>
              </div>
              <div>
                <div className="sm-scorecard__stat-value">{fmtPHP(Number(p.total_donation_value_php))}</div>
                <div className="sm-scorecard__stat-label">Donation Value</div>
              </div>
              <div>
                <div className="sm-scorecard__stat-value">{fmtPct(p.conversion_rate)}</div>
                <div className="sm-scorecard__stat-label">Conversion Rate</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Best Time to Post ────────────────────────────────────────────────────── */

function SectionTiming({ data }: { data: SocialMediaAnalytics }) {
  return (
    <div className="sm-section-panel">
      <h3 className="sm-section-panel__title">Best Time to Post</h3>
      <div className="sm-explanation">
        This chart shows when posts that led to donations (red) were published versus
        posts that did not (blue). The taller the red bars relative to blue at a given
        hour, the better that time slot is for driving donations. Each group is
        shown as a proportion of its own total so the two distributions are
        comparable even if one group has more posts.
      </div>
      <figure className="sm-chart-figure" aria-label="Post hour distribution">
        <figcaption>Post Hour — Converted vs Not Converted</figcaption>
        <div className="sm-legend">
          <span className="sm-legend__item">
            <span className="sm-legend__swatch" style={{ background: 'var(--sm-not-converted)' }} />
            Not Converted
          </span>
          <span className="sm-legend__item">
            <span className="sm-legend__swatch" style={{ background: 'var(--sm-converted)' }} />
            Converted
          </span>
        </div>
        <DensityChart data={data.hourly_distribution} />
      </figure>
    </div>
  )
}

/* ── Content Strategy ─────────────────────────────────────────────────────── */

function SectionContent({ data }: { data: SocialMediaAnalytics }) {
  const [sub, setSub] = useState<ContentSubTab>('post_type')

  const breakdownMap: Record<ContentSubTab, ContentBreakdown[]> = {
    post_type: data.by_post_type,
    media_type: data.by_media_type,
    content_topic: data.by_content_topic,
    sentiment_tone: data.by_sentiment_tone,
    day_of_week: data.by_day_of_week,
  }

  const current = breakdownMap[sub]

  return (
    <div className="sm-section-panel">
      <h3 className="sm-section-panel__title">Content Strategy</h3>
      <div className="sm-explanation">
        Each bar shows what percentage of posts with that category led to at least
        one donation referral. Bars in red are above your overall conversion rate;
        blue bars fall below it. The dashed line marks your overall average
        ({fmtPct(data.overall_conversion_rate)}). Focus your efforts on categories
        with red bars — they have the best track record for driving donations.
      </div>
      <div className="sm-content-nav">
        {CONTENT_SUB_LABELS.map(s => (
          <button key={s.id}
            className={`sm-content-nav__btn${sub === s.id ? ' sm-content-nav__btn--active' : ''}`}
            onClick={() => setSub(s.id)}>
            {s.label}
          </button>
        ))}
      </div>
      <figure className="sm-chart-figure" aria-label={`Conversion rate by ${sub}`}>
        <figcaption>Conversion Rate by {CONTENT_SUB_LABELS.find(s => s.id === sub)!.label}</figcaption>
        <div className="sm-legend">
          <span className="sm-legend__item">
            <span className="sm-legend__swatch" style={{ background: 'var(--sm-not-converted)' }} />
            Below Average
          </span>
          <span className="sm-legend__item">
            <span className="sm-legend__swatch" style={{ background: 'var(--sm-converted)' }} />
            Above Average
          </span>
        </div>
        {current.length > 0 ? (
          <HorizontalBarChart data={current} overallRate={data.overall_conversion_rate} />
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
            No data available for this category
          </div>
        )}
      </figure>
    </div>
  )
}

/* ── Top Performing Posts ─────────────────────────────────────────────────── */

type TopSort = 'engagement' | 'conversions'

function SectionTopPosts({ data }: { data: SocialMediaAnalytics }) {
  const [sort, setSort] = useState<TopSort>('conversions')
  const MAX_ROWS = 20

  const sorted = [...data.top_posts]
    .sort((a, b) =>
      sort === 'engagement'
        ? b.engagement_rate - a.engagement_rate
        : b.donation_referrals - a.donation_referrals || b.estimated_donation_value_php - a.estimated_donation_value_php
    )
    .slice(0, MAX_ROWS)

  return (
    <div className="sm-section-panel">
      <h3 className="sm-section-panel__title">Top Performing Posts</h3>
      <div className="sm-explanation">
        Your best posts ranked two ways. "By Engagement" shows which posts got the
        most interaction (likes, comments, shares). "By Conversions" shows which posts
        actually drove donations. A post with high engagement but low conversions means
        it entertains but does not convert — and vice versa.
      </div>
      <div className="sm-table__toggle">
        <button className={`sm-table__toggle-btn${sort === 'engagement' ? ' sm-table__toggle-btn--active' : ''}`}
          onClick={() => setSort('engagement')}>
          By Engagement
        </button>
        <button className={`sm-table__toggle-btn${sort === 'conversions' ? ' sm-table__toggle-btn--active' : ''}`}
          onClick={() => setSort('conversions')}>
          By Conversions
        </button>
      </div>
      <div className="sm-table-wrap">
        <table className="sm-table">
          <thead>
            <tr>
              <th>Platform</th>
              <th>Type</th>
              <th>Topic</th>
              <th>Date</th>
              <th>Eng. Rate</th>
              <th>Likes</th>
              <th>Shares</th>
              <th>Clicks</th>
              <th>Don. Referrals</th>
              <th>Don. Value</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(p => (
              <tr key={p.post_id}
                className={p.donation_referrals > 0 ? 'sm-table__converted' : ''}>
                <td>{p.platform ?? '—'}</td>
                <td>{p.post_type ?? '—'}</td>
                <td>{p.content_topic ?? '—'}</td>
                <td>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</td>
                <td>{fmtPct(p.engagement_rate)}</td>
                <td>{fmt(p.likes)}</td>
                <td>{fmt(p.shares)}</td>
                <td>{fmt(p.click_throughs)}</td>
                <td>{fmt(p.donation_referrals)}</td>
                <td>{fmtPHP(Number(p.estimated_donation_value_php))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Conversion Funnel ────────────────────────────────────────────────────── */

function SectionFunnel({ data }: { data: SocialMediaAnalytics }) {
  const f = data.funnel
  const steps = [
    { label: 'Impressions', value: f.total_impressions },
    { label: 'Reach', value: f.total_reach },
    { label: 'Engagement', value: f.total_engagement },
    { label: 'Click-throughs', value: f.total_click_throughs },
    { label: 'Donation Referrals', value: f.total_donation_referrals },
  ]
  const maxVal = Math.max(...steps.map(s => s.value), 1)

  return (
    <div className="sm-section-panel">
      <h3 className="sm-section-panel__title">Conversion Funnel</h3>
      <div className="sm-explanation">
        This shows how many people move through each step from seeing your post to
        making a donation. Each percentage shows how many people moved to the next
        step. The biggest drop-off tells you where to focus improvement — that is
        where you are losing the most potential donors.
      </div>
      <div className="sm-funnel">
        {steps.map((step, i) => {
          const pct = i > 0 && steps[i - 1].value > 0
            ? (step.value / steps[i - 1].value) * 100
            : null
          const barPct = (step.value / maxVal) * 100
          return (
            <div className="sm-funnel__step" key={step.label}>
              <span className="sm-funnel__label">{step.label}</span>
              <div className="sm-funnel__bar-wrap">
                <div className="sm-funnel__bar"
                  style={{
                    width: `${Math.max(barPct, 2)}%`,
                    opacity: 1 - i * 0.12,
                  }} />
              </div>
              <span className="sm-funnel__value">{fmt(step.value)}</span>
              <span className="sm-funnel__pct">
                {pct !== null ? `${pct.toFixed(1)}%` : ''}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Boosted vs Organic ───────────────────────────────────────────────────── */

function SectionBoosted({ data }: { data: SocialMediaAnalytics }) {
  const b = data.boosted_vs_organic.boosted
  const o = data.boosted_vs_organic.organic
  const roi = b.total_boost_spend_php > 0
    ? ((Number(b.total_donation_value_php) - Number(b.total_boost_spend_php)) / Number(b.total_boost_spend_php)) * 100
    : null

  const metrics = (seg: typeof b, isBoosted: boolean) => [
    { label: 'Posts', value: fmt(seg.post_count) },
    { label: 'Avg Engagement', value: fmtPct(seg.avg_engagement_rate) },
    { label: 'Avg Reach', value: fmt(Math.round(seg.avg_reach)) },
    { label: 'Conversion Rate', value: fmtPct(seg.conversion_rate) },
    { label: 'Donation Referrals', value: fmt(seg.total_donation_referrals) },
    { label: 'Donation Value', value: fmtPHP(Number(seg.total_donation_value_php)) },
    ...(isBoosted ? [
      { label: 'Total Spend', value: fmtPHP(Number(seg.total_boost_spend_php)) },
      { label: 'ROI', value: roi !== null ? `${roi.toFixed(0)}%` : 'N/A' },
    ] : []),
  ]

  return (
    <div className="sm-section-panel">
      <h3 className="sm-section-panel__title">Boosted vs Organic</h3>
      <div className="sm-explanation">
        Compare your paid (boosted) posts against your free (organic) posts. ROI
        tells you how much donation value you get for each peso spent on boosting —
        a positive ROI means boosting is profitable. If organic posts convert at a
        similar rate, you may not need to boost as much.
      </div>
      <div className="sm-compare">
        <div className="sm-compare__col">
          <div className="sm-compare__col-title">Boosted</div>
          {metrics(b, true).map(m => (
            <div className="sm-compare__metric" key={m.label}>
              <span className="sm-compare__metric-label">{m.label}</span>
              <span className="sm-compare__metric-value">{m.value}</span>
            </div>
          ))}
        </div>
        <div className="sm-compare__col">
          <div className="sm-compare__col-title">Organic</div>
          {metrics(o, false).map(m => (
            <div className="sm-compare__metric" key={m.label}>
              <span className="sm-compare__metric-label">{m.label}</span>
              <span className="sm-compare__metric-value">{m.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Post Predictor ───────────────────────────────────────────────────────── */

const DEFAULT_FORM: SocialMediaEvaluateRequest = {
  platform: 'Facebook',
  post_type: 'ImpactStory',
  media_type: 'Photo',
  content_topic: 'Education',
  sentiment_tone: 'Emotional',
  has_call_to_action: true,
  call_to_action_type: 'DonateNow',
  features_resident_story: false,
  is_boosted: false,
  boost_budget_php: 0,
  in_campaign: false,
  post_hour: 10,
  caption_length: 140,
  day_of_week: 'Monday',
  subscriber_count_at_post: 0,
}

function SectionPredictor() {
  const [form, setForm] = useState<SocialMediaEvaluateRequest>({ ...DEFAULT_FORM })
  const [result, setResult] = useState<MlPredictionItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = <K extends keyof SocialMediaEvaluateRequest>(key: K, val: SocialMediaEvaluateRequest[K]) =>
    setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await evaluateSocialMediaPost(form)
      setResult(res)
    } catch (err: any) {
      setError(err.message ?? 'Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  const hourLabel = (h: number) => {
    if (h === 0) return '12:00 AM'
    if (h < 12) return `${h}:00 AM`
    if (h === 12) return '12:00 PM'
    return `${h - 12}:00 PM`
  }

  return (
    <div className="sm-section-panel">
      <h3 className="sm-section-panel__title">Post Predictor</h3>
      <div className="sm-explanation">
        Fill in the details of a post you are planning. The machine learning model will
        predict the probability that it leads to at least one donation, based on patterns
        learned from 800+ past posts. Try different combinations to find what works
        best before you publish.
      </div>
      <form className="sm-predictor__form" onSubmit={handleSubmit}>
        {/* Platform */}
        <div className="sm-predictor__field">
          <label className="sm-predictor__label">Platform</label>
          <select className="sm-predictor__select" value={form.platform}
            onChange={e => set('platform', e.target.value)}>
            {['Facebook', 'Instagram', 'LinkedIn', 'TikTok', 'WhatsApp', 'YouTube'].map(o =>
              <option key={o}>{o}</option>)}
          </select>
        </div>
        {/* Post Type */}
        <div className="sm-predictor__field">
          <label className="sm-predictor__label">Post Type</label>
          <select className="sm-predictor__select" value={form.post_type}
            onChange={e => set('post_type', e.target.value)}>
            {['ImpactStory', 'Campaign', 'FundraisingAppeal', 'ThankYou', 'EducationalContent', 'EventPromotion'].map(o =>
              <option key={o}>{o}</option>)}
          </select>
        </div>
        {/* Media Type */}
        <div className="sm-predictor__field">
          <label className="sm-predictor__label">Media Type</label>
          <select className="sm-predictor__select" value={form.media_type}
            onChange={e => set('media_type', e.target.value)}>
            {['Photo', 'Reel', 'Text'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        {/* Content Topic */}
        <div className="sm-predictor__field">
          <label className="sm-predictor__label">Content Topic</label>
          <select className="sm-predictor__select" value={form.content_topic}
            onChange={e => set('content_topic', e.target.value)}>
            {['Education', 'Reintegration', 'DonorImpact', 'Health', 'DailyLife', 'Events', 'Nutrition', 'CommunityPartnership'].map(o =>
              <option key={o}>{o}</option>)}
          </select>
        </div>
        {/* Sentiment */}
        <div className="sm-predictor__field">
          <label className="sm-predictor__label">Sentiment Tone</label>
          <select className="sm-predictor__select" value={form.sentiment_tone}
            onChange={e => set('sentiment_tone', e.target.value)}>
            {['Emotional', 'Celebratory', 'Informative', 'Grateful', 'Urgent'].map(o =>
              <option key={o}>{o}</option>)}
          </select>
        </div>
        {/* Day of Week */}
        <div className="sm-predictor__field">
          <label className="sm-predictor__label">Day of Week</label>
          <select className="sm-predictor__select" value={form.day_of_week}
            onChange={e => set('day_of_week', e.target.value)}>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(o =>
              <option key={o}>{o}</option>)}
          </select>
        </div>
        {/* Post Hour */}
        <div className="sm-predictor__field">
          <label className="sm-predictor__label">Post Hour</label>
          <select className="sm-predictor__select" value={form.post_hour}
            onChange={e => set('post_hour', Number(e.target.value))}>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>{hourLabel(i)}</option>
            ))}
          </select>
        </div>
        {/* Caption Length */}
        <div className="sm-predictor__field">
          <label className="sm-predictor__label">Caption Length</label>
          <input className="sm-predictor__input" type="number" min={10} max={500}
            value={form.caption_length}
            onChange={e => set('caption_length', Number(e.target.value))} />
        </div>

        {/* CTA Type — shown when CTA is checked */}
        {form.has_call_to_action && (
          <div className="sm-predictor__field">
            <label className="sm-predictor__label">Call to Action Type</label>
            <select className="sm-predictor__select" value={form.call_to_action_type}
              onChange={e => set('call_to_action_type', e.target.value)}>
              {['DonateNow', 'LearnMore', 'ShareStory', 'None'].map(o =>
                <option key={o}>{o}</option>)}
            </select>
          </div>
        )}

        {/* Boost Budget — shown when boosted is checked */}
        {form.is_boosted && (
          <div className="sm-predictor__field">
            <label className="sm-predictor__label">Boost Budget (PHP)</label>
            <input className="sm-predictor__input" type="number" min={0}
              value={form.boost_budget_php}
              onChange={e => set('boost_budget_php', Number(e.target.value))} />
          </div>
        )}

        {/* Subscriber Count */}
        <div className="sm-predictor__field">
          <label className="sm-predictor__label">Subscriber Count</label>
          <input className="sm-predictor__input" type="number" min={0}
            value={form.subscriber_count_at_post}
            onChange={e => set('subscriber_count_at_post', Number(e.target.value))} />
        </div>

        {/* Checkboxes */}
        <div className="sm-predictor__checkbox-row">
          <label className="sm-predictor__checkbox">
            <input type="checkbox" checked={form.has_call_to_action}
              onChange={e => {
                set('has_call_to_action', e.target.checked)
                if (!e.target.checked) set('call_to_action_type', 'None')
              }} />
            Has Call to Action
          </label>
          <label className="sm-predictor__checkbox">
            <input type="checkbox" checked={form.features_resident_story}
              onChange={e => set('features_resident_story', e.target.checked)} />
            Features Resident Story
          </label>
          <label className="sm-predictor__checkbox">
            <input type="checkbox" checked={form.is_boosted}
              onChange={e => {
                set('is_boosted', e.target.checked)
                if (!e.target.checked) set('boost_budget_php', 0)
              }} />
            Boosted
          </label>
          <label className="sm-predictor__checkbox">
            <input type="checkbox" checked={form.in_campaign}
              onChange={e => set('in_campaign', e.target.checked)} />
            Part of Campaign
          </label>
        </div>

        <button type="submit" className="sm-predictor__submit" disabled={loading}>
          {loading ? 'Evaluating...' : 'Predict Conversion'}
        </button>
      </form>

      {error && <p style={{ color: 'var(--sm-low)', textAlign: 'center' }}>{error}</p>}

      {result && (
        <div className="sm-predictor__result">
          <ConversionGauge score={result.score} tier={result.tier} />
          <span className={`sm-predictor__tier sm-predictor__tier--${result.tier}`}>
            {result.tier} Conversion Potential
          </span>
          <p className="sm-predictor__interpretation">
            {result.tier === 'High'
              ? 'This post configuration has a strong probability of driving at least one donation referral. Consider publishing it as planned.'
              : result.tier === 'Medium'
              ? 'This post has a moderate chance of converting. Try adjusting the post type, timing, or adding a call to action to improve the odds.'
              : 'This post configuration is unlikely to drive donations. Consider switching to an Impact Story or Campaign post type, or try a different time slot.'}
          </p>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

type Status = 'loading' | 'success' | 'error'

interface SocialMediaPerformanceProps {
  embedded?: boolean
}

export default function SocialMediaPerformance({ embedded }: SocialMediaPerformanceProps) {
  const [status, setStatus] = useState<Status>('loading')
  const [data, setData] = useState<SocialMediaAnalytics | null>(null)
  const [activeSection, setActiveSection] = useState<SocialMediaSection>('platforms')

  const load = () => {
    setStatus('loading')
    fetchSocialMediaAnalytics()
      .then(d => { setData(d); setStatus('success') })
      .catch(() => setStatus('error'))
  }

  useEffect(load, [])

  const cls = `sm${embedded ? ' sm--embedded' : ''}`

  if (status === 'loading') {
    return (
      <div className={cls}>
        <div className="sm__loading">
          <div className="sm__spinner" />
          Loading social media analytics...
        </div>
      </div>
    )
  }

  if (status === 'error' || !data) {
    return (
      <div className={cls}>
        <div className="sm__error">
          <p>Unable to load social media analytics.</p>
          <button className="sm__retry-btn" onClick={load}>Retry</button>
        </div>
      </div>
    )
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'platforms':  return <SectionPlatforms data={data} />
      case 'timing':     return <SectionTiming data={data} />
      case 'content':    return <SectionContent data={data} />
      case 'top-posts':  return <SectionTopPosts data={data} />
      case 'funnel':     return <SectionFunnel data={data} />
      case 'boosted':    return <SectionBoosted data={data} />
      case 'predictor':  return <SectionPredictor />
    }
  }

  return (
    <div className={cls}>
      <div className="sm__header">
        <h2 className="sm__title">Social Media Performance</h2>
        <p className="sm__subtitle">
          Insights from {fmt(data.total_posts)} posts — overall conversion rate: {fmtPct(data.overall_conversion_rate)}
        </p>
        <span className="sm__meta">
          Generated {new Date(data.generated_at).toLocaleString()}
        </span>
      </div>

      <nav className="sm__section-nav" aria-label="Dashboard sections">
        {SECTION_LABELS.map(s => (
          <button key={s.id}
            className={`sm__section-btn${activeSection === s.id ? ' sm__section-btn--active' : ''}`}
            onClick={() => setActiveSection(s.id)}>
            {s.label}
          </button>
        ))}
      </nav>

      {renderSection()}
    </div>
  )
}
