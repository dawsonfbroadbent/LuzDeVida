import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { fetchPublicImpact, type PublicImpactData, type PublicImpactMonthlyTrendItem } from '../api/publicImpact'

/* ── SVG Line Chart ──────────────────────────────────────── */
interface LineChartProps {
  data: { month: string; value: number | null }[]
  label: string
  color: string
  unit?: string
  yMax?: number
}

function LineChart({ data, label, color, unit = '', yMax = 100 }: LineChartProps) {
  const W = 560
  const H = 160
  const PAD = { top: 16, right: 20, bottom: 36, left: 44 }
  const iW = W - PAD.left - PAD.right
  const iH = H - PAD.top - PAD.bottom
  const hasData = data.some(d => d.value !== null)
  const gridVals = [0, 25, 50, 75, 100].filter(v => v <= yMax)

  const toX = (i: number): number => PAD.left + (i / (data.length - 1)) * iW
  const toY = (v: number): number => PAD.top + (1 - v / yMax) * iH

  let pathD = ''
  let inPath = false
  data.forEach((d, i) => {
    if (d.value === null) { inPath = false; return }
    const x = toX(i).toFixed(1)
    const y = toY(d.value).toFixed(1)
    pathD += inPath ? ` L${x},${y}` : `M${x},${y}`
    inPath = true
  })

  return (
    <figure className="impact-linechart" aria-label={label}>
      <figcaption className="impact-chart__label">{label}</figcaption>
      {!hasData ? (
        <div className="impact-chart__empty">No data recorded yet</div>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
          {gridVals.map(v => (
            <g key={v}>
              <line
                x1={PAD.left} y1={toY(v)}
                x2={W - PAD.right} y2={toY(v)}
                stroke="var(--cream-darker)" strokeWidth="1"
              />
              <text
                x={PAD.left - 8} y={toY(v)}
                textAnchor="end" fontSize="11"
                fill="var(--text-light)" dominantBaseline="middle"
              >
                {v}{unit}
              </text>
            </g>
          ))}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {data.map((d, i) =>
            d.value !== null ? (
              <circle key={i} cx={toX(i)} cy={toY(d.value)} r="3.5" fill={color} />
            ) : null
          )}
          {data.map((d, i) => (
            <text
              key={i}
              x={toX(i)}
              y={H - 6}
              textAnchor="middle"
              fontSize="10"
              fill="var(--text-light)"
            >
              {d.month.substring(0, 3)}
            </text>
          ))}
        </svg>
      )}
    </figure>
  )
}

/* ── SVG Bar Chart ───────────────────────────────────────── */
interface BarChartProps {
  data: { month: string; value: number }[]
  label: string
  color: string
}

function BarChart({ data, label, color }: BarChartProps) {
  const W = 560
  const H = 130
  const PAD = { top: 10, right: 16, bottom: 34, left: 36 }
  const iW = W - PAD.left - PAD.right
  const iH = H - PAD.top - PAD.bottom
  const maxVal = Math.max(...data.map(d => d.value), 1)
  const barStep = iW / data.length
  const barW = barStep * 0.58

  return (
    <figure className="impact-barchart" aria-label={label}>
      <figcaption className="impact-chart__label">{label}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        {data.map((d, i) => {
          const barH = Math.max((d.value / maxVal) * iH, d.value > 0 ? 2 : 0)
          const x = PAD.left + i * barStep + (barStep - barW) / 2
          const y = PAD.top + iH - barH
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} fill={color} rx="2" opacity="0.8" />
              <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--text-light)">
                {d.month.substring(0, 3)}
              </text>
            </g>
          )
        })}
      </svg>
    </figure>
  )
}

/* ── Helpers ─────────────────────────────────────────────── */
function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function toEduSeries(trend: PublicImpactMonthlyTrendItem[]) {
  return trend.map(t => ({ month: t.month, value: t.avgEducationProgress }))
}

function toHealthSeries(trend: PublicImpactMonthlyTrendItem[]) {
  return trend.map(t => ({ month: t.month, value: t.avgHealthScore }))
}

function toResidentsSeries(trend: PublicImpactMonthlyTrendItem[]) {
  return trend.map(t => ({ month: t.month, value: t.activeResidents }))
}

function toCounselingSeries(trend: PublicImpactMonthlyTrendItem[]) {
  return trend.map(t => ({ month: t.month, value: t.counselingSessions }))
}

function toHomeVisitSeries(trend: PublicImpactMonthlyTrendItem[]) {
  return trend.map(t => ({ month: t.month, value: t.homeVisits }))
}

/* ── Fallback copy (used when no published snapshot exists) ─ */
const FALLBACK_HEADLINE = 'Restoring Hope, One Life at a Time'
const FALLBACK_SUMMARY =
  'Every girl in our care receives safe shelter, holistic support, and a guided path toward a future she deserves. Your generosity makes this possible.'

/* ── Impact Page ─────────────────────────────────────────── */
type Status = 'loading' | 'success' | 'error'

export default function Impact() {
  const [status, setStatus] = useState<Status>('loading')
  const [data, setData] = useState<PublicImpactData | null>(null)

  useScrollReveal()

  useEffect(() => {
    fetchPublicImpact()
      .then(d => { setData(d); setStatus('success') })
      .catch(() => setStatus('error'))
  }, [])

  const headline = data?.story.headline ?? FALLBACK_HEADLINE
  const summary = data?.story.summaryText ?? FALLBACK_SUMMARY

  return (
    <>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="impact-hero">
        <div className="container">
          <div className="impact-hero__inner">
            <span className="section-label" style={{ justifyContent: 'center', color: 'rgba(255,255,255,0.55)' }}>
              Our Impact
            </span>

            {status === 'loading' ? (
              <div className="impact-hero__skeleton">
                <div className="impact-skeleton impact-skeleton--title" />
                <div className="impact-skeleton impact-skeleton--text" />
                <div className="impact-skeleton impact-skeleton--text impact-skeleton--short" />
              </div>
            ) : (
              <>
                <h1>{headline}</h1>
                <p>{summary}</p>
                {data?.story.storyPublishedAt && (
                  <p className="impact-hero__updated">
                    Last updated {formatDate(data.story.storyPublishedAt)}
                  </p>
                )}
              </>
            )}

            <Link to="/donate" className="btn btn-sand">
              Give Today
            </Link>
          </div>
        </div>
      </section>

      {/* ── Error Banner ─────────────────────────────── */}
      {status === 'error' && (
        <div className="impact-error-banner" role="alert">
          <p>
            Live metrics are temporarily unavailable. The information below reflects our current mission and impact.
          </p>
        </div>
      )}

      {/* ── KPI Strip ────────────────────────────────── */}
      <section className="impact-kpi" aria-label="Key impact metrics">
        <div className="container">
          <div className="impact-kpi__grid">

            {/* OKR — featured */}
            <div className="kpi-card kpi-card--featured reveal">
              {status === 'loading' ? (
                <div className="impact-skeleton impact-skeleton--kpi" />
              ) : (
                <>
                  <div className="kpi-card__number">
                    {data?.okr.value ?? '—'}
                  </div>
                  <div className="kpi-card__label">{data?.okr.label ?? 'Girls supported'}</div>
                  <p className="kpi-card__rationale">{data?.okr.rationale ?? ''}</p>
                </>
              )}
            </div>

            {/* Supporting KPIs */}
            <div className="kpi-card reveal delay-1">
              {status === 'loading' ? (
                <div className="impact-skeleton impact-skeleton--kpi" />
              ) : (
                <>
                  <div className="kpi-card__number">{data?.highlights.safehousesInNetwork ?? '—'}</div>
                  <div className="kpi-card__label">Safehouses in network</div>
                  <p className="kpi-card__rationale">Safe homes actively serving girls in our care.</p>
                </>
              )}
            </div>

            <div className="kpi-card reveal delay-2">
              {status === 'loading' ? (
                <div className="impact-skeleton impact-skeleton--kpi" />
              ) : (
                <>
                  <div className="kpi-card__number">{data?.highlights.supportersAllTime ?? '—'}</div>
                  <div className="kpi-card__label">Supporters</div>
                  <p className="kpi-card__rationale">Donors and partners who stand behind our mission.</p>
                </>
              )}
            </div>

            <div className="kpi-card reveal delay-3">
              {status === 'loading' ? (
                <div className="impact-skeleton impact-skeleton--kpi" />
              ) : (
                <>
                  <div className="kpi-card__number">
                    {data?.highlights.careTouchpointsLast12Months ?? '—'}
                  </div>
                  <div className="kpi-card__label">Care touchpoints (12 months)</div>
                  <p className="kpi-card__rationale">Counseling sessions and home visits delivered last year.</p>
                </>
              )}
            </div>
          </div>

          {data?.metricsAsOf && (
            <p className="impact-kpi__asof">
              Metrics as of {formatDate(data.metricsAsOf)}
            </p>
          )}
        </div>
      </section>

      {/* ── Progress Over Time ────────────────────────── */}
      <section className="impact-trends reveal">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Progress Over Time</span>
            <h2>How Girls Are Growing</h2>
            <p>
              Organization-wide averages for education progress and wellness scores across
              the trailing 12-month window.
            </p>
          </div>

          {status === 'loading' ? (
            <div className="impact-charts-row">
              <div className="impact-skeleton impact-skeleton--chart" />
              <div className="impact-skeleton impact-skeleton--chart" />
            </div>
          ) : status === 'error' || !data ? (
            <p className="impact-no-data">Progress charts will appear once metrics are available.</p>
          ) : (
            <div className="impact-charts-row">
              <LineChart
                data={toEduSeries(data.monthlyTrend)}
                label="Education Progress (%)"
                color="var(--blue)"
                unit="%"
              />
              <LineChart
                data={toHealthSeries(data.monthlyTrend)}
                label="Wellness Score (0–100)"
                color="var(--teal)"
              />
            </div>
          )}
        </div>
      </section>

      {/* ── Care in Action ───────────────────────────── */}
      <section className="impact-care">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-label">Care in Action</span>
            <h2>Monthly Activity</h2>
            <p>
              A month-by-month view of active residents, counseling sessions, and home visits
              across all our safehouses.
            </p>
          </div>

          {status === 'loading' ? (
            <div className="impact-care-grid">
              <div className="impact-skeleton impact-skeleton--chart" />
              <div className="impact-skeleton impact-skeleton--chart" />
              <div className="impact-skeleton impact-skeleton--chart" />
            </div>
          ) : status === 'error' || !data ? (
            <p className="impact-no-data reveal">Activity charts will appear once data is recorded.</p>
          ) : (
            <div className="impact-care-grid reveal">
              <BarChart
                data={toResidentsSeries(data.monthlyTrend)}
                label="Active Residents"
                color="var(--blue)"
              />
              <BarChart
                data={toCounselingSeries(data.monthlyTrend)}
                label="Counseling Sessions"
                color="var(--teal)"
              />
              <BarChart
                data={toHomeVisitSeries(data.monthlyTrend)}
                label="Home Visits"
                color="var(--sand-dark)"
              />
            </div>
          )}
        </div>
      </section>

      {/* ── Stewardship ──────────────────────────────── */}
      <section className="impact-stewardship" aria-label="Our commitment to privacy and stewardship">
        <div className="container">
          <div className="impact-stewardship__inner">
            <div className="impact-stewardship__copy reveal">
              <span className="section-label" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Our Commitment
              </span>
              <h2>Your Trust Matters</h2>
              <p>
                Every number on this page represents a life — and we guard those lives with care.
                All metrics are organization-wide aggregates. No individual names, locations, or
                case details are ever shared publicly. We follow strict data minimization practices
                and comply with international child-protection standards.
              </p>
              <p>
                Your donation is stewarded with the same seriousness. We publish audited financials
                annually and commit to using every gift in direct service of the girls in our care.
              </p>
            </div>
            <div className="impact-stewardship__cta reveal delay-2">
              <p>Ready to make a difference?</p>
              <Link to="/donate" className="btn btn-sand">
                Give Today
              </Link>
              <Link to="/about" className="btn btn-outline-white" style={{ marginTop: '12px' }}>
                Learn About Our Work
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
