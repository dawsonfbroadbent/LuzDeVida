import React, { useEffect, useState } from 'react'
import {
  fetchResidents,
  createResident,
  updateResident,
  deleteResident,
  type resident,
} from '../api/ResidentsAPI'
import {
  fetchResidentRiskPredictions,
  type ResidentRiskPrediction,
} from '../api/MlPredictionsAPI'
import '../styles/CaseloadInventory.css'

type ResidentFormData = Omit<resident, 'resident_id' | 'created_at'>

interface CaseloadInventoryProps {
  embedded?: boolean
}

export default function CaseloadInventory({ embedded = false }: CaseloadInventoryProps) {
  // ===== STATE =====
  const [residents, setResidents] = useState<resident[]>([])
  const [filteredResidents, setFilteredResidents] = useState<resident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingResidentId, setEditingResidentId] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [caseStatusFilter, setCaseStatusFilter] = useState('All')
  const [safehouseFilter, setSafehouseFilter] = useState('All')
  const [caseCategoryFilter, setCaseCategoryFilter] = useState('All')
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const [riskMap, setRiskMap] = useState<Map<number, ResidentRiskPrediction>>(new Map())
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [formData, setFormData] = useState<ResidentFormData>({
    case_control_no: null,
    internal_code: null,
    safehouse_id: null,
    case_status: null,
    sex: null,
    date_of_birth: null,
    birth_status: null,
    place_of_birth: null,
    religion: null,
    case_category: null,
    sub_cat_orphaned: false,
    sub_cat_trafficked: false,
    sub_cat_child_labor: false,
    sub_cat_physical_abuse: false,
    sub_cat_sexual_abuse: false,
    sub_cat_osaec: false,
    sub_cat_cicl: false,
    sub_cat_at_risk: false,
    sub_cat_street_child: false,
    sub_cat_child_with_hiv: false,
    is_pwd: false,
    pwd_type: null,
    has_special_needs: false,
    special_needs_diagnosis: null,
    family_is_4ps: false,
    family_solo_parent: false,
    family_indigenous: false,
    family_parent_pwd: false,
    family_informal_settler: false,
    date_of_admission: null,
    age_upon_admission: null,
    present_age: null,
    length_of_stay: null,
    referral_source: null,
    referring_agency_person: null,
    date_colb_registered: null,
    date_colb_obtained: null,
    assigned_social_worker: null,
    initial_case_assessment: null,
    date_case_study_prepared: null,
    reintegration_type: null,
    reintegration_status: null,
    initial_risk_level: null,
    current_risk_level: null,
    date_enrolled: null,
    date_closed: null,
    notes_restricted: null,
  })

  const itemsPerPage = 10

  // ===== EFFECTS =====
  useEffect(() => {
    loadResidents()
    loadRiskPredictions()
  }, [])

  useEffect(() => {
    let filtered = residents

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.case_control_no?.toLowerCase().includes(term) ||
          r.internal_code?.toLowerCase().includes(term) ||
          r.assigned_social_worker?.toLowerCase().includes(term) ||
          r.referring_agency_person?.toLowerCase().includes(term)
      )
    }

    if (caseStatusFilter !== 'All') {
      filtered = filtered.filter((r) => r.case_status === caseStatusFilter)
    }

    if (safehouseFilter !== 'All') {
      filtered = filtered.filter((r) => r.safehouse_id?.toString() === safehouseFilter)
    }

    if (caseCategoryFilter !== 'All') {
      filtered = filtered.filter((r) => r.case_category === caseCategoryFilter)
    }

    setFilteredResidents(filtered)
    setCurrentPage(1)
  }, [searchTerm, caseStatusFilter, safehouseFilter, caseCategoryFilter, residents])

  // ===== FUNCTIONS =====
  const loadResidents = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchResidents()
      setResidents(data)
      setFilteredResidents(data)
    } catch (err) {
      console.error('Failed to fetch residents:', err)
      setError('Failed to load caseload inventory. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadRiskPredictions = async () => {
    try {
      const predictions = await fetchResidentRiskPredictions()
      const map = new Map<number, ResidentRiskPrediction>()
      for (const p of predictions) map.set(p.resident_id, p)
      setRiskMap(map)
    } catch {
      console.warn('Could not load resident risk predictions')
    }
  }

  const getSubCategories = (resident: resident): string[] => {
    const subs: string[] = []
    if (resident.sub_cat_orphaned) subs.push('Orphaned')
    if (resident.sub_cat_trafficked) subs.push('Trafficked')
    if (resident.sub_cat_child_labor) subs.push('Child Labor')
    if (resident.sub_cat_physical_abuse) subs.push('Physical Abuse')
    if (resident.sub_cat_sexual_abuse) subs.push('Sexual Abuse')
    if (resident.sub_cat_osaec) subs.push('OSAEC/CSAEM')
    if (resident.sub_cat_cicl) subs.push('Conflict with Law')
    if (resident.sub_cat_at_risk) subs.push('At Risk')
    if (resident.sub_cat_street_child) subs.push('Street Child')
    if (resident.sub_cat_child_with_hiv) subs.push('Living with HIV')
    return subs
  }

  const getFamilyProfile = (resident: resident): string[] => {
    const profile: string[] = []
    if (resident.family_is_4ps) profile.push('4Ps Beneficiary')
    if (resident.family_solo_parent) profile.push('Solo Parent')
    if (resident.family_indigenous) profile.push('Indigenous Group')
    if (resident.family_parent_pwd) profile.push('Parent is PWD')
    if (resident.family_informal_settler) profile.push('Informal Settler')
    return profile
  }

  const getDisabilityInfo = (resident: resident): string => {
    if (!resident.is_pwd) return 'No'
    return resident.pwd_type ? `Yes - ${resident.pwd_type}` : 'Yes'
  }

  const openCreateModal = () => {
    setModalMode('create')
    setEditingResidentId(null)
    setFormData({
      case_control_no: null,
      internal_code: null,
      safehouse_id: null,
      case_status: 'Active',
      sex: null,
      date_of_birth: null,
      birth_status: null,
      place_of_birth: null,
      religion: null,
      case_category: null,
      sub_cat_orphaned: false,
      sub_cat_trafficked: false,
      sub_cat_child_labor: false,
      sub_cat_physical_abuse: false,
      sub_cat_sexual_abuse: false,
      sub_cat_osaec: false,
      sub_cat_cicl: false,
      sub_cat_at_risk: false,
      sub_cat_street_child: false,
      sub_cat_child_with_hiv: false,
      is_pwd: false,
      pwd_type: null,
      has_special_needs: false,
      special_needs_diagnosis: null,
      family_is_4ps: false,
      family_solo_parent: false,
      family_indigenous: false,
      family_parent_pwd: false,
      family_informal_settler: false,
      date_of_admission: null,
      age_upon_admission: null,
      present_age: null,
      length_of_stay: null,
      referral_source: null,
      referring_agency_person: null,
      date_colb_registered: null,
      date_colb_obtained: null,
      assigned_social_worker: null,
      initial_case_assessment: null,
      date_case_study_prepared: null,
      reintegration_type: null,
      reintegration_status: null,
      initial_risk_level: null,
      current_risk_level: null,
      date_enrolled: null,
      date_closed: null,
      notes_restricted: null,
    })
    setShowModal(true)
  }

  const openEditModal = (resident: resident) => {
    setModalMode('edit')
    setEditingResidentId(resident.resident_id)
    setFormData({
      case_control_no: resident.case_control_no,
      internal_code: resident.internal_code,
      safehouse_id: resident.safehouse_id,
      case_status: resident.case_status,
      sex: resident.sex,
      date_of_birth: resident.date_of_birth,
      birth_status: resident.birth_status,
      place_of_birth: resident.place_of_birth,
      religion: resident.religion,
      case_category: resident.case_category,
      sub_cat_orphaned: resident.sub_cat_orphaned || false,
      sub_cat_trafficked: resident.sub_cat_trafficked || false,
      sub_cat_child_labor: resident.sub_cat_child_labor || false,
      sub_cat_physical_abuse: resident.sub_cat_physical_abuse || false,
      sub_cat_sexual_abuse: resident.sub_cat_sexual_abuse || false,
      sub_cat_osaec: resident.sub_cat_osaec || false,
      sub_cat_cicl: resident.sub_cat_cicl || false,
      sub_cat_at_risk: resident.sub_cat_at_risk || false,
      sub_cat_street_child: resident.sub_cat_street_child || false,
      sub_cat_child_with_hiv: resident.sub_cat_child_with_hiv || false,
      is_pwd: resident.is_pwd || false,
      pwd_type: resident.pwd_type,
      has_special_needs: resident.has_special_needs || false,
      special_needs_diagnosis: resident.special_needs_diagnosis,
      family_is_4ps: resident.family_is_4ps || false,
      family_solo_parent: resident.family_solo_parent || false,
      family_indigenous: resident.family_indigenous || false,
      family_parent_pwd: resident.family_parent_pwd || false,
      family_informal_settler: resident.family_informal_settler || false,
      date_of_admission: resident.date_of_admission,
      age_upon_admission: resident.age_upon_admission,
      present_age: resident.present_age,
      length_of_stay: resident.length_of_stay,
      referral_source: resident.referral_source,
      referring_agency_person: resident.referring_agency_person,
      date_colb_registered: resident.date_colb_registered,
      date_colb_obtained: resident.date_colb_obtained,
      assigned_social_worker: resident.assigned_social_worker,
      initial_case_assessment: resident.initial_case_assessment,
      date_case_study_prepared: resident.date_case_study_prepared,
      reintegration_type: resident.reintegration_type,
      reintegration_status: resident.reintegration_status,
      initial_risk_level: resident.initial_risk_level,
      current_risk_level: resident.current_risk_level,
      date_enrolled: resident.date_enrolled,
      date_closed: resident.date_closed,
      notes_restricted: resident.notes_restricted,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingResidentId(null)
  }

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value || null,
    }))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    try {
      if (modalMode === 'create') {
        await createResident(formData)
        setSuccessMessage('Resident created successfully!')
      } else if (editingResidentId) {
        await updateResident(editingResidentId, formData)
        setSuccessMessage('Resident updated successfully!')
      }

      await loadResidents()
      closeModal()
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(`Failed to ${modalMode} resident. Please try again.`)
      console.error(err)
    }
  }

  const handleDelete = async (residentId: number) => {
    try {
      setError(null)
      await deleteResident(residentId)
      setSuccessMessage('Resident deleted successfully!')
      setShowDeleteConfirm(null)
      await loadResidents()
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError('Failed to delete resident. Please try again.')
      console.error(err)
    }
  }

  const uniqueCaseStatuses = [
    'All',
    ...new Set(residents.map((r) => r.case_status).filter(Boolean)),
  ]
  const uniqueSafehouses = [
    'All',
    ...new Set(residents.map((r) => r.safehouse_id?.toString()).filter(Boolean)),
  ]
  const uniqueCaseCategories = [
    'All',
    ...new Set(residents.map((r) => r.case_category).filter(Boolean)),
  ]

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
    setCurrentPage(1)
  }

  const sortedResidents = [...filteredResidents].sort((a, b) => {
    if (!sortField) return 0
    let aVal: string | number | null = null
    let bVal: string | number | null = null

    switch (sortField) {
      case 'case_control_no':
        aVal = a.case_control_no ?? ''; bVal = b.case_control_no ?? ''; break
      case 'case_category':
        aVal = a.case_category ?? ''; bVal = b.case_category ?? ''; break
      case 'assigned_social_worker':
        aVal = a.assigned_social_worker ?? ''; bVal = b.assigned_social_worker ?? ''; break
      case 'case_status':
        aVal = a.case_status ?? ''; bVal = b.case_status ?? ''; break
      case 'date_of_admission':
        aVal = a.date_of_admission ?? ''; bVal = b.date_of_admission ?? ''; break
      case 'reintegration_status':
        aVal = a.reintegration_status ?? ''; bVal = b.reintegration_status ?? ''; break
      case 'risk_score':
        aVal = riskMap.get(a.resident_id)?.risk_score ?? -1
        bVal = riskMap.get(b.resident_id)?.risk_score ?? -1
        break
      case 'risk_tier':
        aVal = riskMap.get(a.resident_id)?.risk_tier ?? ''
        bVal = riskMap.get(b.resident_id)?.risk_tier ?? ''
        break
      default:
        return 0
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    }
    const cmp = String(aVal).localeCompare(String(bVal))
    return sortDir === 'asc' ? cmp : -cmp
  })

  const totalPages = Math.ceil(sortedResidents.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const endIdx = startIdx + itemsPerPage
  const paginatedResidents = sortedResidents.slice(startIdx, endIdx)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  // ===== RENDER =====
  return (
    <div className={`caseload-inventory${embedded ? ' caseload-inventory--embedded' : ''}`}>
      <div className="caseload-header">
        <h1>Caseload Inventory</h1>
        <p className="subtitle">
          Manage and monitor resident cases: demographics, case categories, disability information,
          family profiles, admission details, and reintegration tracking
        </p>
      </div>

      {error && (
        <div className="error-alert">
          {error}
          <button onClick={() => setError(null)} className="alert-close">
            ×
          </button>
        </div>
      )}
      {successMessage && (
        <div className="success-alert">
          {successMessage}
          <button onClick={() => setSuccessMessage(null)} className="alert-close">
            ×
          </button>
        </div>
      )}

      <div className="action-bar">
        <button onClick={openCreateModal} className="btn-primary">
          Add Resident
        </button>
      </div>

      <div className="filters-section">
        <h2>Search & Filter</h2>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search by case number, internal code, social worker, or referring agency..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="case-status">Case Status:</label>
            <select
              id="case-status"
              value={caseStatusFilter}
              onChange={(e) => setCaseStatusFilter(e.target.value)}
              className="filter-select"
            >
              {uniqueCaseStatuses.map((status) => (
                <option key={status} value={status ?? ''}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="safehouse">Safehouse:</label>
            <select
              id="safehouse"
              value={safehouseFilter}
              onChange={(e) => setSafehouseFilter(e.target.value)}
              className="filter-select"
            >
              {uniqueSafehouses.map((sh) => (
                <option key={sh} value={sh}>
                  {sh === 'All' ? 'All' : `Safehouse ${sh}`}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="case-category">Case Category:</label>
            <select
              id="case-category"
              value={caseCategoryFilter}
              onChange={(e) => setCaseCategoryFilter(e.target.value)}
              className="filter-select"
            >
              {uniqueCaseCategories.map((cat) => (
                <option key={cat} value={cat ?? ''}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-summary">
          <p>
            Showing <strong>{paginatedResidents.length}</strong> of <strong>{filteredResidents.length}</strong> residents
          </p>
        </div>
      </div>

      <div className="risk-info-note">
        <strong>Risk Score & Tier:</strong> Generated by a machine learning model that evaluates resident data
        (health records, incident reports, counseling sessions, length of stay, and family background) to estimate
        the likelihood of regression or adverse outcomes. Tiers: Critical, High, Moderate, Low.
      </div>

      <div className="table-section">
        {loading ? (
          <div className="loading">Loading caseload inventory...</div>
        ) : filteredResidents.length === 0 ? (
          <div className="no-data">No residents found matching your filters.</div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="caseload-table">
                <thead>
                  <tr>
                    <th></th>
                    <th className="ci-th-sortable" onClick={() => handleSort('case_control_no')}>
                      Case # {sortField === 'case_control_no' ? (sortDir === 'asc' ? '↑' : '↓') : <span className="ci-sort-icon--off">↕</span>}
                    </th>
                    <th className="ci-th-sortable" onClick={() => handleSort('case_category')}>
                      Case Category {sortField === 'case_category' ? (sortDir === 'asc' ? '↑' : '↓') : <span className="ci-sort-icon--off">↕</span>}
                    </th>
                    <th className="ci-th-sortable" onClick={() => handleSort('assigned_social_worker')}>
                      Social Worker {sortField === 'assigned_social_worker' ? (sortDir === 'asc' ? '↑' : '↓') : <span className="ci-sort-icon--off">↕</span>}
                    </th>
                    <th className="ci-th-sortable" onClick={() => handleSort('case_status')}>
                      Case Status {sortField === 'case_status' ? (sortDir === 'asc' ? '↑' : '↓') : <span className="ci-sort-icon--off">↕</span>}
                    </th>
                    <th className="ci-th-sortable" onClick={() => handleSort('date_of_admission')}>
                      Admission Date {sortField === 'date_of_admission' ? (sortDir === 'asc' ? '↑' : '↓') : <span className="ci-sort-icon--off">↕</span>}
                    </th>
                    <th className="ci-th-sortable" onClick={() => handleSort('reintegration_status')}>
                      Reintegration Status {sortField === 'reintegration_status' ? (sortDir === 'asc' ? '↑' : '↓') : <span className="ci-sort-icon--off">↕</span>}
                    </th>
                    <th className="ci-th-sortable" onClick={() => handleSort('risk_score')}>
                      Risk Score {sortField === 'risk_score' ? (sortDir === 'asc' ? '↑' : '↓') : <span className="ci-sort-icon--off">↕</span>}
                    </th>
                    <th className="ci-th-sortable" onClick={() => handleSort('risk_tier')}>
                      Risk Tier {sortField === 'risk_tier' ? (sortDir === 'asc' ? '↑' : '↓') : <span className="ci-sort-icon--off">↕</span>}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedResidents.map((resident) => (
                    <React.Fragment key={resident.resident_id}>
                      <tr
                        className="resident-row"
                        onClick={() =>
                          setExpandedRow(
                            expandedRow === resident.resident_id ? null : resident.resident_id
                          )
                        }
                      >
                        <td className="expand-icon">
                          {expandedRow === resident.resident_id ? '▼' : '▶'}
                        </td>
                        <td className="case-number">{resident.case_control_no || 'N/A'}</td>
                        <td>{resident.case_category || 'Unknown'}</td>
                        <td>{resident.assigned_social_worker || 'Unassigned'}</td>
                        <td>
                          <span className={`badge badge-${resident.case_status?.toLowerCase()}`}>
                            {resident.case_status || 'Unknown'}
                          </span>
                        </td>
                        <td>{resident.date_of_admission || 'N/A'}</td>
                        <td>{resident.reintegration_status || 'Not Started'}</td>
                        <td className="risk-score">
                          {riskMap.get(resident.resident_id)?.risk_score != null
                            ? (riskMap.get(resident.resident_id)!.risk_score * 100).toFixed(1) + '%'
                            : '—'}
                        </td>
                        <td>
                          {riskMap.get(resident.resident_id) ? (
                            <span className={`badge badge-risk-${riskMap.get(resident.resident_id)!.risk_tier.toLowerCase()}`}>
                              {riskMap.get(resident.resident_id)!.risk_tier}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="action-cell" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => openEditModal(resident)} className="btn-small btn-edit">
                            Edit
                          </button>
                          <button onClick={() => setShowDeleteConfirm(resident.resident_id)} className="btn-small btn-delete">
                            Delete
                          </button>
                        </td>
                      </tr>

                      {expandedRow === resident.resident_id && (
                        <tr className="expanded-details">
                          <td colSpan={10}>
                            <div className="details-grid">
                              <div className="detail-section">
                                <h4>Demographics</h4>
                                <div className="detail-item">
                                  <span className="label">Internal Code:</span>
                                  <span className="value">{resident.internal_code || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="label">Sex:</span>
                                  <span className="value">{resident.sex || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="label">Present Age:</span>
                                  <span className="value">{resident.present_age || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="label">Date of Birth:</span>
                                  <span className="value">{resident.date_of_birth || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="label">Birth Status:</span>
                                  <span className="value">{resident.birth_status || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="label">Place of Birth:</span>
                                  <span className="value">{resident.place_of_birth || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="label">Religion:</span>
                                  <span className="value">{resident.religion || 'N/A'}</span>
                                </div>
                              </div>

                              <div className="detail-section">
                                <h4>Admission Details</h4>
                                <div className="detail-item">
                                  <span className="label">Date of Admission:</span>
                                  <span className="value">{resident.date_of_admission || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="label">Safehouse:</span>
                                  <span className="value">{resident.safehouse_id ? `Safehouse ${resident.safehouse_id}` : 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="label">Age Upon Admission:</span>
                                  <span className="value">{resident.age_upon_admission || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="label">Length of Stay:</span>
                                  <span className="value">{resident.length_of_stay || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="label">Date Enrolled:</span>
                                  <span className="value">{resident.date_enrolled || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="label">COLB Registered:</span>
                                  <span className="value">{resident.date_colb_registered || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="label">COLB Obtained:</span>
                                  <span className="value">{resident.date_colb_obtained || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="label">Case Study Prepared:</span>
                                  <span className="value">{resident.date_case_study_prepared || 'N/A'}</span>
                                </div>
                              </div>

                              <div className="detail-section">
                                <h4>Referral Information</h4>
                                <div className="detail-item">
                                  <span className="label">Referral Source:</span>
                                  <span className="value">{resident.referral_source || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="label">Referring Agency/Person:</span>
                                  <span className="value">{resident.referring_agency_person || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="label">Initial Case Assessment:</span>
                                  <span className="value">{resident.initial_case_assessment || 'N/A'}</span>
                                </div>
                              </div>

                              <div className="detail-section">
                                <h4>Case Sub-Categories</h4>
                                {getSubCategories(resident).length > 0 ? (
                                  <div className="badge-group">
                                    {getSubCategories(resident).map((sub, idx) => (
                                      <span key={idx} className="badge badge-subcategory">
                                        {sub}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="value">None recorded</span>
                                )}
                              </div>

                              <div className="detail-section">
                                <h4>Disability & Special Needs</h4>
                                <div className="detail-item">
                                  <span className="label">Person with Disability:</span>
                                  <span className="value">{getDisabilityInfo(resident)}</span>
                                </div>
                              </div>

                              <div className="detail-section">
                                <h4>Family Socio-Demographic Profile</h4>
                                {getFamilyProfile(resident).length > 0 ? (
                                  <div className="badge-group">
                                    {getFamilyProfile(resident).map((profile, idx) => (
                                      <span key={idx} className="badge badge-family">
                                        {profile}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="value">No special profile recorded</span>
                                )}
                              </div>

                              <div className="detail-section">
                                <h4>Reintegration Tracking</h4>
                                <div className="detail-item">
                                  <span className="label">Reintegration Type:</span>
                                  <span className="value">{resident.reintegration_type || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="label">Reintegration Status:</span>
                                  <span className="value">{resident.reintegration_status || 'Not Started'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="label">Initial Risk Level:</span>
                                  <span className="value">{resident.initial_risk_level || 'Unknown'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="label">Current Risk Level:</span>
                                  <span className="value">{resident.current_risk_level || 'Unknown'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="label">Date Closed:</span>
                                  <span className="value">{resident.date_closed || 'Case Still Open'}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  ← Previous
                </button>
                <div className="page-info">
                  Page <span className="current-page">{currentPage}</span> of{' '}
                  <span className="total-pages">{totalPages}</span>
                </div>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showDeleteConfirm !== null && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Resident Record</h2>
              <button onClick={() => setShowDeleteConfirm(null)} className="modal-close">×</button>
            </div>
            <div className="resident-form">
              <div className="delete-confirm-box">
                <p>Warning: This action cannot be undone</p>
                <p>
                  Are you sure you want to delete resident{' '}
                  <strong>{residents.find(r => r.resident_id === showDeleteConfirm)?.case_control_no || 'N/A'}</strong>?
                </p>
              </div>
              <div className="confirm-actions">
                <button onClick={() => setShowDeleteConfirm(null)} className="btn-confirm-cancel">
                  Cancel
                </button>
                <button onClick={() => handleDelete(showDeleteConfirm)} className="btn-confirm-delete">
                  Delete Resident
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'create' ? 'Add New Resident' : 'Edit Resident'}</h2>
              <button onClick={closeModal} className="modal-close">
                ×
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="resident-form">
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="case_control_no">Case Control #</label>
                    <input
                      type="text"
                      id="case_control_no"
                      name="case_control_no"
                      value={formData.case_control_no || ''}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="internal_code">Internal Code</label>
                    <input
                      type="text"
                      id="internal_code"
                      name="internal_code"
                      value={formData.internal_code || ''}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="case_status">Case Status</label>
                    <select
                      id="case_status"
                      name="case_status"
                      value={formData.case_status || ''}
                      onChange={handleFormChange}
                    >
                      <option value="">Select Status</option>
                      <option value="Active">Active</option>
                      <option value="Closed">Closed</option>
                      <option value="Transferred">Transferred</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="case_category">Case Category</label>
                    <select
                      id="case_category"
                      name="case_category"
                      value={formData.case_category || ''}
                      onChange={handleFormChange}
                    >
                      <option value="">Select Category</option>
                      <option value="Abandoned">Abandoned</option>
                      <option value="Foundling">Foundling</option>
                      <option value="Surrendered">Surrendered</option>
                      <option value="Neglected">Neglected</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Demographics</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="sex">Sex</label>
                    <select
                      id="sex"
                      name="sex"
                      value={formData.sex || ''}
                      onChange={handleFormChange}
                    >
                      <option value="">Select</option>
                      <option value="F">Female</option>
                      <option value="M">Male</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="date_of_birth">Date of Birth</label>
                    <input
                      type="date"
                      id="date_of_birth"
                      name="date_of_birth"
                      value={formData.date_of_birth || ''}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="present_age">Present Age</label>
                    <input
                      type="number"
                      id="present_age"
                      name="present_age"
                      value={formData.present_age || ''}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="birth_status">Birth Status</label>
                    <select
                      id="birth_status"
                      name="birth_status"
                      value={formData.birth_status || ''}
                      onChange={handleFormChange}
                    >
                      <option value="">Select</option>
                      <option value="Marital">Marital</option>
                      <option value="Non-Marital">Non-Marital</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="place_of_birth">Place of Birth</label>
                    <input
                      type="text"
                      id="place_of_birth"
                      name="place_of_birth"
                      value={formData.place_of_birth || ''}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="religion">Religion</label>
                    <input
                      type="text"
                      id="religion"
                      name="religion"
                      value={formData.religion || ''}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Admission Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date_of_admission">Date of Admission</label>
                    <input
                      type="date"
                      id="date_of_admission"
                      name="date_of_admission"
                      value={formData.date_of_admission || ''}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="date_enrolled">Date Enrolled</label>
                    <input
                      type="date"
                      id="date_enrolled"
                      name="date_enrolled"
                      value={formData.date_enrolled || ''}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="age_upon_admission">Age Upon Admission</label>
                    <input
                      type="number"
                      id="age_upon_admission"
                      name="age_upon_admission"
                      value={formData.age_upon_admission || ''}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="length_of_stay">Length of Stay (days)</label>
                    <input
                      type="number"
                      id="length_of_stay"
                      name="length_of_stay"
                      value={formData.length_of_stay || ''}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="safehouse_id">Safehouse</label>
                    <input
                      type="number"
                      id="safehouse_id"
                      name="safehouse_id"
                      value={formData.safehouse_id || ''}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="assigned_social_worker">Assigned Social Worker</label>
                    <input
                      type="text"
                      id="assigned_social_worker"
                      name="assigned_social_worker"
                      value={formData.assigned_social_worker || ''}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Sub-Categories</h3>
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="sub_cat_orphaned"
                      checked={formData.sub_cat_orphaned || false}
                      onChange={handleFormChange}
                    />
                    Orphaned
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="sub_cat_trafficked"
                      checked={formData.sub_cat_trafficked || false}
                      onChange={handleFormChange}
                    />
                    Trafficked
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="sub_cat_child_labor"
                      checked={formData.sub_cat_child_labor || false}
                      onChange={handleFormChange}
                    />
                    Child Labor
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="sub_cat_physical_abuse"
                      checked={formData.sub_cat_physical_abuse || false}
                      onChange={handleFormChange}
                    />
                    Physical Abuse
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="sub_cat_sexual_abuse"
                      checked={formData.sub_cat_sexual_abuse || false}
                      onChange={handleFormChange}
                    />
                    Sexual Abuse
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="sub_cat_osaec"
                      checked={formData.sub_cat_osaec || false}
                      onChange={handleFormChange}
                    />
                    OSAEC/CSAEM
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="sub_cat_cicl"
                      checked={formData.sub_cat_cicl || false}
                      onChange={handleFormChange}
                    />
                    Conflict with Law
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="sub_cat_at_risk"
                      checked={formData.sub_cat_at_risk || false}
                      onChange={handleFormChange}
                    />
                    At Risk
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="sub_cat_street_child"
                      checked={formData.sub_cat_street_child || false}
                      onChange={handleFormChange}
                    />
                    Street Child
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="sub_cat_child_with_hiv"
                      checked={formData.sub_cat_child_with_hiv || false}
                      onChange={handleFormChange}
                    />
                    Living with HIV
                  </label>
                </div>
              </div>

              <div className="form-section">
                <h3>Referral Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="referral_source">Referral Source</label>
                    <input
                      type="text"
                      id="referral_source"
                      name="referral_source"
                      value={formData.referral_source || ''}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="referring_agency_person">Referring Agency/Person</label>
                    <input
                      type="text"
                      id="referring_agency_person"
                      name="referring_agency_person"
                      value={formData.referring_agency_person || ''}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="initial_case_assessment">Initial Case Assessment</label>
                    <textarea
                      id="initial_case_assessment"
                      name="initial_case_assessment"
                      value={formData.initial_case_assessment || ''}
                      onChange={handleFormChange}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date_case_study_prepared">Date Case Study Prepared</label>
                    <input
                      type="date"
                      id="date_case_study_prepared"
                      name="date_case_study_prepared"
                      value={formData.date_case_study_prepared || ''}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Certificate of Live Birth (COLB)</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date_colb_registered">COLB Registered</label>
                    <input
                      type="date"
                      id="date_colb_registered"
                      name="date_colb_registered"
                      value={formData.date_colb_registered || ''}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="date_colb_obtained">COLB Obtained</label>
                    <input
                      type="date"
                      id="date_colb_obtained"
                      name="date_colb_obtained"
                      value={formData.date_colb_obtained || ''}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Disability & Special Needs</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="is_pwd">Person with Disability (PWD)</label>
                    <select
                      id="is_pwd"
                      name="is_pwd"
                      value={formData.is_pwd ? 'true' : 'false'}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_pwd: e.target.value === 'true',
                        }))
                      }
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                  {formData.is_pwd && (
                    <div className="form-group">
                      <label htmlFor="pwd_type">PWD Type</label>
                      <input
                        type="text"
                        id="pwd_type"
                        name="pwd_type"
                        placeholder="e.g., Physical, Hearing, Visual, etc."
                        value={formData.pwd_type || ''}
                        onChange={handleFormChange}
                      />
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="has_special_needs">Has Special Needs</label>
                    <select
                      id="has_special_needs"
                      name="has_special_needs"
                      value={formData.has_special_needs ? 'true' : 'false'}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          has_special_needs: e.target.value === 'true',
                        }))
                      }
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                  {formData.has_special_needs && (
                    <div className="form-group">
                      <label htmlFor="special_needs_diagnosis">Special Needs Diagnosis</label>
                      <input
                        type="text"
                        id="special_needs_diagnosis"
                        name="special_needs_diagnosis"
                        value={formData.special_needs_diagnosis || ''}
                        onChange={handleFormChange}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-section">
                <h3>Family Socio-Demographic Profile</h3>
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="family_is_4ps"
                      checked={formData.family_is_4ps || false}
                      onChange={handleFormChange}
                    />
                    4Ps Beneficiary
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="family_solo_parent"
                      checked={formData.family_solo_parent || false}
                      onChange={handleFormChange}
                    />
                    Solo Parent
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="family_indigenous"
                      checked={formData.family_indigenous || false}
                      onChange={handleFormChange}
                    />
                    Indigenous Group
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="family_parent_pwd"
                      checked={formData.family_parent_pwd || false}
                      onChange={handleFormChange}
                    />
                    Parent is PWD
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="family_informal_settler"
                      checked={formData.family_informal_settler || false}
                      onChange={handleFormChange}
                    />
                    Informal Settler
                  </label>
                </div>
              </div>

              <div className="form-section">
                <h3>Reintegration & Case Management</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="reintegration_type">Reintegration Type</label>
                    <select
                      id="reintegration_type"
                      name="reintegration_type"
                      value={formData.reintegration_type || ''}
                      onChange={handleFormChange}
                    >
                      <option value="">Select Type</option>
                      <option value="Family Reunification">Family Reunification</option>
                      <option value="Foster Care">Foster Care</option>
                      <option value="Adoption (Domestic)">Adoption (Domestic)</option>
                      <option value="Adoption (Inter-Country)">Adoption (Inter-Country)</option>
                      <option value="Independent Living">Independent Living</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="reintegration_status">Reintegration Status</label>
                    <select
                      id="reintegration_status"
                      name="reintegration_status"
                      value={formData.reintegration_status || ''}
                      onChange={handleFormChange}
                    >
                      <option value="">Select Status</option>
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="initial_risk_level">Initial Risk Level</label>
                    <select
                      id="initial_risk_level"
                      name="initial_risk_level"
                      value={formData.initial_risk_level || ''}
                      onChange={handleFormChange}
                    >
                      <option value="">Select Level</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="current_risk_level">Current Risk Level</label>
                    <select
                      id="current_risk_level"
                      name="current_risk_level"
                      value={formData.current_risk_level || ''}
                      onChange={handleFormChange}
                    >
                      <option value="">Select Level</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date_closed">Date Closed (if applicable)</label>
                    <input
                      type="date"
                      id="date_closed"
                      name="date_closed"
                      value={formData.date_closed || ''}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="notes_restricted">Restricted Notes</label>
                    <textarea
                      id="notes_restricted"
                      name="notes_restricted"
                      placeholder="Private notes accessible only to authorized staff"
                      value={formData.notes_restricted || ''}
                      onChange={handleFormChange}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn-primary">
                  {modalMode === 'create' ? 'Create Resident' : 'Update Resident'}
                </button>
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
