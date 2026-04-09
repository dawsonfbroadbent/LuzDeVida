import { useEffect, useState } from 'react'
import {
  fetchReportsOverview,
  type ReportsOverview,
  type ReportsSafehouseComparison,
} from '../api/ReportsAPI'
import '../styles/ReportsAndAnalytics.css'

/* ── Chart components (SVG — adapted from Impact.tsx pattern) ──────────── */

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
  const PAD = { top: 20, right: 20, bottom: 40, left: 52 }
  const iW = W - PAD.left - PAD.right
  const iH = H - PAD.top - PAD.bottom

  const values = data.map(d => d.value).filter((v): v is number => v !== null)
  const hasData = values.length > 0
  if (!hasData) return (
    <figure className="reports-chart-figure" aria-label={title}>
      <figcaption>{title}</figcaption>
      <div className="reports-chart-empty">No data recorded yet</div>
    </figure>
  )

  const dataMax = Math.max(...values)
  const dataMin = Math.min(...values)
  const range = dataMax - dataMin || 1
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
    const seg = inPath ? ' L' : 'M'
    pathD += `${seg}${toX(i).toFixed(1)},${toY(d.value).toFixed(1)}`
    inPath = true
  })

  return (
    <figure className="reports-chart-figure" aria-label={title}>
      <figcaption>{title}</figcaption>
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
          const isFirst = i === 0
          const count = reportingCounts?.[i]
          if (!isFirst && !d.label.startsWith('Q1 ')) return null
          const yearLabel = d.label.split(' ')[1] ?? d.label
          return (
            <g key={`yr-${i}`}>
              <line x1={toX(i)} y1={PAD.top} x2={toX(i)} y2={PAD.top + iH + 6}
                stroke="var(--cream-darker)" strokeWidth="1" strokeDasharray="3 3" />
              <text x={toX(i)} y={H - 20} textAnchor="middle"
                fontSize="11" fontWeight="500" fill="var(--text-mid)">
                {yearLabel}
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

interface BarChartProps {
  data: { label: string; value: number }[]
  title: string
  color: string
}

function BarChart({ data, title, color }: BarChartProps) {
  const W = 560
  const H = 150
  const PAD = { top: 10, right: 16, bottom: 36, left: 44 }
  const iW = W - PAD.left - PAD.right
  const iH = H - PAD.top - PAD.bottom
  const maxVal = Math.max(...data.map(d => d.value), 1)
  const barStep = iW / Math.max(data.length, 1)
  const barW = Math.min(barStep * 0.65, 32)

  const hasData = data.some(d => d.value > 0)

  if (!hasData) return (
    <figure className="reports-chart-figure" aria-label={title}>
      <figcaption>{title}</figcaption>
      <div className="reports-chart-empty">No data recorded yet</div>
    </figure>
  )

  return (
    <figure className="reports-chart-figure" aria-label={title}>
      <figcaption>{title}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        {data.map((d, i) => {
          const barH = Math.max((d.value / maxVal) * iH, d.value > 0 ? 2 : 0)
          const x = PAD.left + i * barStep + (barStep - barW) / 2
          const y = PAD.top + iH - barH
          const showLabel = data.length <= 8 || i % Math.ceil(data.length / 8) === 0
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} fill={color} rx="3" opacity="0.82" />
              {showLabel && (
                <text x={x + barW / 2} y={H - 6} textAnchor="middle"
                  fontSize="10" fill="var(--text-mid)">
                  {d.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </figure>
  )
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function fmt(n: number, decimals = 0): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: decimals })
}

function fmtPct(n: number): string {
  return (n * 100).toFixed(1) + '%'
}

function fmtPHP(n: number): string {
  return '₱' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

type Status = 'loading' | 'success' | 'error'
type ReportSection = 'aar' | 'donations' | 'outcomes' | 'safehouses' | 'reintegration'

const CURRENT_YEAR = new Date().getFullYear()
const AVAILABLE_YEARS = Array.from(
  { length: CURRENT_YEAR - 2021 },
  (_, i) => 2022 + i
)

const SECTION_LABELS: { id: ReportSection; label: string }[] = [
  { id: 'aar',           label: 'Accomplishment Report' },
  { id: 'donations',     label: 'Donation Trends' },
  { id: 'outcomes',      label: 'Resident Outcomes' },
  { id: 'safehouses',    label: 'Safehouse Performance' },
  { id: 'reintegration', label: 'Reintegration' },
]

/* ── Column best-value highlighting ──────────────────────────────────────── */
type NumericKey = keyof Pick<
  ReportsSafehouseComparison,
  | 'active_residents'
  | 'occupancy_rate'
  | 'avg_education_progress'
  | 'avg_health_score'
  | 'process_recording_count'
  | 'home_visitation_count'
  | 'intervention_plans_completed'
>

function bestIndex(rows: ReportsSafehouseComparison[], key: NumericKey): number {
  const vals = rows.map(r => r[key] ?? -Infinity)
  const max = Math.max(...(vals as number[]))
  return (vals as number[]).findIndex(v => v === max)
}

/* ── Main Component ───────────────────────────────────────────────────────── */

interface ReportsAndAnalyticsProps {
  embedded?: boolean
}

export default function ReportsAndAnalytics({ embedded }: ReportsAndAnalyticsProps) {
  const [status, setStatus] = useState<Status>('loading')
  const [data, setData] = useState<ReportsOverview | null>(null)
  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR)
  const [activeSection, setActiveSection] = useState<ReportSection>('aar')

  useEffect(() => {
    setStatus('loading')
    setData(null)
    fetchReportsOverview(selectedYear)
      .then(d => { setData(d); setStatus('success') })
      .catch(() => setStatus('error'))
  }, [selectedYear])

  function retry() {
    setStatus('loading')
    fetchReportsOverview(selectedYear)
      .then(d => { setData(d); setStatus('success') })
      .catch(() => setStatus('error'))
  }

  const generatedAt = data?.generated_at
    ? new Date(data.generated_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className={`reports${embedded ? ' reports--embedded' : ''}`}>
      {/* Header */}
      <div className="reports__header">
        <div>
          {!embedded && <h1 className="reports__title">Reports & Analytics</h1>}
          {embedded && <p className="reports__subtitle">
            Aggregated program insights aligned with DSWD Annual Accomplishment Report standards.
          </p>}
          {generatedAt && <p className="reports__meta">Report generated {generatedAt}</p>}
        </div>
        <div className="reports__controls">
          <span className="reports__controls-label">Year</span>
          <select
            className="reports__year-select"
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
          >
            {AVAILABLE_YEARS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Section nav */}
      <nav className="reports__section-nav" aria-label="Report sections">
        {SECTION_LABELS.map(s => (
          <button
            key={s.id}
            className={`reports__section-btn${activeSection === s.id ? ' reports__section-btn--active' : ''}`}
            onClick={() => setActiveSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {/* Loading */}
      {status === 'loading' && (
        <div className="reports__loading">
          <div className="reports__spinner" />
          <span>Loading {selectedYear} data…</span>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="reports__error">
          <p className="reports__error-title">Could not load report data</p>
          <p className="reports__error-msg">Check your connection or try again.</p>
          <button className="reports__retry-btn" onClick={retry}>Retry</button>
        </div>
      )}

      {/* Content */}
      {status === 'success' && data && (
        <>
          {activeSection === 'aar'           && <SectionAar data={data} year={selectedYear} />}
          {activeSection === 'donations'     && <SectionDonations data={data} />}
          {activeSection === 'outcomes'      && <SectionOutcomes data={data} year={selectedYear} />}
          {activeSection === 'safehouses'    && <SectionSafehouses data={data} year={selectedYear} />}
          {activeSection === 'reintegration' && <SectionReintegration data={data} year={selectedYear} />}
        </>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   Section: Annual Accomplishment Report
   ════════════════════════════════════════════════════════════════════════════ */
function SectionAar({ data, year }: { data: ReportsOverview; year: number }) {
  const a = data.aar
  return (
    <div className="reports__section">
      <p className="reports-aar-note">
        Aligned with DSWD Annual Accomplishment Report format — Caring, Healing, and Teaching service pillars.
        Data covers all program activity recorded in {year}.
      </p>

      {/* Three service pillars */}
      <div className="reports-pillars">
        {/* Caring */}
        <div className="reports-pillar">
          <div className="reports-pillar__eyebrow">Service Pillar 1</div>
          <div className="reports-pillar__title">Caring — Pagmamahal</div>
          <div className="reports-pillar__stats">
            <div className="reports-pillar__stat">
              <span className="reports-pillar__stat-label">Total Residents Served</span>
              <span className="reports-pillar__stat-value">{fmt(a.total_residents_served)}</span>
            </div>
            <div className="reports-pillar__stat">
              <span className="reports-pillar__stat-label">New Admissions</span>
              <span className="reports-pillar__stat-value">{fmt(a.new_admissions_in_year)}</span>
            </div>
            <div className="reports-pillar__stat">
              <span className="reports-pillar__stat-label">Cases Closed</span>
              <span className="reports-pillar__stat-value">{fmt(a.closed_cases_in_year)}</span>
            </div>
            <div className="reports-pillar__stat">
              <span className="reports-pillar__stat-label">Active Residents (Current)</span>
              <span className="reports-pillar__stat-value">{fmt(a.active_residents_end_of_year)}</span>
            </div>
          </div>
        </div>

        {/* Healing */}
        <div className="reports-pillar reports-pillar--healing">
          <div className="reports-pillar__eyebrow">Service Pillar 2</div>
          <div className="reports-pillar__title">Healing — Paggagamot</div>
          <div className="reports-pillar__stats">
            <div className="reports-pillar__stat">
              <span className="reports-pillar__stat-label">Medical Checkups</span>
              <span className="reports-pillar__stat-value">{fmt(a.medical_checkups_done)}</span>
            </div>
            <div className="reports-pillar__stat">
              <span className="reports-pillar__stat-label">Dental Checkups</span>
              <span className="reports-pillar__stat-value">{fmt(a.dental_checkups_done)}</span>
            </div>
            <div className="reports-pillar__stat">
              <span className="reports-pillar__stat-label">Psychological Assessments</span>
              <span className="reports-pillar__stat-value">{fmt(a.psychological_checkups_done)}</span>
            </div>
            <div className="reports-pillar__stat">
              <span className="reports-pillar__stat-label">Total Health Records</span>
              <span className="reports-pillar__stat-value">{fmt(a.total_health_records)}</span>
            </div>
          </div>
        </div>

        {/* Teaching */}
        <div className="reports-pillar reports-pillar--teaching">
          <div className="reports-pillar__eyebrow">Service Pillar 3</div>
          <div className="reports-pillar__title">Teaching — Pagtuturo</div>
          <div className="reports-pillar__stats">
            <div className="reports-pillar__stat">
              <span className="reports-pillar__stat-label">Students Enrolled</span>
              <span className="reports-pillar__stat-value">{fmt(a.students_enrolled)}</span>
            </div>
            <div className="reports-pillar__stat">
              <span className="reports-pillar__stat-label">Course Completions</span>
              <span className="reports-pillar__stat-value">{fmt(a.students_completed)}</span>
            </div>
            <div className="reports-pillar__stat">
              <span className="reports-pillar__stat-label">Avg Attendance Rate</span>
              <span className="reports-pillar__stat-value">
                {a.avg_attendance_rate > 0 ? `${a.avg_attendance_rate}%` : '—'}
              </span>
            </div>
            <div className="reports-pillar__stat">
              <span className="reports-pillar__stat-label">Counseling Sessions</span>
              <span className="reports-pillar__stat-value">{fmt(a.counseling_sessions_total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional service summary */}
      <div className="reports-aar-summary">
        <div className="reports-aar-card">
          <div className="reports-aar-card__label">Counseling & Support</div>
          <div className="reports-aar-card__stats">
            <div className="reports-aar-card__row">
              <span className="reports-aar-card__row-label">Total sessions</span>
              <span className="reports-aar-card__row-value">{fmt(a.counseling_sessions_total)}</span>
            </div>
            <div className="reports-aar-card__row">
              <span className="reports-aar-card__row-label">Total session hours</span>
              <span className="reports-aar-card__row-value">{fmt(Math.round(a.total_session_minutes / 60))}</span>
            </div>
            <div className="reports-aar-card__row">
              <span className="reports-aar-card__row-label">Sessions with progress noted</span>
              <span className="reports-aar-card__row-value">{fmt(a.sessions_with_progress_noted)}</span>
            </div>
            <div className="reports-aar-card__row">
              <span className="reports-aar-card__row-label">Sessions with concerns flagged</span>
              <span className="reports-aar-card__row-value">{fmt(a.sessions_with_concerns_flagged)}</span>
            </div>
          </div>
        </div>

        <div className="reports-aar-card">
          <div className="reports-aar-card__label">Home Visitations</div>
          <div className="reports-aar-card__stats">
            <div className="reports-aar-card__row">
              <span className="reports-aar-card__row-label">Total visits conducted</span>
              <span className="reports-aar-card__row-value">{fmt(a.home_visitations_total)}</span>
            </div>
            <div className="reports-aar-card__row">
              <span className="reports-aar-card__row-label">Visits with safety concerns</span>
              <span className="reports-aar-card__row-value">{fmt(a.home_visitations_with_safety_concerns)}</span>
            </div>
          </div>
        </div>

        <div className="reports-aar-card">
          <div className="reports-aar-card__label">Safety & Incidents</div>
          <div className="reports-aar-card__stats">
            <div className="reports-aar-card__row">
              <span className="reports-aar-card__row-label">Total incidents</span>
              <span className="reports-aar-card__row-value">{fmt(a.incidents_total)}</span>
            </div>
            <div className="reports-aar-card__row">
              <span className="reports-aar-card__row-label">Incidents resolved</span>
              <span className="reports-aar-card__row-value">{fmt(a.incidents_resolved)}</span>
            </div>
            {a.incidents_total > 0 && (
              <div className="reports-aar-card__row">
                <span className="reports-aar-card__row-label">Resolution rate</span>
                <span className="reports-aar-card__row-value">
                  {((a.incidents_resolved / a.incidents_total) * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="reports-aar-card">
          <div className="reports-aar-card__label">Funding Received</div>
          <div className="reports-aar-card__stats">
            <div className="reports-aar-card__row">
              <span className="reports-aar-card__row-label">Monetary donations</span>
              <span className="reports-aar-card__row-value">{fmtPHP(a.total_monetary_received)}</span>
            </div>
            <div className="reports-aar-card__row">
              <span className="reports-aar-card__row-label">Est. value (all donations)</span>
              <span className="reports-aar-card__row-value">{fmtPHP(a.total_in_kind_estimated)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   Section: Donation Trends
   ════════════════════════════════════════════════════════════════════════════ */
function SectionDonations({ data }: { data: ReportsOverview }) {
  const s = data.donation_summary
  const trend = data.donation_trend

  const monetarySeries = trend.map(m => ({ label: m.month_key, value: m.monetary_total }))
  const inKindSeries   = trend.map(m => ({ label: m.month_key, value: m.in_kind_total }))

  // Table: last 12 months
  const last12 = trend.slice(-12)

  return (
    <div className="reports__section">
      {/* Summary KPIs */}
      <div className="reports-stat-strip">
        <div className="reports-stat-card">
          <div className="reports-stat-card__value">{fmtPHP(s.total_monetary)}</div>
          <div className="reports-stat-card__label">Total Monetary</div>
        </div>
        <div className="reports-stat-card">
          <div className="reports-stat-card__value">{fmtPHP(s.total_in_kind_estimated)}</div>
          <div className="reports-stat-card__label">Total Est. Value</div>
        </div>
        <div className="reports-stat-card">
          <div className="reports-stat-card__value">{fmt(s.unique_donor_count)}</div>
          <div className="reports-stat-card__label">Unique Donors</div>
        </div>
        <div className="reports-stat-card">
          <div className="reports-stat-card__value">{fmt(s.recurring_donor_count)}</div>
          <div className="reports-stat-card__label">Recurring Donors</div>
        </div>
      </div>

      {/* Charts */}
      <div className="reports-donation-charts">
        <div className="reports-section-panel">
          <p className="reports-section-panel__title">Monthly Monetary Donations</p>
          <p className="reports-section-panel__subtitle">Rolling 24-month view — total amount received per month</p>
          <LineChart
            data={monetarySeries}
            title="Monthly Monetary (PHP)"
            color="var(--teal)"
            unit=""
          />
        </div>
        <div className="reports-section-panel">
          <p className="reports-section-panel__title">Monthly Est. Value</p>
          <p className="reports-section-panel__subtitle">Sum of estimated_value across all donations per month</p>
          <BarChart
            data={inKindSeries}
            title="Monthly Est. Value (PHP)"
            color="var(--sand-dark)"
          />
        </div>
      </div>

      {/* Detailed table */}
      <div className="reports-section-panel">
        <p className="reports-section-panel__title">Monthly Breakdown — Last 12 Months</p>
        <div className="reports-table-wrap">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Month</th>
                <th style={{ textAlign: 'right' }}>Monetary Total (PHP)</th>
                <th style={{ textAlign: 'right' }}>Monetary Count</th>
                <th style={{ textAlign: 'right' }}>Est. Value (PHP)</th>
                <th style={{ textAlign: 'right' }}>In-Kind Count</th>
              </tr>
            </thead>
            <tbody>
              {last12.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-light)' }}>No donation data available</td></tr>
              ) : last12.map(m => (
                <tr key={m.month_key}>
                  <td className="reports-table__td--name">{m.month_label}</td>
                  <td className="reports-table__td--number" style={{ textAlign: 'right' }}>{fmtPHP(m.monetary_total)}</td>
                  <td style={{ textAlign: 'right' }}>{fmt(m.monetary_count)}</td>
                  <td className="reports-table__td--number" style={{ textAlign: 'right' }}>{fmtPHP(m.in_kind_total)}</td>
                  <td style={{ textAlign: 'right' }}>{fmt(m.in_kind_count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   Section: Resident Outcomes
   ════════════════════════════════════════════════════════════════════════════ */
function SectionOutcomes({ data, year }: { data: ReportsOverview; year: number }) {
  const outcomes = data.quarterly_outcomes

  const edSeries  = outcomes.map(q => ({ label: q.quarter, value: q.avg_education_progress }))
  const hwSeries  = outcomes.map(q => ({ label: q.quarter, value: q.avg_health_score }))
  const attSeries = outcomes.map(q => ({ label: q.quarter, value: q.avg_attendance_rate }))
  const nutSeries = outcomes.map(q => ({ label: q.quarter, value: q.avg_nutrition_score }))
  const resSeries = outcomes.map(q => ({ label: q.quarter, value: q.active_residents }))

  const edCounts  = outcomes.map(q => q.education_record_count)
  const hwCounts  = outcomes.map(q => q.health_record_count)

  return (
    <div className="reports__section">
      <div className="reports-stat-strip" style={{ marginBottom: '1.75rem' }}>
        {outcomes.map(q => (
          <div className="reports-stat-card" key={q.quarter}>
            <div className="reports-stat-card__value">{fmt(q.active_residents)}</div>
            <div className="reports-stat-card__label">{q.quarter} residents</div>
          </div>
        ))}
      </div>

      <div className="reports-charts-grid--2col" style={{ marginBottom: 0 }}>
        <div className="reports-section-panel" style={{ marginBottom: 0 }}>
          <p className="reports-section-panel__title">Education Progress</p>
          <p className="reports-section-panel__subtitle">Average progress_percent per quarter in {year}</p>
          <LineChart
            data={edSeries}
            reportingCounts={edCounts}
            title="Avg Education Progress (%)"
            color="var(--teal)"
            unit="%"
          />
        </div>
        <div className="reports-section-panel" style={{ marginBottom: 0 }}>
          <p className="reports-section-panel__title">General Health Score</p>
          <p className="reports-section-panel__subtitle">Average health score per quarter in {year}</p>
          <LineChart
            data={hwSeries}
            reportingCounts={hwCounts}
            title="Avg Health Score"
            color="var(--blue-dark)"
            unit=""
          />
        </div>
        <div className="reports-section-panel" style={{ marginBottom: 0 }}>
          <p className="reports-section-panel__title">Attendance Rate</p>
          <p className="reports-section-panel__subtitle">Average school attendance rate per quarter</p>
          <LineChart
            data={attSeries}
            reportingCounts={edCounts}
            title="Avg Attendance Rate (%)"
            color="var(--sand-dark)"
            unit="%"
          />
        </div>
        <div className="reports-section-panel" style={{ marginBottom: 0 }}>
          <p className="reports-section-panel__title">Nutrition Score</p>
          <p className="reports-section-panel__subtitle">Average nutrition score per quarter</p>
          <LineChart
            data={nutSeries}
            reportingCounts={hwCounts}
            title="Avg Nutrition Score"
            color="var(--blue)"
            unit=""
          />
        </div>
      </div>

      <div className="reports-section-panel" style={{ marginTop: '1.75rem' }}>
        <p className="reports-section-panel__title">Active Residents per Quarter</p>
        <BarChart
          data={resSeries}
          title="Active Residents"
          color="var(--teal-light)"
        />
      </div>

      {/* Detail table */}
      <div className="reports-section-panel">
        <p className="reports-section-panel__title">Quarterly Data Table</p>
        <div className="reports-table-wrap">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Quarter</th>
                <th style={{ textAlign: 'right' }}>Active Residents</th>
                <th style={{ textAlign: 'right' }}>Avg Ed. Progress</th>
                <th style={{ textAlign: 'right' }}>Avg Attendance</th>
                <th style={{ textAlign: 'right' }}>Avg Health Score</th>
                <th style={{ textAlign: 'right' }}>Avg Nutrition</th>
                <th style={{ textAlign: 'right' }}>Ed. Records</th>
                <th style={{ textAlign: 'right' }}>Health Records</th>
              </tr>
            </thead>
            <tbody>
              {outcomes.map(q => (
                <tr key={q.quarter}>
                  <td className="reports-table__td--name">{q.quarter}</td>
                  <td className="reports-table__td--number" style={{ textAlign: 'right' }}>{fmt(q.active_residents)}</td>
                  <td style={{ textAlign: 'right' }}>{q.avg_education_progress != null ? `${q.avg_education_progress}%` : '—'}</td>
                  <td style={{ textAlign: 'right' }}>{q.avg_attendance_rate != null ? `${q.avg_attendance_rate}%` : '—'}</td>
                  <td style={{ textAlign: 'right' }}>{q.avg_health_score != null ? q.avg_health_score : '—'}</td>
                  <td style={{ textAlign: 'right' }}>{q.avg_nutrition_score != null ? q.avg_nutrition_score : '—'}</td>
                  <td style={{ textAlign: 'right' }}>{fmt(q.education_record_count)}</td>
                  <td style={{ textAlign: 'right' }}>{fmt(q.health_record_count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   Section: Safehouse Performance
   ════════════════════════════════════════════════════════════════════════════ */
function SectionSafehouses({ data, year }: { data: ReportsOverview; year: number }) {
  const rows = data.safehouse_comparisons

  if (rows.length === 0) {
    return (
      <div className="reports__section">
        <div className="reports__loading"><span>No safehouse data available for {year}.</span></div>
      </div>
    )
  }

  const bestActive    = bestIndex(rows, 'active_residents')
  const bestOccupancy = bestIndex(rows, 'occupancy_rate')
  const bestEd        = rows.some(r => r.avg_education_progress != null)
    ? rows.map(r => r.avg_education_progress ?? -Infinity).indexOf(Math.max(...rows.map(r => r.avg_education_progress ?? -Infinity)))
    : -1
  const bestHw        = rows.some(r => r.avg_health_score != null)
    ? rows.map(r => r.avg_health_score ?? -Infinity).indexOf(Math.max(...rows.map(r => r.avg_health_score ?? -Infinity)))
    : -1
  const bestSessions  = bestIndex(rows, 'process_recording_count')
  const bestVisits    = bestIndex(rows, 'home_visitation_count')
  const bestCompleted = bestIndex(rows, 'intervention_plans_completed')

  const edChartData  = rows.map(r => ({ label: r.safehouse_code ?? r.safehouse_name, value: r.avg_education_progress ?? 0 }))
  const hwChartData  = rows.map(r => ({ label: r.safehouse_code ?? r.safehouse_name, value: r.avg_health_score ?? 0 }))
  const sessChartData = rows.map(r => ({ label: r.safehouse_code ?? r.safehouse_name, value: r.process_recording_count }))

  return (
    <div className="reports__section">
      <div className="reports-section-panel">
        <p className="reports-section-panel__title">Safehouse Comparison — {year}</p>
        <p className="reports-section-panel__subtitle">
          Cells highlighted in teal indicate the top-performing safehouse for that metric.
          Education and health scores are weighted averages from monthly metrics.
        </p>
        <div className="reports-table-wrap">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Safehouse</th>
                <th>Region</th>
                <th style={{ textAlign: 'right' }}>Active</th>
                <th style={{ textAlign: 'right' }}>Capacity</th>
                <th style={{ textAlign: 'right' }}>Occupancy</th>
                <th style={{ textAlign: 'right' }}>Avg Ed. %</th>
                <th style={{ textAlign: 'right' }}>Avg Health</th>
                <th style={{ textAlign: 'right' }}>Sessions</th>
                <th style={{ textAlign: 'right' }}>Visits</th>
                <th style={{ textAlign: 'right' }}>Incidents</th>
                <th style={{ textAlign: 'right' }}>Plans Active</th>
                <th style={{ textAlign: 'right' }}>Plans Done</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.safehouse_id}>
                  <td className="reports-table__td--name">{r.safehouse_name}</td>
                  <td>{r.region ?? '—'}</td>
                  <td className={`reports-table__td--number${i === bestActive ? ' reports-table__td--best' : ''}`} style={{ textAlign: 'right' }}>
                    {fmt(r.active_residents)}
                  </td>
                  <td style={{ textAlign: 'right' }}>{r.capacity != null ? fmt(r.capacity) : '—'}</td>
                  <td className={`${i === bestOccupancy ? 'reports-table__td--best' : ''}`} style={{ textAlign: 'right' }}>
                    {r.capacity != null ? fmtPct(r.occupancy_rate) : '—'}
                  </td>
                  <td className={`${i === bestEd ? 'reports-table__td--best' : ''}`} style={{ textAlign: 'right' }}>
                    {r.avg_education_progress != null ? `${r.avg_education_progress}%` : '—'}
                  </td>
                  <td className={`${i === bestHw ? 'reports-table__td--best' : ''}`} style={{ textAlign: 'right' }}>
                    {r.avg_health_score != null ? r.avg_health_score : '—'}
                  </td>
                  <td className={`reports-table__td--number${i === bestSessions ? ' reports-table__td--best' : ''}`} style={{ textAlign: 'right' }}>
                    {fmt(r.process_recording_count)}
                  </td>
                  <td className={`reports-table__td--number${i === bestVisits ? ' reports-table__td--best' : ''}`} style={{ textAlign: 'right' }}>
                    {fmt(r.home_visitation_count)}
                  </td>
                  <td style={{ textAlign: 'right', color: r.incident_count > 0 ? 'var(--sand-dark)' : undefined }}>
                    {fmt(r.incident_count)}
                  </td>
                  <td style={{ textAlign: 'right' }}>{fmt(r.intervention_plans_active)}</td>
                  <td className={`reports-table__td--number${i === bestCompleted ? ' reports-table__td--best' : ''}`} style={{ textAlign: 'right' }}>
                    {fmt(r.intervention_plans_completed)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mini bar charts */}
      <div className="reports-safehouse-charts">
        <div className="reports-section-panel" style={{ marginBottom: 0 }}>
          <p className="reports-section-panel__title">Avg Education Progress</p>
          <BarChart data={edChartData} title="Avg Education Progress (%)" color="var(--teal)" />
        </div>
        <div className="reports-section-panel" style={{ marginBottom: 0 }}>
          <p className="reports-section-panel__title">Avg Health Score</p>
          <BarChart data={hwChartData} title="Avg Health Score" color="var(--blue-dark)" />
        </div>
        <div className="reports-section-panel" style={{ marginBottom: 0 }}>
          <p className="reports-section-panel__title">Counseling Sessions</p>
          <BarChart data={sessChartData} title="Process Recordings" color="var(--sand-dark)" />
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   Section: Reintegration
   ════════════════════════════════════════════════════════════════════════════ */
function SectionReintegration({ data, year }: { data: ReportsOverview; year: number }) {
  const r = data.reintegration

  const chartData = r.by_type.map(t => ({
    label: t.reintegration_type.length > 14 ? t.reintegration_type.slice(0, 13) + '…' : t.reintegration_type,
    value: t.count,
  }))

  return (
    <div className="reports__section">
      <div className="reports-reintegration-kpis">
        <div className="reports-stat-card">
          <div className="reports-stat-card__value">{fmt(r.total_closed)}</div>
          <div className="reports-stat-card__label">Cases Closed in {year}</div>
        </div>
        <div className="reports-stat-card">
          <div className="reports-stat-card__value">{fmt(r.total_reintegrated)}</div>
          <div className="reports-stat-card__label">Successfully Reintegrated</div>
        </div>
        <div className="reports-stat-card reports-stat-card--rate">
          <div className="reports-stat-card__value">{fmtPct(r.reintegration_rate)}</div>
          <div className="reports-stat-card__label">Reintegration Rate</div>
        </div>
        <div className="reports-stat-card">
          <div className="reports-stat-card__value">{fmt(r.avg_days_to_close)}</div>
          <div className="reports-stat-card__label">Avg Days to Case Closure</div>
        </div>
      </div>

      {r.total_closed === 0 && (
        <p style={{ color: 'var(--text-light)', fontSize: '0.92rem' }}>
          No closed cases recorded in {year}.
        </p>
      )}

      {r.by_type.length > 0 && (
        <>
          <div className="reports-section-panel">
            <p className="reports-section-panel__title">Reintegration by Type</p>
            <p className="reports-section-panel__subtitle">Distribution of closed cases in {year} by reintegration pathway</p>
            <BarChart
              data={chartData}
              title="Cases by Reintegration Type"
              color="var(--teal)"
            />
          </div>

          <div className="reports-section-panel">
            <p className="reports-section-panel__title">Breakdown Table</p>
            <div className="reports-table-wrap">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Reintegration Type</th>
                    <th style={{ textAlign: 'right' }}>Count</th>
                    <th style={{ textAlign: 'right' }}>% of Closed Cases</th>
                  </tr>
                </thead>
                <tbody>
                  {r.by_type.map(t => (
                    <tr key={t.reintegration_type}>
                      <td className="reports-table__td--name">{t.reintegration_type}</td>
                      <td className="reports-table__td--number" style={{ textAlign: 'right' }}>{fmt(t.count)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="reports-badge reports-badge--teal">{fmtPct(t.rate)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
