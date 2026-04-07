import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { fetchPublicImpact, type PublicImpactData, type PublicImpactQuarterlyTrendItem } from '../api/publicImpact'

/* ── SVG Line Chart ──────────────────────────────────────── */
interface LineChartProps {
  data: { label: string; value: number | null }[]
  reportingCounts?: number[]
  title: string
  color: string
  unit?: string
}

function LineChart({ data, title, color, unit = '', reportingCounts }: LineChartProps) {
  const W = 560
  const H = 170
  const PAD = { top: 20, right: 20, bottom: 40, left: 48 }
  const iW = W - PAD.left - PAD.right
  const iH = H - PAD.top - PAD.bottom

  const values = data.map(d => d.value).filter((v): v is number => v !== null)
  const hasData = values.length > 0
  if (!hasData) return (
    <figure className="impact-linechart">
      <figcaption className="impact-chart__label">{title}</figcaption>
      <div className="impact-chart__empty">No data recorded yet</div>
    </figure>
  )

  const dataMax = Math.max(...values)
  const dataMin = Math.min(...values)
  const range = dataMax - dataMin || 1
  // Nice y-axis ceiling: round up to next clean step
  const step = Math.pow(10, Math.floor(Math.log10(range))) / 2
  const yMax = Math.ceil(dataMax / step) * step
  const yMin = Math.max(0, Math.floor(dataMin / step) * step - step)
  const yRange = yMax - yMin || 1

  const gridCount = 4
  const gridVals = Array.from({ length: gridCount + 1 }, (_, i) =>
    Math.round((yMin + (yMax - yMin) * (i / gridCount)) * 10) / 10
  )

  const toX = (i: number) => PAD.left + (i / Math.max(data.length - 1, 1)) * iW
  const toY = (v: number) => PAD.top + (1 - (v - yMin) / yRange) * iH

  let pathD = ''
  let inPath = false
  data.forEach((d, i) => {
    if (d.value === null) { inPath = false; return }
    const seg = inPath ? ` L` : `M`
    pathD += `${seg}${toX(i).toFixed(1)},${toY(d.value).toFixed(1)}`
    inPath = true
  })

  return (
    <figure className="impact-linechart" aria-label={title}>
      <figcaption className="impact-chart__label">{title}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        {gridVals.map((v, i) => (
          <g key={i}>
            <line x1={PAD.left} y1={toY(v)} x2={W - PAD.right} y2={toY(v)}
              stroke="var(--cream-darker)" strokeWidth="1" />
            <text x={PAD.left - 8} y={toY(v)} textAnchor="end" fontSize="11"
              fill="var(--text-light)" dominantBaseline="middle">
              {v}{unit}
            </text>
          </g>
        ))}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) =>
          d.value !== null
            ? <circle key={i} cx={toX(i)} cy={toY(d.value)} r="3.5" fill={color} />
            : null
        )}
        {data.map((d, i) => {
          const isQ1 = d.label.startsWith('Q1 ')
          const year = d.label.split(' ')[1]
          if (!isQ1) return null
          const count = reportingCounts?.[i]
          return (
            <g key={i}>
              <line x1={toX(i)} y1={PAD.top} x2={toX(i)} y2={PAD.top + iH + 6}
                stroke="var(--cream-darker)" strokeWidth="1" strokeDasharray="3 3" />
              <text x={toX(i)} y={H - 20} textAnchor="middle"
                fontSize="11" fontWeight="500" fill="var(--text-mid)">
                {year}
              </text>
              {count != null && (
                <text x={toX(i)} y={H - 7} textAnchor="middle"
                  fontSize="9" fill="var(--text-light)">
                  n={count}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </figure>
  )
}

/* ── SVG Bar Chart ───────────────────────────────────────── */
interface BarChartProps {
  data: { label: string; value: number }[]
  title: string
  color: string
}

function BarChart({ data, title, color }: BarChartProps) {
  const W = 560
  const H = 140
  const PAD = { top: 10, right: 16, bottom: 36, left: 40 }
  const iW = W - PAD.left - PAD.right
  const iH = H - PAD.top - PAD.bottom
  const maxVal = Math.max(...data.map(d => d.value), 1)
  const barStep = iW / data.length
  const barW = Math.min(barStep * 0.6, 28)

  return (
    <figure className="impact-barchart" aria-label={title}>
      <figcaption className="impact-chart__label">{title}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        {data.map((d, i) => {
          const barH = Math.max((d.value / maxVal) * iH, d.value > 0 ? 2 : 0)
          const x = PAD.left + i * barStep + (barStep - barW) / 2
          const y = PAD.top + iH - barH
          const isQ1 = d.label.startsWith('Q1 ')
          const year = d.label.split(' ')[1]
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} fill={color} rx="2" opacity="0.8" />
              {isQ1 && (
                <>
                  <line x1={x + barW / 2} y1={PAD.top} x2={x + barW / 2} y2={PAD.top + iH + 6}
                    stroke="var(--cream-darker)" strokeWidth="1" strokeDasharray="3 3" />
                  <text x={x + barW / 2} y={H - 6} textAnchor="middle"
                    fontSize="11" fontWeight="500" fill="var(--text-mid)">
                    {year}
                  </text>
                </>
              )}
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
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function toSeries(trend: PublicImpactQuarterlyTrendItem[], key: keyof PublicImpactQuarterlyTrendItem) {
  return trend.map(t => ({ label: t.quarter, value: t[key] as number | null }))
}

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
  const trend = data?.quarterlyTrend ?? []

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

            <Link to="/donate" className="btn btn-sand">Give Today</Link>
          </div>
        </div>
      </section>

      {/* ── Error Banner ─────────────────────────────── */}
      {status === 'error' && (
        <div className="impact-error-banner" role="alert">
          <p>Live metrics are temporarily unavailable. The information below reflects our current mission and impact.</p>
        </div>
      )}

      {/* ── KPI Strip ────────────────────────────────── */}
      <section className="impact-kpi" aria-label="Key impact metrics">
        <div className="container">
          <div className="impact-kpi__grid">
            <div className="kpi-card kpi-card--featured reveal">
              {status === 'loading' ? <div className="impact-skeleton impact-skeleton--kpi" /> : (
                <>
                  <div className="kpi-card__number">{data?.okr.value ?? '—'}</div>
                  <div className="kpi-card__label">{data?.okr.label ?? 'Girls supported'}</div>
                  <p className="kpi-card__rationale">{data?.okr.rationale ?? ''}</p>
                </>
              )}
            </div>
            <div className="kpi-card reveal delay-1">
              {status === 'loading' ? <div className="impact-skeleton impact-skeleton--kpi" /> : (
                <>
                  <div className="kpi-card__number">{data?.highlights.safehousesInNetwork ?? '—'}</div>
                  <div className="kpi-card__label">Safehouses in network</div>
                  <p className="kpi-card__rationale">Safe homes actively serving girls in our care.</p>
                </>
              )}
            </div>
            <div className="kpi-card reveal delay-2">
              {status === 'loading' ? <div className="impact-skeleton impact-skeleton--kpi" /> : (
                <>
                  <div className="kpi-card__number">{data?.highlights.supportersAllTime ?? '—'}</div>
                  <div className="kpi-card__label">Supporters</div>
                  <p className="kpi-card__rationale">Donors and partners who stand behind our mission.</p>
                </>
              )}
            </div>
            <div className="kpi-card reveal delay-3">
              {status === 'loading' ? <div className="impact-skeleton impact-skeleton--kpi" /> : (
                <>
                  <div className="kpi-card__number">{data?.highlights.careTouchpointsAllTime ?? '—'}</div>
                  <div className="kpi-card__label">Care touchpoints (all time)</div>
                  <p className="kpi-card__rationale">Counseling sessions and home visits delivered since founding.</p>
                </>
              )}
            </div>
          </div>
          {data?.metricsAsOf && (
            <p className="impact-kpi__asof">Metrics as of {formatDate(data.metricsAsOf)}</p>
          )}
        </div>
      </section>

      {/* ── Progress Over Time ────────────────────────── */}
      <section className="impact-trends">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-label">Progress Over Time</span>
            <h2>How Girls Are Growing</h2>
            <p>
              Organization-wide quarterly averages for education progress and wellness scores
              across all safehouses since founding.
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
            <>
              <div className="impact-charts-row">
                <LineChart
                  data={toSeries(trend, 'avgEducationProgress')}
                  reportingCounts={trend.map(t => t.progressReportingCount)}
                  title="Education Progress (%)"
                  color="var(--blue)"
                  unit="%"
                />
                <LineChart
                  data={toSeries(trend, 'avgHealthScore')}
                  reportingCounts={trend.map(t => t.progressReportingCount)}
                  title="Wellness Score"
                  color="var(--teal)"
                />
              </div>
              <p className="impact-charts-note">
                Averages are weighted by active residents across reporting safehouses.
                Quarters with fewer safehouses contributing (n) may reflect a smaller sample.
              </p>
            </>
          )}
        </div>
      </section>

      {/* ── Care in Action ───────────────────────────── */}
      <section className="impact-care">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-label">Care in Action</span>
            <h2>Quarterly Activity</h2>
            <p>
              Active residents, counseling sessions, and home visits across all safehouses
              since founding — aggregated by quarter.
            </p>
          </div>

          {status === 'loading' ? (
            <div className="impact-care-grid">
              <div className="impact-skeleton impact-skeleton--chart" />
              <div className="impact-skeleton impact-skeleton--chart" />
              <div className="impact-skeleton impact-skeleton--chart" />
            </div>
          ) : status === 'error' || !data ? (
            <p className="impact-no-data">Activity charts will appear once data is recorded.</p>
          ) : (
            <div className="impact-care-grid">
              <BarChart data={toSeries(trend, 'activeResidents') as { label: string; value: number }[]}
                title="Active Residents (avg/quarter)" color="var(--blue)" />
              <BarChart data={toSeries(trend, 'counselingSessions') as { label: string; value: number }[]}
                title="Counseling Sessions" color="var(--teal)" />
              <BarChart data={toSeries(trend, 'homeVisits') as { label: string; value: number }[]}
                title="Home Visits" color="var(--sand-dark)" />
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
              <Link to="/donate" className="btn btn-sand">Give Today</Link>
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
