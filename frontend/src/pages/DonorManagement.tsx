import React, { useEffect, useState } from 'react'
import {
  fetchSupporterStats,
  fetchSupporterTypes,
  fetchSupporters,
  fetchSupporterById,
  createSupporter,
  updateSupporter,
  type SupporterStats,
  type SupporterListItem,
  type SupporterDetail,
  type CreateSupporterPayload,
} from '../api/SupporterAPI'
import {
  fetchDonorChurnPredictions,
  type DonorChurnPrediction,
} from '../api/MlPredictionsAPI'
import '../styles/DonorManagement.css'

type ModalMode = 'view' | 'create' | 'edit'
type SortDir = 'asc' | 'desc'

// ── All filter/sort/page state in one object so there's a single reactive
//    effect and no stale-closure issues between sort, page, and filters. ──────
interface Filters {
  page: number
  pageSize: number
  search: string        // debounced value sent to API
  status: string
  type: string
  contribution: string
  region: string
  sortField: string
  sortDir: SortDir
}

const INITIAL_FILTERS: Filters = {
  page: 1,
  pageSize: 25,
  search: '',
  status: 'All',
  type: 'All',
  contribution: 'All',
  region: 'All',
  sortField: 'total_given',
  sortDir: 'desc',
}

const EMPTY_FORM: CreateSupporterPayload = {
  supporterType: 'individual',
  displayName: '',
  organizationName: '',
  firstName: '',
  lastName: '',
  relationshipType: 'supporter',
  region: '',
  country: '',
  email: '',
  phone: '',
  status: 'active',
  acquisitionChannel: '',
}

const PILL_LABELS: Record<string, string> = {
  monetary: 'Monetary',
  InKind: 'In-Kind',
  time: 'Time',
  skills: 'Skills',
  SocialMedia: 'Social',
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 9999]

function formatCurrency(amount: number | null | undefined) {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return '—'
  const d = new Date(dateString)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}

// Normalize status to CSS-safe lowercase class modifier
function statusClass(status: string | null | undefined): string {
  return (status ?? 'unknown').toLowerCase().replace(/[^a-z0-9]/g, '-')
}

function SortIcon({ col, filters }: { col: string; filters: Filters }) {
  if (col !== filters.sortField) return <span className="dm-sort-icon dm-sort-icon--off">↕</span>
  return <span className="dm-sort-icon dm-sort-icon--on">{filters.sortDir === 'asc' ? '↑' : '↓'}</span>
}

interface DonorManagementProps {
  embedded?: boolean
}

export default function DonorManagement({ embedded = false }: DonorManagementProps) {
  // ── Consolidated filter/sort/pagination state ─────────────
  const [filters, setFilters] = useState<Filters>({ ...INITIAL_FILTERS })
  // searchInput drives the text box; we debounce it into filters.search
  const [searchInput, setSearchInput] = useState('')

  // ── Data ──────────────────────────────────────────────────
  const [stats, setStats] = useState<SupporterStats | null>(null)
  const [supporters, setSupporters] = useState<SupporterListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [supporterTypes, setSupporterTypes] = useState<string[]>([])
  const [selectedSupporter, setSelectedSupporter] = useState<SupporterDetail | null>(null)

  // ── UI ────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [expandedDonation, setExpandedDonation] = useState<number | null>(null)

  // ── Modal ─────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('view')
  const [editingSupporterId, setEditingSupporterId] = useState<number | null>(null)
  const [formData, setFormData] = useState<CreateSupporterPayload>({ ...EMPTY_FORM })
  const [formError, setFormError] = useState<string | null>(null)
  const [churnMap, setChurnMap] = useState<Map<number, DonorChurnPrediction>>(new Map())

  // ── Derived ───────────────────────────────────────────────
  const effectivePageSize = filters.pageSize >= 9999 ? Math.max(totalCount, 1) : filters.pageSize
  const totalPages = Math.max(1, Math.ceil(totalCount / effectivePageSize))
  const rangeStart = Math.min((filters.page - 1) * effectivePageSize + 1, totalCount)
  const rangeEnd = Math.min(filters.page * effectivePageSize, totalCount)
  const regions = Array.from(new Set(supporters.map((s) => s.region).filter(Boolean) as string[])).sort()

  // ── Debounce search input → update filters.search ────────
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters(f => ({ ...f, search: searchInput, page: 1 }))
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  // ── Load stats + types on mount ──────────────────────────
  useEffect(() => {
    loadStats()
    loadSupporterTypes()
    loadChurnPredictions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Single reactive effect: fires whenever filters change.
  //    All params come from the filters object — no stale closures. ─────────
  useEffect(() => {
    doLoadSupporters(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  // ── Data loaders ──────────────────────────────────────────
  async function loadStats() {
    setStatsLoading(true)
    try {
      setStats(await fetchSupporterStats())
    } catch { /* non-critical */ } finally {
      setStatsLoading(false)
    }
  }

  async function loadSupporterTypes() {
    try {
      setSupporterTypes(await fetchSupporterTypes())
    } catch { /* non-critical */ }
  }

  async function loadChurnPredictions() {
    try {
      const predictions = await fetchDonorChurnPredictions()
      const map = new Map<number, DonorChurnPrediction>()
      for (const p of predictions) map.set(p.supporter_id, p)
      setChurnMap(map)
    } catch { /* non-critical */ }
  }

  async function doLoadSupporters(f: Filters) {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchSupporters({
        page: f.page,
        pageSize: f.pageSize,
        search: f.search || undefined,
        status: f.status !== 'All' ? f.status : undefined,
        supporter_type: f.type !== 'All' ? f.type : undefined,
        contribution_type: f.contribution !== 'All' ? f.contribution : undefined,
        region: f.region !== 'All' ? f.region : undefined,
        sortBy: f.sortField,
        sortDir: f.sortDir,
      })
      setSupporters(result.items)
      setTotalCount(result.totalCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load supporters.')
    } finally {
      setLoading(false)
    }
  }

  // ── Sort: clicking a header toggles dir if same field, resets to desc otherwise
  function handleSort(field: string) {
    setFilters(f => ({
      ...f,
      page: 1,
      sortField: field,
      sortDir: f.sortField === field ? (f.sortDir === 'asc' ? 'desc' : 'asc') : 'desc',
    }))
  }

  function handlePageSizeChange(newSize: number) {
    setFilters(f => ({ ...f, pageSize: newSize, page: 1 }))
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return
    setFilters(f => ({ ...f, page }))
  }

  // ── Modal actions ─────────────────────────────────────────
  async function openViewModal(id: number) {
    setFormError(null)
    setExpandedDonation(null)
    try {
      setSelectedSupporter(await fetchSupporterById(id))
      setModalMode('view')
      setShowModal(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load supporter details.')
    }
  }

  function openCreateModal() {
    setFormData({ ...EMPTY_FORM })
    setFormError(null)
    setModalMode('create')
    setShowModal(true)
  }

  async function openEditModal(s: SupporterListItem) {
    setFormError(null)
    try {
      const detail = await fetchSupporterById(s.supporterId)
      setFormData({
        supporterType: detail.supporterType ?? '',
        displayName: detail.displayName ?? '',
        organizationName: detail.organizationName ?? '',
        firstName: detail.firstName ?? '',
        lastName: detail.lastName ?? '',
        relationshipType: detail.relationshipType ?? '',
        region: detail.region ?? '',
        country: detail.country ?? '',
        email: detail.email ?? '',
        phone: detail.phone ?? '',
        status: detail.status ?? 'active',
        acquisitionChannel: detail.acquisitionChannel ?? '',
      })
    } catch {
      setFormData({ ...EMPTY_FORM, supporterType: s.supporterType ?? '', region: s.region ?? '', status: s.status ?? 'active' })
    }
    setEditingSupporterId(s.supporterId)
    setModalMode('edit')
    setShowModal(true)
  }

  function openEditFromView() {
    if (!selectedSupporter) return
    setFormData({
      supporterType: selectedSupporter.supporterType ?? '',
      displayName: selectedSupporter.displayName ?? '',
      organizationName: selectedSupporter.organizationName ?? '',
      firstName: selectedSupporter.firstName ?? '',
      lastName: selectedSupporter.lastName ?? '',
      relationshipType: selectedSupporter.relationshipType ?? '',
      region: selectedSupporter.region ?? '',
      country: selectedSupporter.country ?? '',
      email: selectedSupporter.email ?? '',
      phone: selectedSupporter.phone ?? '',
      status: selectedSupporter.status ?? 'active',
      acquisitionChannel: selectedSupporter.acquisitionChannel ?? '',
    })
    setEditingSupporterId(selectedSupporter.supporterId)
    setFormError(null)
    setModalMode('edit')
  }

  function closeModal() {
    setShowModal(false)
    setSelectedSupporter(null)
    setEditingSupporterId(null)
    setFormData({ ...EMPTY_FORM })
    setFormError(null)
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    const resolvedName = formData.displayName || `${formData.firstName ?? ''} ${formData.lastName ?? ''}`.trim()
    if (!resolvedName) {
      setFormError('Please enter a display name or first and last name.')
      return
    }
    setSubmitting(true)
    setFormError(null)
    try {
      if (modalMode === 'create') {
        await createSupporter(formData)
        setSuccessMessage('Supporter created successfully.')
      } else if (modalMode === 'edit' && editingSupporterId !== null) {
        await updateSupporter(editingSupporterId, formData)
        setSuccessMessage('Supporter updated successfully.')
      }
      closeModal()
      await Promise.all([loadStats(), doLoadSupporters(filters)])
      setTimeout(() => setSuccessMessage(null), 4000)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'An error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  const pageNums = getPageNumbers(filters.page, totalPages)

  // ── Render ────────────────────────────────────────────────
  return (
    <div className={`donor-management${embedded ? ' donor-management--embedded' : ''}`}>
      {/* Header */}
      <div className="dm-header">
        <div>
          <h1>Donor Management</h1>
          <p className="dm-subtitle">Supporter profiles, contributions, and allocation tracking</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>Add Supporter</button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="dm-alert dm-alert--error">
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}
      {successMessage && (
        <div className="dm-alert dm-alert--success">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)}>✕</button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="dm-stats-grid">
        <div className="dm-stat-card dm-stat-card--total">
          <p className="dm-stat-card__label">Total Supporters</p>
          <p className="dm-stat-card__value">{statsLoading ? <span className="dm-skeleton dm-skeleton--value" /> : (stats?.totalSupporters ?? 0)}</p>
          <p className="dm-stat-card__sub">All time</p>
        </div>
        <div className="dm-stat-card dm-stat-card--active">
          <p className="dm-stat-card__label">Active</p>
          <p className="dm-stat-card__value">{statsLoading ? <span className="dm-skeleton dm-skeleton--value" /> : (stats?.activeSupporters ?? 0)}</p>
          <p className="dm-stat-card__sub">Currently engaged</p>
        </div>
        <div className="dm-stat-card dm-stat-card--monetary">
          <p className="dm-stat-card__label">Total Donated</p>
          <p className="dm-stat-card__value dm-stat-card__value--currency">{statsLoading ? <span className="dm-skeleton dm-skeleton--value" /> : formatCurrency(stats?.totalMonetaryDonated ?? 0)}</p>
          <p className="dm-stat-card__sub">Monetary contributions</p>
        </div>
        <div className="dm-stat-card dm-stat-card--recurring">
          <p className="dm-stat-card__label">Recurring Donors</p>
          <p className="dm-stat-card__value">{statsLoading ? <span className="dm-skeleton dm-skeleton--value" /> : (stats?.recurringDonorsCount ?? 0)}</p>
          <p className="dm-stat-card__sub">Monthly givers</p>
        </div>
        <div className="dm-stat-card dm-stat-card--inkind">
          <p className="dm-stat-card__label">In-Kind Donors</p>
          <p className="dm-stat-card__value">{statsLoading ? <span className="dm-skeleton dm-skeleton--value" /> : (stats?.inKindDonorsCount ?? 0)}</p>
          <p className="dm-stat-card__sub">Goods &amp; services</p>
        </div>
        <div className="dm-stat-card dm-stat-card--avg">
          <p className="dm-stat-card__label">Avg Donation</p>
          <p className="dm-stat-card__value dm-stat-card__value--currency">{statsLoading ? <span className="dm-skeleton dm-skeleton--value" /> : formatCurrency(stats?.avgDonation ?? 0)}</p>
          <p className="dm-stat-card__sub">Per monetary gift</p>
        </div>
      </div>

      {/* Filters */}
      <div className="dm-filters">
        <input
          type="text"
          className="dm-search"
          placeholder="Search by name or email…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <div className="dm-filter-row">
          <select
            className="dm-filter-select"
            value={filters.status}
            onChange={(e) => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            className="dm-filter-select"
            value={filters.type}
            onChange={(e) => setFilters(f => ({ ...f, type: e.target.value, page: 1 }))}
          >
            <option value="All">All Types</option>
            {supporterTypes.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          <select
            className="dm-filter-select"
            value={filters.contribution}
            onChange={(e) => setFilters(f => ({ ...f, contribution: e.target.value, page: 1 }))}
          >
            <option value="All">All Contributions</option>
            <option value="monetary">Monetary</option>
            <option value="InKind">In-Kind</option>
            <option value="time">Time</option>
            <option value="skills">Skills</option>
            <option value="SocialMedia">Social Media</option>
          </select>
          <select
            className="dm-filter-select"
            value={filters.region}
            onChange={(e) => setFilters(f => ({ ...f, region: e.target.value, page: 1 }))}
          >
            <option value="All">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <p className="dm-filter-summary">
          {totalCount === 0
            ? 'No supporters match your filters.'
            : `Showing ${rangeStart}–${rangeEnd} of ${totalCount} supporter${totalCount !== 1 ? 's' : ''}`}
        </p>
      </div>

      <div className="dm-risk-info-note">
        <strong>Churn Risk & Tier:</strong> Generated by a machine learning model that analyzes donor giving
        patterns, frequency, recency, and engagement to predict the likelihood of a donor lapsing.
        Tiers: High, Medium, Low. Here are some of the most influential factors that contribute to churn risk 
        and what can be done to mitigate it:
          <p><strong>Invite donors to support more programs.</strong> Donors who fund multiple program areas are 69% less likely to churn. Share updates about programs a donor hasn't yet supported and make it easy for them to broaden their giving.</p>
          <p><strong>Encourage in-kind contributions.</strong> Donors who have given goods, services, or skills are 61% less likely to churn. When a donor shows signs of going quiet, an in-kind ask can be a more natural re-engagement than requesting money again.</p>
          <p><strong>Leverage event-based giving.</strong> Donors acquired or engaged through events show significantly lower churn rates. Prioritize inviting at-risk donors to upcoming events as a low-pressure way to reconnect with the organization.</p>
          <p><strong>Invest in social media referrals.</strong> Donors who discovered Luz de Vida through social media are substantially more retained. Encourage current donors to share posts and tag others, since socially-referred donors tend to feel a personal connection to the cause.</p>
      </div>

      {/* Table */}
      <div className="dm-table-section">
        {loading ? (
          <div className="dm-loading">Loading supporters…</div>
        ) : supporters.length === 0 ? (
          <div className="dm-empty">No supporters match your filters.</div>
        ) : (
          <table className="dm-table">
            <thead>
              <tr>
                <th className="dm-th-sortable" onClick={() => handleSort('name')}>
                  Name <SortIcon col="name" filters={filters} />
                </th>
                <th className="dm-th-sortable" onClick={() => handleSort('type')}>
                  Type <SortIcon col="type" filters={filters} />
                </th>
                <th className="dm-th-sortable" onClick={() => handleSort('status')}>
                  Status <SortIcon col="status" filters={filters} />
                </th>
                <th className="dm-th-sortable" onClick={() => handleSort('total_given')}>
                  Total Monetary Given <SortIcon col="total_given" filters={filters} />
                </th>
                <th>Est. Value</th>
                <th className="dm-th-sortable" onClick={() => handleSort('last_donation')}>
                  Last Donation <SortIcon col="last_donation" filters={filters} />
                </th>
                <th className="dm-th-sortable" onClick={() => handleSort('region')}>
                  Region <SortIcon col="region" filters={filters} />
                </th>
                <th className="dm-th-sortable" onClick={() => handleSort('churn_risk')}>
                  Churn Risk <SortIcon col="churn_risk" filters={filters} />
                </th>
                <th className="dm-th-sortable" onClick={() => handleSort('risk_tier')}>
                  Risk Tier <SortIcon col="risk_tier" filters={filters} />
                </th>
                <th>Contributions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {supporters.map((s) => (
                <tr key={s.supporterId}>
                  <td className="dm-td-name">{s.displayName}</td>
                  <td>{s.supporterType ?? '—'}</td>
                  <td>
                    <span className={`badge badge-${statusClass(s.status)}`}>
                      {s.status ?? 'unknown'}
                    </span>
                  </td>
                  <td className="dm-td-currency">{formatCurrency(s.totalGiven)}</td>
                  <td className="dm-td-currency">{s.inKindEstimatedValue > 0 ? formatCurrency(s.inKindEstimatedValue) : '—'}</td>
                  <td>{formatDate(s.lastDonationDate)}</td>
                  <td>{s.region ?? '—'}</td>
                  <td className="risk-score">
                    {churnMap.get(s.supporterId)?.churn_risk_score != null
                      ? (churnMap.get(s.supporterId)!.churn_risk_score * 100).toFixed(1) + '%'
                      : '—'}
                  </td>
                  <td>
                    {churnMap.get(s.supporterId) ? (
                      <span className={`badge badge-risk-${churnMap.get(s.supporterId)!.risk_tier.toLowerCase()}`}>
                        {churnMap.get(s.supporterId)!.risk_tier}
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    {s.contributionTypes.length > 0
                      ? s.contributionTypes.map((ct) => PILL_LABELS[ct] ?? ct).join(', ')
                      : '—'}
                  </td>
                  <td>
                    <div className="dm-actions">
                      <button className="dm-btn-view" onClick={() => openViewModal(s.supporterId)}>View</button>
                      <button className="dm-btn-edit" onClick={() => openEditModal(s)}>Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalCount > 0 && (
        <div className="dm-pagination">
          <div className="dm-page-size">
            <label htmlFor="dm-page-size-select">Per page</label>
            <select
              id="dm-page-size-select"
              value={filters.pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n === 9999 ? 'All' : n}</option>
              ))}
            </select>
          </div>

          {totalPages > 1 && (
            <div className="dm-page-controls">
              <button className="dm-page-btn dm-page-btn--arrow" onClick={() => goToPage(1)} disabled={filters.page === 1} title="First">«</button>
              <button className="dm-page-btn dm-page-btn--arrow" onClick={() => goToPage(filters.page - 1)} disabled={filters.page === 1} title="Previous">‹</button>
              {pageNums.map((p, i) =>
                p === '...'
                  ? <span key={`e${i}`} className="dm-page-ellipsis">…</span>
                  : <button
                      key={p}
                      className={`dm-page-btn dm-page-num${p === filters.page ? ' dm-page-num--active' : ''}`}
                      onClick={() => goToPage(p as number)}
                    >{p}</button>
              )}
              <button className="dm-page-btn dm-page-btn--arrow" onClick={() => goToPage(filters.page + 1)} disabled={filters.page === totalPages} title="Next">›</button>
              <button className="dm-page-btn dm-page-btn--arrow" onClick={() => goToPage(totalPages)} disabled={filters.page === totalPages} title="Last">»</button>
            </div>
          )}

          <span className="dm-page-info">
            {totalCount === 0 ? '0 results' : `${rangeStart}–${rangeEnd} of ${totalCount}`}
          </span>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="dm-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="dm-modal">
            <div className="dm-modal-header">
              <h2>
                {modalMode === 'view' && 'Supporter Profile'}
                {modalMode === 'create' && 'Add Supporter'}
                {modalMode === 'edit' && 'Edit Supporter'}
              </h2>
              <button className="dm-modal-close" onClick={closeModal} aria-label="Close">✕</button>
            </div>

            {/* View */}
            {modalMode === 'view' && selectedSupporter && (
              <div className="dm-modal-body">
                <div className="dm-profile-grid">
                  {([
                    ['Name', selectedSupporter.displayName || `${selectedSupporter.firstName ?? ''} ${selectedSupporter.lastName ?? ''}`.trim() || '—'],
                    ['Type', selectedSupporter.supporterType],
                    ['Email', selectedSupporter.email],
                    ['Phone', selectedSupporter.phone],
                    ['Organization', selectedSupporter.organizationName],
                    ['Region', selectedSupporter.region],
                    ['Country', selectedSupporter.country],
                    ['Relationship', selectedSupporter.relationshipType],
                    ['Acq. Channel', selectedSupporter.acquisitionChannel],
                    ['First Donation', formatDate(selectedSupporter.firstDonationDate)],
                    ['Member Since', formatDate(selectedSupporter.createdAt)],
                  ] as [string, string | null | undefined][]).map(([label, val]) => (
                    <div key={label} className="dm-profile-field">
                      <span className="dm-profile-field__label">{label}</span>
                      <span className="dm-profile-field__value">{val || '—'}</span>
                    </div>
                  ))}
                  <div className="dm-profile-field">
                    <span className="dm-profile-field__label">Status</span>
                    <span className={`dm-badge dm-badge--status dm-badge--status-${statusClass(selectedSupporter.status)}`}>
                      {selectedSupporter.status ?? '—'}
                    </span>
                  </div>
                </div>

                <p className="dm-donations-title">Donation History ({selectedSupporter.donations.length})</p>
                {selectedSupporter.donations.length === 0 ? (
                  <p className="dm-no-donations">No donations recorded yet.</p>
                ) : (
                  selectedSupporter.donations.map((d) => (
                    <div key={d.donationId} className="dm-donation-card">
                      <div className="dm-donation-card__meta">
                        <span className={`dm-pill dm-pill--${(d.donationType ?? 'other').replace('_', '-')}`}>
                          {PILL_LABELS[d.donationType ?? ''] ?? d.donationType ?? 'Other'}
                        </span>
                        <span className="dm-donation-card__date">{formatDate(d.donationDate)}</span>
                        {d.amount != null && <span className="dm-donation-card__amount">{formatCurrency(d.amount)}</span>}
                        {d.estimatedValue != null && d.amount == null && (
                          <span className="dm-donation-card__amount">Est. {formatCurrency(d.estimatedValue)}</span>
                        )}
                        {d.isRecurring && <span className="dm-badge-recurring">Recurring</span>}
                        {d.campaignName && <span className="dm-donation-card__campaign">{d.campaignName}</span>}
                        {(d.allocations.length > 0 || d.inKindItems.length > 0) && (
                          <button
                            className="dm-expand-btn"
                            onClick={() => setExpandedDonation(expandedDonation === d.donationId ? null : d.donationId)}
                          >
                            {expandedDonation === d.donationId ? 'Hide details' : 'View details'}
                          </button>
                        )}
                      </div>
                      {d.notes && <p className="dm-donation-card__notes">{d.notes}</p>}
                      {expandedDonation === d.donationId && (
                        <div className="dm-donation-details">
                          {d.allocations.length > 0 && (
                            <>
                              <p className="dm-details-label">Allocations</p>
                              {d.allocations.map((a) => (
                                <div key={a.allocationId} className="dm-allocation-item">
                                  <span>Safehouse #{a.safehouseId}</span>
                                  {a.programArea && <span className="dm-allocation-area">{a.programArea}</span>}
                                  {a.amountAllocated != null && <span>{formatCurrency(a.amountAllocated)}</span>}
                                  {a.allocationNotes && <span className="dm-allocation-notes">{a.allocationNotes}</span>}
                                </div>
                              ))}
                            </>
                          )}
                          {d.inKindItems.length > 0 && (
                            <>
                              <p className="dm-details-label">In-Kind Items</p>
                              {d.inKindItems.map((i) => (
                                <div key={i.itemId} className="dm-inkind-item">
                                  <span className="dm-inkind-name">{i.itemName ?? 'Item'}</span>
                                  {i.quantity != null && <span>{i.quantity} {i.unitOfMeasure ?? 'units'}</span>}
                                  {i.itemCategory && <span>{i.itemCategory}</span>}
                                  {i.receivedCondition && <span className="dm-inkind-condition">{i.receivedCondition}</span>}
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}

                <div className="dm-modal-footer">
                  <button className="btn btn-outline-blue" onClick={openEditFromView}>Edit Profile</button>
                  <button className="btn btn-primary" onClick={closeModal}>Close</button>
                </div>
              </div>
            )}

            {/* Create / Edit */}
            {(modalMode === 'create' || modalMode === 'edit') && (
              <form onSubmit={handleFormSubmit}>
                <div className="dm-modal-body">
                  {formError && (
                    <div className="dm-alert dm-alert--error dm-alert--form"><span>{formError}</span></div>
                  )}
                  <div className="dm-form-row">
                    <div className="dm-form-group">
                      <label htmlFor="displayName">Display Name</label>
                      <input id="displayName" name="displayName" type="text" value={formData.displayName ?? ''} onChange={handleFormChange} placeholder="e.g. Hope Foundation" />
                    </div>
                    <div className="dm-form-group">
                      <label htmlFor="organizationName">Organization Name</label>
                      <input id="organizationName" name="organizationName" type="text" value={formData.organizationName ?? ''} onChange={handleFormChange} />
                    </div>
                  </div>
                  <div className="dm-form-row">
                    <div className="dm-form-group">
                      <label htmlFor="firstName">First Name</label>
                      <input id="firstName" name="firstName" type="text" value={formData.firstName ?? ''} onChange={handleFormChange} />
                    </div>
                    <div className="dm-form-group">
                      <label htmlFor="lastName">Last Name</label>
                      <input id="lastName" name="lastName" type="text" value={formData.lastName ?? ''} onChange={handleFormChange} />
                    </div>
                  </div>
                  <div className="dm-form-row">
                    <div className="dm-form-group">
                      <label htmlFor="email">Email</label>
                      <input id="email" name="email" type="email" value={formData.email ?? ''} onChange={handleFormChange} />
                    </div>
                    <div className="dm-form-group">
                      <label htmlFor="phone">Phone</label>
                      <input id="phone" name="phone" type="tel" value={formData.phone ?? ''} onChange={handleFormChange} />
                    </div>
                  </div>
                  <div className="dm-form-row">
                    <div className="dm-form-group">
                      <label htmlFor="supporterType">Supporter Type</label>
                      <select id="supporterType" name="supporterType" value={formData.supporterType ?? ''} onChange={handleFormChange}>
                        <option value="">— Select —</option>
                        {supporterTypes.length > 0
                          ? supporterTypes.map((t) => (
                              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                            ))
                          : <>
                              <option value="individual">Individual</option>
                              <option value="organization">Organization</option>
                            </>
                        }
                      </select>
                    </div>
                    <div className="dm-form-group">
                      <label htmlFor="status">Status</label>
                      <select id="status" name="status" value={formData.status ?? 'active'} onChange={handleFormChange}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="dm-form-row">
                    <div className="dm-form-group">
                      <label htmlFor="region">Region</label>
                      <input id="region" name="region" type="text" value={formData.region ?? ''} onChange={handleFormChange} placeholder="e.g. Central America" />
                    </div>
                    <div className="dm-form-group">
                      <label htmlFor="country">Country</label>
                      <input id="country" name="country" type="text" value={formData.country ?? ''} onChange={handleFormChange} placeholder="e.g. Costa Rica" />
                    </div>
                  </div>
                  <div className="dm-form-row">
                    <div className="dm-form-group">
                      <label htmlFor="relationshipType">Relationship Type</label>
                      <input id="relationshipType" name="relationshipType" type="text" value={formData.relationshipType ?? ''} onChange={handleFormChange} placeholder="e.g. supporter, volunteer" />
                    </div>
                    <div className="dm-form-group">
                      <label htmlFor="acquisitionChannel">Acquisition Channel</label>
                      <input id="acquisitionChannel" name="acquisitionChannel" type="text" value={formData.acquisitionChannel ?? ''} onChange={handleFormChange} placeholder="e.g. self_registration, event" />
                    </div>
                  </div>
                </div>
                <div className="dm-modal-footer">
                  <button type="button" className="btn btn-outline-blue" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Saving…' : modalMode === 'create' ? 'Save Supporter' : 'Update Supporter'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
