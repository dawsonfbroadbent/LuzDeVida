import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  fetchSupporterStats,
  fetchSupporters,
  fetchSupporterById,
  createSupporter,
  updateSupporter,
  type SupporterStats,
  type SupporterListItem,
  type SupporterDetail,
  type CreateSupporterPayload,
} from '../api/SupporterAPI'
import '../styles/DonorManagement.css'

type ModalMode = 'view' | 'create' | 'edit'

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

// const CONTRIBUTION_TYPES = ['monetary', 'in-kind', 'time', 'skills', 'social_media']

const PILL_LABELS: Record<string, string> = {
  monetary: 'Monetary',
  'in-kind': 'In-Kind',
  time: 'Time',
  skills: 'Skills',
  social_media: 'Social',
}

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

export default function DonorManagement() {
  const { token } = useAuth()

  // ── Data ──────────────────────────────────────────────────
  const [stats, setStats] = useState<SupporterStats | null>(null)
  const [supporters, setSupporters] = useState<SupporterListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
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

  // ── Filters ───────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [contributionTypeFilter, setContributionTypeFilter] = useState('All')
  const [regionFilter, setRegionFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Load stats ────────────────────────────────────────────
  async function loadStats() {
    if (!token) return
    setStatsLoading(true)
    try {
      const data = await fetchSupporterStats(token)
      setStats(data)
    } catch {
      // Non-critical; stats section will show empty
    } finally {
      setStatsLoading(false)
    }
  }

  // ── Load supporters ───────────────────────────────────────
  async function loadSupporters(page = currentPage) {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const result = await fetchSupporters(
        {
          page,
          pageSize,
          search: searchTerm || undefined,
          status: statusFilter !== 'All' ? statusFilter : undefined,
          supporter_type: typeFilter !== 'All' ? typeFilter : undefined,
          contribution_type: contributionTypeFilter !== 'All' ? contributionTypeFilter : undefined,
          region: regionFilter !== 'All' ? regionFilter : undefined,
        },
        token,
      )
      setSupporters(result.items)
      setTotalCount(result.totalCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load supporters.')
    } finally {
      setLoading(false)
    }
  }

  // ── Mount: load both in parallel ─────────────────────────
  useEffect(() => {
    loadStats()
    loadSupporters(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Filters change: debounce search, immediate for selects ─
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      setCurrentPage(1)
      loadSupporters(1)
    }, 300)
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm])

  useEffect(() => {
    setCurrentPage(1)
    loadSupporters(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter, contributionTypeFilter, regionFilter])

  useEffect(() => {
    loadSupporters(currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  // ── Unique regions for filter dropdown ───────────────────
  const regions = Array.from(
    new Set(supporters.map((s) => s.region).filter(Boolean) as string[]),
  ).sort()

  // ── Modal actions ─────────────────────────────────────────
  async function openViewModal(id: number) {
    if (!token) return
    setFormError(null)
    setExpandedDonation(null)
    try {
      const detail = await fetchSupporterById(id, token)
      setSelectedSupporter(detail)
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

  function openEditModal(supporter: SupporterListItem) {
    setFormData({
      supporterType: supporter.supporterType ?? '',
      displayName: '',
      organizationName: '',
      firstName: '',
      lastName: '',
      relationshipType: '',
      region: supporter.region ?? '',
      country: '',
      email: '',
      phone: '',
      status: supporter.status ?? 'active',
      acquisitionChannel: '',
    })
    setEditingSupporterId(supporter.supporterId)
    setFormError(null)
    setModalMode('edit')
    setShowModal(true)
  }

  async function openEditFromView() {
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
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return

    const resolvedName = formData.displayName || `${formData.firstName ?? ''} ${formData.lastName ?? ''}`.trim()
    if (!resolvedName) {
      setFormError('Please enter a display name or first and last name.')
      return
    }

    setSubmitting(true)
    setFormError(null)
    try {
      if (modalMode === 'create') {
        await createSupporter(formData, token)
        setSuccessMessage('Supporter created successfully.')
      } else if (modalMode === 'edit' && editingSupporterId !== null) {
        await updateSupporter(editingSupporterId, formData, token)
        setSuccessMessage('Supporter updated successfully.')
      }
      closeModal()
      await Promise.all([loadStats(), loadSupporters(currentPage)])
      setTimeout(() => setSuccessMessage(null), 4000)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'An error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="donor-management">
      {/* Header */}
      <div className="dm-header">
        <div>
          <h1>Donor Management</h1>
          <p className="dm-subtitle">Supporter profiles, contributions, and allocation tracking</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Add Supporter
        </button>
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
          <p className="dm-stat-card__value">
            {statsLoading ? <span className="dm-skeleton dm-skeleton--value" /> : (stats?.totalSupporters ?? 0)}
          </p>
          <p className="dm-stat-card__sub">All time</p>
        </div>
        <div className="dm-stat-card dm-stat-card--active">
          <p className="dm-stat-card__label">Active</p>
          <p className="dm-stat-card__value">
            {statsLoading ? <span className="dm-skeleton dm-skeleton--value" /> : (stats?.activeSupporters ?? 0)}
          </p>
          <p className="dm-stat-card__sub">Currently engaged</p>
        </div>
        <div className="dm-stat-card dm-stat-card--monetary">
          <p className="dm-stat-card__label">Total Donated</p>
          <p className="dm-stat-card__value dm-stat-card__value--currency">
            {statsLoading ? <span className="dm-skeleton dm-skeleton--value" /> : formatCurrency(stats?.totalMonetaryDonated ?? 0)}
          </p>
          <p className="dm-stat-card__sub">Monetary contributions</p>
        </div>
        <div className="dm-stat-card dm-stat-card--recurring">
          <p className="dm-stat-card__label">Recurring Donors</p>
          <p className="dm-stat-card__value">
            {statsLoading ? <span className="dm-skeleton dm-skeleton--value" /> : (stats?.recurringDonorsCount ?? 0)}
          </p>
          <p className="dm-stat-card__sub">Monthly givers</p>
        </div>
        <div className="dm-stat-card dm-stat-card--inkind">
          <p className="dm-stat-card__label">In-Kind Donors</p>
          <p className="dm-stat-card__value">
            {statsLoading ? <span className="dm-skeleton dm-skeleton--value" /> : (stats?.inKindDonorsCount ?? 0)}
          </p>
          <p className="dm-stat-card__sub">Goods & services</p>
        </div>
        <div className="dm-stat-card dm-stat-card--avg">
          <p className="dm-stat-card__label">Avg Donation</p>
          <p className="dm-stat-card__value dm-stat-card__value--currency">
            {statsLoading ? <span className="dm-skeleton dm-skeleton--value" /> : formatCurrency(stats?.avgDonation ?? 0)}
          </p>
          <p className="dm-stat-card__sub">Per monetary gift</p>
        </div>
      </div>

      {/* Filters */}
      <div className="dm-filters">
        <input
          type="text"
          className="dm-search"
          placeholder="Search by name or email…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="dm-filter-row">
          <select
            className="dm-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            className="dm-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="individual">Individual</option>
            <option value="organization">Organization</option>
            <option value="church">Church</option>
            <option value="anonymous">Anonymous</option>
          </select>
          <select
            className="dm-filter-select"
            value={contributionTypeFilter}
            onChange={(e) => setContributionTypeFilter(e.target.value)}
          >
            <option value="All">All Contributions</option>
            <option value="monetary">Monetary</option>
            <option value="in-kind">In-Kind</option>
            <option value="time">Time</option>
            <option value="skills">Skills</option>
            <option value="social_media">Social Media</option>
          </select>
          <select
            className="dm-filter-select"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <option value="All">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <p className="dm-filter-summary">
          Showing {supporters.length} of {totalCount} supporter{totalCount !== 1 ? 's' : ''}
        </p>
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
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Total Given</th>
                <th>Last Donation</th>
                <th>Region</th>
                <th>Contributions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {supporters.map((s) => (
                <tr key={s.supporterId}>
                  <td className="dm-td-name">{s.displayName}</td>
                  <td>
                    {s.supporterType ? (
                      <span className="dm-badge dm-badge--type">{s.supporterType}</span>
                    ) : '—'}
                  </td>
                  <td>
                    <span className={`dm-badge dm-badge--status dm-badge--${s.status ?? 'unknown'}`}>
                      {s.status ?? 'unknown'}
                    </span>
                  </td>
                  <td className="dm-td-currency">{formatCurrency(s.totalGiven)}</td>
                  <td>{formatDate(s.lastDonationDate)}</td>
                  <td>{s.region ?? '—'}</td>
                  <td>
                    <div className="dm-pills">
                      {s.contributionTypes.map((ct) => (
                        <span key={ct} className={`dm-pill dm-pill--${ct.replace('_', '-')}`}>
                          {PILL_LABELS[ct] ?? ct}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="dm-actions">
                      <button className="dm-btn-view" onClick={() => openViewModal(s.supporterId)}>
                        View
                      </button>
                      <button className="dm-btn-edit" onClick={() => openEditModal(s)}>
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="dm-pagination">
            <button
              className="dm-page-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ← Prev
            </button>
            <span className="dm-page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="dm-page-btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="dm-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="dm-modal">
            {/* Modal Header */}
            <div className="dm-modal-header">
              <h2>
                {modalMode === 'view' && 'Supporter Profile'}
                {modalMode === 'create' && 'Add Supporter'}
                {modalMode === 'edit' && 'Edit Supporter'}
              </h2>
              <button className="dm-modal-close" onClick={closeModal} aria-label="Close">✕</button>
            </div>

            {/* View Modal */}
            {modalMode === 'view' && selectedSupporter && (
              <div className="dm-modal-body">
                <div className="dm-profile-grid">
                  <div className="dm-profile-field">
                    <span className="dm-profile-field__label">Name</span>
                    <span className="dm-profile-field__value">
                      {selectedSupporter.displayName || `${selectedSupporter.firstName ?? ''} ${selectedSupporter.lastName ?? ''}`.trim() || '—'}
                    </span>
                  </div>
                  <div className="dm-profile-field">
                    <span className="dm-profile-field__label">Type</span>
                    <span className="dm-profile-field__value">{selectedSupporter.supporterType ?? '—'}</span>
                  </div>
                  <div className="dm-profile-field">
                    <span className="dm-profile-field__label">Status</span>
                    <span className={`dm-badge dm-badge--status dm-badge--${selectedSupporter.status ?? 'unknown'}`}>
                      {selectedSupporter.status ?? '—'}
                    </span>
                  </div>
                  <div className="dm-profile-field">
                    <span className="dm-profile-field__label">Organization</span>
                    <span className="dm-profile-field__value">{selectedSupporter.organizationName ?? '—'}</span>
                  </div>
                  <div className="dm-profile-field">
                    <span className="dm-profile-field__label">Email</span>
                    <span className="dm-profile-field__value">{selectedSupporter.email ?? '—'}</span>
                  </div>
                  <div className="dm-profile-field">
                    <span className="dm-profile-field__label">Phone</span>
                    <span className="dm-profile-field__value">{selectedSupporter.phone ?? '—'}</span>
                  </div>
                  <div className="dm-profile-field">
                    <span className="dm-profile-field__label">Region</span>
                    <span className="dm-profile-field__value">{selectedSupporter.region ?? '—'}</span>
                  </div>
                  <div className="dm-profile-field">
                    <span className="dm-profile-field__label">Country</span>
                    <span className="dm-profile-field__value">{selectedSupporter.country ?? '—'}</span>
                  </div>
                  <div className="dm-profile-field">
                    <span className="dm-profile-field__label">Acquisition Channel</span>
                    <span className="dm-profile-field__value">{selectedSupporter.acquisitionChannel ?? '—'}</span>
                  </div>
                  <div className="dm-profile-field">
                    <span className="dm-profile-field__label">First Donation</span>
                    <span className="dm-profile-field__value">{formatDate(selectedSupporter.firstDonationDate)}</span>
                  </div>
                  <div className="dm-profile-field">
                    <span className="dm-profile-field__label">Member Since</span>
                    <span className="dm-profile-field__value">{formatDate(selectedSupporter.createdAt)}</span>
                  </div>
                  <div className="dm-profile-field">
                    <span className="dm-profile-field__label">Relationship</span>
                    <span className="dm-profile-field__value">{selectedSupporter.relationshipType ?? '—'}</span>
                  </div>
                </div>

                {/* Donation History */}
                <p className="dm-donations-title">
                  Donation History ({selectedSupporter.donations.length})
                </p>
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
                        {d.amount != null && (
                          <span className="dm-donation-card__amount">{formatCurrency(d.amount)}</span>
                        )}
                        {d.estimatedValue != null && d.amount == null && (
                          <span className="dm-donation-card__amount">Est. {formatCurrency(d.estimatedValue)}</span>
                        )}
                        {d.isRecurring && <span className="dm-badge-recurring">Recurring</span>}
                        {d.campaignName && (
                          <span className="dm-donation-card__campaign">{d.campaignName}</span>
                        )}
                        {(d.allocations.length > 0 || d.inKindItems.length > 0) && (
                          <button
                            className="dm-expand-btn"
                            onClick={() => setExpandedDonation(expandedDonation === d.donationId ? null : d.donationId)}
                          >
                            {expandedDonation === d.donationId ? '▲ Hide' : '▼ Details'}
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
                                  {a.amountAllocated != null && (
                                    <span>{formatCurrency(a.amountAllocated)}</span>
                                  )}
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
                                  {i.quantity != null && (
                                    <span>{i.quantity} {i.unitOfMeasure ?? 'units'}</span>
                                  )}
                                  {i.itemCategory && <span>{i.itemCategory}</span>}
                                  {i.receivedCondition && (
                                    <span className="dm-inkind-condition">{i.receivedCondition}</span>
                                  )}
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
                  <button className="btn btn-outline-blue" onClick={openEditFromView}>
                    Edit Profile
                  </button>
                  <button className="btn btn-primary" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Create / Edit Modal */}
            {(modalMode === 'create' || modalMode === 'edit') && (
              <form onSubmit={handleFormSubmit}>
                <div className="dm-modal-body">
                  {formError && (
                    <div className="dm-alert dm-alert--error dm-alert--form">
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="dm-form-row">
                    <div className="dm-form-group">
                      <label htmlFor="displayName">Display Name</label>
                      <input
                        id="displayName"
                        name="displayName"
                        type="text"
                        value={formData.displayName ?? ''}
                        onChange={handleFormChange}
                        placeholder="e.g. Hope Foundation"
                      />
                    </div>
                    <div className="dm-form-group">
                      <label htmlFor="organizationName">Organization Name</label>
                      <input
                        id="organizationName"
                        name="organizationName"
                        type="text"
                        value={formData.organizationName ?? ''}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>

                  <div className="dm-form-row">
                    <div className="dm-form-group">
                      <label htmlFor="firstName">First Name</label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName ?? ''}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="dm-form-group">
                      <label htmlFor="lastName">Last Name</label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName ?? ''}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>

                  <div className="dm-form-row">
                    <div className="dm-form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email ?? ''}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="dm-form-group">
                      <label htmlFor="phone">Phone</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone ?? ''}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>

                  <div className="dm-form-row">
                    <div className="dm-form-group">
                      <label htmlFor="supporterType">Supporter Type</label>
                      <select
                        id="supporterType"
                        name="supporterType"
                        value={formData.supporterType ?? ''}
                        onChange={handleFormChange}
                      >
                        <option value="individual">Individual</option>
                        <option value="organization">Organization</option>
                        <option value="church">Church</option>
                        <option value="anonymous">Anonymous</option>
                      </select>
                    </div>
                    <div className="dm-form-group">
                      <label htmlFor="status">Status</label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status ?? 'active'}
                        onChange={handleFormChange}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="dm-form-row">
                    <div className="dm-form-group">
                      <label htmlFor="region">Region</label>
                      <input
                        id="region"
                        name="region"
                        type="text"
                        value={formData.region ?? ''}
                        onChange={handleFormChange}
                        placeholder="e.g. Central America"
                      />
                    </div>
                    <div className="dm-form-group">
                      <label htmlFor="country">Country</label>
                      <input
                        id="country"
                        name="country"
                        type="text"
                        value={formData.country ?? ''}
                        onChange={handleFormChange}
                        placeholder="e.g. Costa Rica"
                      />
                    </div>
                  </div>

                  <div className="dm-form-row">
                    <div className="dm-form-group">
                      <label htmlFor="relationshipType">Relationship Type</label>
                      <input
                        id="relationshipType"
                        name="relationshipType"
                        type="text"
                        value={formData.relationshipType ?? ''}
                        onChange={handleFormChange}
                        placeholder="e.g. supporter, volunteer"
                      />
                    </div>
                    <div className="dm-form-group">
                      <label htmlFor="acquisitionChannel">Acquisition Channel</label>
                      <input
                        id="acquisitionChannel"
                        name="acquisitionChannel"
                        type="text"
                        value={formData.acquisitionChannel ?? ''}
                        onChange={handleFormChange}
                        placeholder="e.g. self_registration, event"
                      />
                    </div>
                  </div>
                </div>

                <div className="dm-modal-footer">
                  <button type="button" className="btn btn-outline-blue" onClick={closeModal}>
                    Cancel
                  </button>
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
