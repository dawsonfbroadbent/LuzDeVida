import { useEffect, useMemo, useState } from 'react'
import {
  fetchHomeVisitations,
  addHomeVisitation,
  updateHomeVisitation,
  deleteHomeVisitation,
  type home_visitation,
} from '../api/HomeVisitationsAPI'
import { fetchResidents, type resident } from '../api/ResidentsAPI'
import {
  fetchInterventionPlans,
  createInterventionPlan,
  updateInterventionPlan,
  deleteInterventionPlan,
  type intervention_plan,
} from '../api/InterventionPlansAPI'
import '../styles/HomeVisitations.css'

type ActiveView = 'homeVisits' | 'caseConferences'

export default function HomeVisitations() {
  const [residents, setResidents] = useState<resident[]>([])
  const [selectedResidentId, setSelectedResidentId] = useState<number | null>(null)

  const [visits, setVisits] = useState<home_visitation[]>([])
  const [plans, setPlans] = useState<intervention_plan[]>([])
  const [activeView, setActiveView] = useState<ActiveView>('homeVisits')

  const [loading, setLoading] = useState(true)
  const [contentLoading, setContentLoading] = useState(false)
  const [submittingVisit, setSubmittingVisit] = useState(false)
  const [submittingPlan, setSubmittingPlan] = useState(false)
  const [deletingVisitId, setDeletingVisitId] = useState<number | null>(null)
  const [deletingPlanId, setDeletingPlanId] = useState<number | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [showVisitModal, setShowVisitModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)

  const [editingVisitId, setEditingVisitId] = useState<number | null>(null)
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null)

  const [expandedVisitId, setExpandedVisitId] = useState<number | null>(null)
  const [expandedUpcomingPlanId, setExpandedUpcomingPlanId] = useState<number | null>(null)
  const [expandedPastPlanId, setExpandedPastPlanId] = useState<number | null>(null)

  const [showDeleteVisitConfirm, setShowDeleteVisitConfirm] = useState<number | null>(null)
  const [showDeletePlanConfirm, setShowDeletePlanConfirm] = useState<number | null>(null)

  const emptyVisitForm: home_visitation = {
    visitation_id: 0,
    resident_id: 0,
    visit_date: '',
    social_worker: '',
    visit_type: '',
    location_visited: '',
    family_members_present: '',
    purpose: '',
    observations: '',
    family_cooperation_level: '',
    safety_concerns_noted: false,
    follow_up_needed: false,
    follow_up_notes: '',
    visit_outcome: '',
  }

  const emptyPlanForm: intervention_plan = {
    plan_id: 0,
    resident_id: 0,
    plan_category: '',
    plan_description: '',
    services_provided: '',
    target_value: null,
    target_date: '',
    status: '',
    case_conference_date: '',
    created_at: '',
    updated_at: '',
  }

  const [visitForm, setVisitForm] = useState<home_visitation>(emptyVisitForm)
  const [planForm, setPlanForm] = useState<intervention_plan>(emptyPlanForm)

  const showTemporarySuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    return dateString.split('T')[0]
  }

  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0]

  const selectedResident = useMemo(
    () => residents.find((r) => r.resident_id === selectedResidentId) ?? null,
    [residents, selectedResidentId]
  )

  const upcomingPlans = useMemo(() => {
    return [...plans]
      .filter((p) => {
        if (!p.case_conference_date) return false
        return p.case_conference_date.split('T')[0] >= today
      })
      .sort((a, b) =>
        (a.case_conference_date ?? '').localeCompare(b.case_conference_date ?? '')
      )
  }, [plans, today])

  const pastPlans = useMemo(() => {
    return [...plans]
      .filter((p) => {
        if (!p.case_conference_date) return true
        return p.case_conference_date.split('T')[0] < today
      })
      .sort((a, b) =>
        (b.case_conference_date ?? '').localeCompare(a.case_conference_date ?? '')
      )
  }, [plans, today])

  const loadResidents = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchResidents()
      setResidents(data)

      if (data.length > 0) {
        setSelectedResidentId((prev) => prev ?? data[0].resident_id)
      } else {
        setSelectedResidentId(null)
        setVisits([])
        setPlans([])
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load residents. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadVisits = async (residentId: number) => {
    const data = await fetchHomeVisitations(residentId)
    const sorted = [...data].sort((a, b) =>
      (b.visit_date || '').localeCompare(a.visit_date || '')
    )
    setVisits(sorted)
  }

  const loadPlans = async (residentId: number) => {
    const data = await fetchInterventionPlans(residentId)
    setPlans(data)
  }

  const loadResidentContent = async (residentId: number) => {
    setContentLoading(true)
    setError(null)

    try {
      await Promise.all([loadVisits(residentId), loadPlans(residentId)])
    } catch (err) {
      console.error(err)
      setError('Failed to load home visitations and case conferences. Please try again.')
    } finally {
      setContentLoading(false)
    }
  }

  useEffect(() => {
    loadResidents()
  }, [])

  useEffect(() => {
    if (selectedResidentId == null) return

    loadResidentContent(selectedResidentId)
    setVisitForm((prev) => ({ ...prev, resident_id: selectedResidentId }))
    setPlanForm((prev) => ({ ...prev, resident_id: selectedResidentId }))
  }, [selectedResidentId])

  const resetVisitForm = () => {
    setVisitForm({
      ...emptyVisitForm,
      resident_id: selectedResidentId ?? 0,
      visit_date: today,
    })
    setEditingVisitId(null)
    setShowVisitModal(false)
  }

  const resetPlanForm = () => {
    setPlanForm({
      ...emptyPlanForm,
      resident_id: selectedResidentId ?? 0,
      case_conference_date: today,
    })
    setEditingPlanId(null)
    setShowPlanModal(false)
  }

  const openCreateVisitModal = () => {
    setError(null)
    setVisitForm({
      ...emptyVisitForm,
      resident_id: selectedResidentId ?? 0,
      visit_date: today,
    })
    setEditingVisitId(null)
    setShowVisitModal(true)
  }

  const openEditVisitModal = (visit: home_visitation) => {
    setError(null)
    setVisitForm({ ...visit })
    setEditingVisitId(visit.visitation_id)
    setShowVisitModal(true)
    setActiveView('homeVisits')
  }

  const openCreatePlanModal = () => {
    setError(null)
    setPlanForm({
      ...emptyPlanForm,
      resident_id: selectedResidentId ?? 0,
      case_conference_date: today,
    })
    setEditingPlanId(null)
    setShowPlanModal(true)
  }

  const openEditPlanModal = (plan: intervention_plan) => {
    setError(null)
    setPlanForm({ ...plan })
    setEditingPlanId(plan.plan_id)
    setShowPlanModal(true)
    setActiveView('caseConferences')
  }

  const handleVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedResidentId == null) {
      setError('Please select a resident before saving.')
      return
    }

    if (
      !visitForm.visit_date.trim() ||
      !visitForm.social_worker.trim() ||
      !visitForm.visit_type.trim() ||
      !visitForm.location_visited.trim() ||
      !visitForm.family_members_present.trim() ||
      !visitForm.purpose.trim() ||
      !visitForm.observations.trim() ||
      !visitForm.family_cooperation_level.trim() ||
      !visitForm.visit_outcome.trim() ||
      (visitForm.follow_up_needed && !visitForm.follow_up_notes.trim())
    ) {
      setError('Please fill in all required fields before saving.')
      return
    }

    setSubmittingVisit(true)
    setError(null)

    try {
      const payload = {
        ...visitForm,
        resident_id: selectedResidentId,
        resident: selectedResident ?? undefined,
        follow_up_notes: visitForm.follow_up_needed ? visitForm.follow_up_notes : '',
      }

      if (editingVisitId !== null) {
        await updateHomeVisitation(editingVisitId, payload)
        showTemporarySuccess('Home visitation updated successfully!')
      } else {
        await addHomeVisitation(payload)
        showTemporarySuccess('Home visitation created successfully!')
      }

      await loadVisits(selectedResidentId)
      resetVisitForm()
    } catch (err) {
      console.error(err)
      setError('Failed to save home visitation. Please try again.')
    } finally {
      setSubmittingVisit(false)
    }
  }

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedResidentId == null) {
      setError('Please select a resident before saving.')
      return
    }

    if (
      !planForm.plan_category.trim() ||
      !planForm.plan_description.trim() ||
      !planForm.services_provided.trim() ||
      !planForm.status.trim()
    ) {
      setError('Please fill in all required fields before saving.')
      return
    }

    setSubmittingPlan(true)
    setError(null)

    try {
      const now = new Date().toISOString()

      if (editingPlanId !== null) {
        const updatePayload: intervention_plan = {
          ...planForm,
          resident_id: selectedResidentId,
          updated_at: now,
        }

        await updateInterventionPlan(editingPlanId, updatePayload)
        showTemporarySuccess('Case conference record updated successfully!')
      } else {
        const createPayload: Omit<intervention_plan, 'plan_id'> = {
          resident_id: selectedResidentId,
          plan_category: planForm.plan_category,
          plan_description: planForm.plan_description,
          services_provided: planForm.services_provided,
          target_value: planForm.target_value,
          target_date: planForm.target_date || '',
          status: planForm.status,
          case_conference_date: planForm.case_conference_date || '',
          created_at: now,
          updated_at: now,
        }

        await createInterventionPlan(createPayload)
        showTemporarySuccess('Case conference record created successfully!')
      }

      await loadPlans(selectedResidentId)
      resetPlanForm()
    } catch (err) {
      console.error(err)
      setError('Failed to save case conference history. Please try again.')
    } finally {
      setSubmittingPlan(false)
    }
  }

  const handleDeleteVisit = async (visitationId: number) => {
    if (selectedResidentId == null) return

    setDeletingVisitId(visitationId)
    setError(null)

    try {
      await deleteHomeVisitation(visitationId)
      await loadVisits(selectedResidentId)
      if (editingVisitId === visitationId) resetVisitForm()
      setShowDeleteVisitConfirm(null)
      showTemporarySuccess('Home visitation deleted successfully!')
    } catch (err) {
      console.error(err)
      setError('Failed to delete home visitation. Please try again.')
    } finally {
      setDeletingVisitId(null)
    }
  }

  const handleDeletePlan = async (planId: number) => {
    if (selectedResidentId == null) return

    setDeletingPlanId(planId)
    setError(null)

    try {
      await deleteInterventionPlan(planId)
      await loadPlans(selectedResidentId)
      if (editingPlanId === planId) resetPlanForm()
      setShowDeletePlanConfirm(null)
      showTemporarySuccess('Case conference record deleted successfully!')
    } catch (err) {
      console.error(err)
      setError('Failed to delete case conference record. Please try again.')
    } finally {
      setDeletingPlanId(null)
    }
  }

  const statusClass = (status: string | null | undefined) => {
    switch ((status || '').toLowerCase()) {
      case 'open':
        return 'status-open'
      case 'in progress':
        return 'status-in-progress'
      case 'achieved':
        return 'status-achieved'
      case 'on hold':
        return 'status-on-hold'
      case 'closed':
        return 'status-closed'
      default:
        return 'status-default'
    }
  }

  if (loading) {
    return (
      <div className="home-visitations-page">
        <div className="home-visitations-header">
          <h1>Home Visitations & Case Conferences</h1>
          <p className="subtitle">
            Manage home and field visits, family observations, and case conference planning
            for each resident.
          </p>
        </div>

        <div className="loading">Loading home visitations and case conferences...</div>
      </div>
    )
  }

  return (
    <div className="home-visitations-page">
      <div className="home-visitations-header">
        <h1>Home Visitations & Case Conferences</h1>
        <p className="subtitle">
          Manage home and field visits, family observations, and case conference planning
          for each resident.
        </p>
      </div>

      {error && (
        <div className="error-alert">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="alert-close">
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className="success-alert">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="alert-close">
            ×
          </button>
        </div>
      )}

      {residents.length === 0 ? (
        <div className="no-data">
          <p>No residents found.</p>
          <p>Add residents first before managing home visitations or case conferences.</p>
          <button type="button" onClick={loadResidents} className="btn-primary">
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="resident-selector">
            <h2>Select Resident</h2>
            <div className="selector-row">
              <div className="selector-group">
                <label htmlFor="resident-select">Resident</label>
                <select
                  id="resident-select"
                  value={selectedResidentId ?? ''}
                  onChange={(e) =>
                    setSelectedResidentId(e.target.value ? Number(e.target.value) : null)
                  }
                >
                  {residents.map((r) => (
                    <option key={r.resident_id} value={r.resident_id}>
                      {r.case_control_no || `Resident #${r.resident_id}`}
                      {r.internal_code ? ` (${r.internal_code})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="hv-tabs">
            <button
              type="button"
              className={activeView === 'homeVisits' ? 'hv-tab active' : 'hv-tab'}
              onClick={() => setActiveView('homeVisits')}
            >
              Home Visits
            </button>
            <button
              type="button"
              className={activeView === 'caseConferences' ? 'hv-tab active' : 'hv-tab'}
              onClick={() => setActiveView('caseConferences')}
            >
              Case Conference History
            </button>
          </div>

          <div className="action-bar">
            {activeView === 'homeVisits' ? (
              <button
                type="button"
                className="btn-primary"
                onClick={openCreateVisitModal}
                disabled={contentLoading}
              >
                + Add Home Visit
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={openCreatePlanModal}
                disabled={contentLoading}
              >
                + Add Case Conference Record
              </button>
            )}
          </div>

          {contentLoading ? (
            <div className="loading">Loading resident records...</div>
          ) : activeView === 'homeVisits' ? (
            <div className="table-section">
              {visits.length === 0 ? (
                <div className="no-data">
                  No home visitations found for this resident. Create one to get started.
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="home-visits-table home-visits-layout">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Visit Date</th>
                        <th>Visit Type</th>
                        <th>Social Worker</th>
                        <th>Family Cooperation</th>
                        <th>Outcome</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visits.map((visit) => (
                        <tr key={`visit-block-${visit.visitation_id}`}>
                          <td colSpan={7} className="row-block-cell">
                            <table className="embedded-row-table home-visits-layout">
                              <tbody>
                                <tr
                                  className="visit-row"
                                  onClick={() =>
                                    setExpandedVisitId(
                                      expandedVisitId === visit.visitation_id
                                        ? null
                                        : visit.visitation_id
                                    )
                                  }
                                >
                                  <td className="expand-icon">
                                    {expandedVisitId === visit.visitation_id ? '▼' : '▶'}
                                  </td>
                                  <td>{formatDate(visit.visit_date)}</td>
                                  <td>{visit.visit_type || 'N/A'}</td>
                                  <td>{visit.social_worker || 'N/A'}</td>
                                  <td>{visit.family_cooperation_level || 'N/A'}</td>
                                  <td>{visit.visit_outcome || 'N/A'}</td>
                                  <td
                                    className="action-cell"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      type="button"
                                      className="btn-small btn-edit-lite"
                                      onClick={() => openEditVisitModal(visit)}
                                      disabled={deletingVisitId === visit.visitation_id}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-small btn-delete"
                                      onClick={() =>
                                        setShowDeleteVisitConfirm(visit.visitation_id)
                                      }
                                      disabled={deletingVisitId === visit.visitation_id}
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>

                                {expandedVisitId === visit.visitation_id && (
                                  <tr className="expanded-details">
                                    <td colSpan={7}>
                                      <div className="details-grid">
                                        <div className="detail-section">
                                          <h4>Visit Details</h4>
                                          <div className="detail-item">
                                            <span className="label">Location Visited</span>
                                            <span className="value">
                                              {visit.location_visited || 'N/A'}
                                            </span>
                                          </div>
                                          <div className="detail-item">
                                            <span className="label">
                                              Family Members Present
                                            </span>
                                            <span className="value">
                                              {visit.family_members_present || 'N/A'}
                                            </span>
                                          </div>
                                          <div className="detail-item">
                                            <span className="label">Purpose</span>
                                            <span className="value">
                                              {visit.purpose || 'N/A'}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="detail-section">
                                          <h4>Safety & Follow-Up</h4>
                                          <div className="detail-item">
                                            <span className="label">
                                              Safety Concerns Noted
                                            </span>
                                            <span className="value">
                                              {visit.safety_concerns_noted ? 'Yes' : 'No'}
                                            </span>
                                          </div>
                                          <div className="detail-item">
                                            <span className="label">Follow-Up Needed</span>
                                            <span className="value">
                                              {visit.follow_up_needed ? 'Yes' : 'No'}
                                            </span>
                                          </div>
                                          <div className="detail-item">
                                            <span className="label">Follow-Up Notes</span>
                                            <span className="value">
                                              {visit.follow_up_notes || 'None recorded'}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="detail-section detail-section-wide">
                                          <h4>Observations</h4>
                                          <p className="detail-paragraph">
                                            {visit.observations || 'No observations recorded.'}
                                          </p>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}

                                {showDeleteVisitConfirm === visit.visitation_id && (
                                  <tr className="delete-confirm-row">
                                    <td colSpan={7}>
                                      <div className="delete-confirm-box">
                                        <p>
                                          Are you sure you want to delete this home visitation?
                                        </p>
                                        <p className="delete-subtext">
                                          This action cannot be undone.
                                        </p>
                                        <div className="confirm-actions">
                                          <button
                                            type="button"
                                            className="btn-confirm-delete"
                                            onClick={() =>
                                              handleDeleteVisit(visit.visitation_id)
                                            }
                                            disabled={deletingVisitId === visit.visitation_id}
                                          >
                                            {deletingVisitId === visit.visitation_id
                                              ? 'Deleting...'
                                              : 'Yes, Delete'}
                                          </button>
                                          <button
                                            type="button"
                                            className="btn-confirm-cancel"
                                            onClick={() => setShowDeleteVisitConfirm(null)}
                                            disabled={deletingVisitId === visit.visitation_id}
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="conference-section-label">Upcoming Case Conferences</div>
              <div className="table-section">
                {upcomingPlans.length === 0 ? (
                  <div className="no-data">No upcoming case conferences found.</div>
                ) : (
                  <div className="table-wrapper">
                    <table className="home-visits-table conference-layout">
                      <thead>
                        <tr>
                          <th></th>
                          <th>Conference Date</th>
                          <th>Category</th>
                          <th>Services Provided</th>
                          <th>Status</th>
                          <th>Target Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {upcomingPlans.map((plan) => (
                          <tr key={`upcoming-block-${plan.plan_id}`}>
                            <td colSpan={7} className="row-block-cell">
                              <table className="embedded-row-table conference-layout">
                                <tbody>
                                  <tr
                                    className="visit-row"
                                    onClick={() =>
                                      setExpandedUpcomingPlanId(
                                        expandedUpcomingPlanId === plan.plan_id
                                          ? null
                                          : plan.plan_id
                                      )
                                    }
                                  >
                                    <td className="expand-icon">
                                      {expandedUpcomingPlanId === plan.plan_id ? '▼' : '▶'}
                                    </td>
                                    <td>{formatDate(plan.case_conference_date)}</td>
                                    <td>{plan.plan_category || 'N/A'}</td>
                                    <td>{plan.services_provided || 'N/A'}</td>
                                    <td>
                                      <span
                                        className={`status-pill ${statusClass(plan.status)}`}
                                      >
                                        {plan.status || 'Unknown'}
                                      </span>
                                    </td>
                                    <td>{formatDate(plan.target_date)}</td>
                                    <td
                                      className="action-cell"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        type="button"
                                        className="btn-small btn-edit-lite"
                                        onClick={() => openEditPlanModal(plan)}
                                        disabled={deletingPlanId === plan.plan_id}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        className="btn-small btn-delete"
                                        onClick={() =>
                                          setShowDeletePlanConfirm(plan.plan_id)
                                        }
                                        disabled={deletingPlanId === plan.plan_id}
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>

                                  {expandedUpcomingPlanId === plan.plan_id && (
                                    <tr className="expanded-details">
                                      <td colSpan={7}>
                                        <div className="details-grid">
                                          <div className="detail-section">
                                            <h4>Conference Details</h4>
                                            <div className="detail-item">
                                              <span className="label">Category</span>
                                              <span className="value">
                                                {plan.plan_category || 'N/A'}
                                              </span>
                                            </div>
                                            <div className="detail-item">
                                              <span className="label">Status</span>
                                              <span className="value">
                                                {plan.status || 'N/A'}
                                              </span>
                                            </div>
                                            <div className="detail-item">
                                              <span className="label">Target Value</span>
                                              <span className="value">
                                                {plan.target_value ?? 'N/A'}
                                              </span>
                                            </div>
                                          </div>

                                          <div className="detail-section">
                                            <h4>Timeline</h4>
                                            <div className="detail-item">
                                              <span className="label">Conference Date</span>
                                              <span className="value">
                                                {formatDate(plan.case_conference_date)}
                                              </span>
                                            </div>
                                            <div className="detail-item">
                                              <span className="label">Target Date</span>
                                              <span className="value">
                                                {formatDate(plan.target_date)}
                                              </span>
                                            </div>
                                            <div className="detail-item">
                                              <span className="label">Last Updated</span>
                                              <span className="value">
                                                {formatDate(plan.updated_at)}
                                              </span>
                                            </div>
                                          </div>

                                          <div className="detail-section detail-section-wide">
                                            <h4>Plan Description</h4>
                                            <p className="detail-paragraph">
                                              {plan.plan_description ||
                                                'No description recorded.'}
                                            </p>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}

                                  {showDeletePlanConfirm === plan.plan_id && (
                                    <tr className="delete-confirm-row">
                                      <td colSpan={7}>
                                        <div className="delete-confirm-box">
                                          <p>
                                            Are you sure you want to delete this case
                                            conference record?
                                          </p>
                                          <p className="delete-subtext">
                                            This action cannot be undone.
                                          </p>
                                          <div className="confirm-actions">
                                            <button
                                              type="button"
                                              className="btn-confirm-delete"
                                              onClick={() => handleDeletePlan(plan.plan_id)}
                                              disabled={deletingPlanId === plan.plan_id}
                                            >
                                              {deletingPlanId === plan.plan_id
                                                ? 'Deleting...'
                                                : 'Yes, Delete'}
                                            </button>
                                            <button
                                              type="button"
                                              className="btn-confirm-cancel"
                                              onClick={() => setShowDeletePlanConfirm(null)}
                                              disabled={deletingPlanId === plan.plan_id}
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="conference-section-label">Past Case Conferences</div>
              <div className="table-section">
                {pastPlans.length === 0 ? (
                  <div className="no-data">No past case conferences found.</div>
                ) : (
                  <div className="table-wrapper">
                    <table className="home-visits-table conference-layout">
                      <thead>
                        <tr>
                          <th></th>
                          <th>Conference Date</th>
                          <th>Category</th>
                          <th>Services Provided</th>
                          <th>Status</th>
                          <th>Target Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pastPlans.map((plan) => (
                          <tr key={`past-block-${plan.plan_id}`}>
                            <td colSpan={7} className="row-block-cell">
                              <table className="embedded-row-table conference-layout">
                                <tbody>
                                  <tr
                                    className="visit-row"
                                    onClick={() =>
                                      setExpandedPastPlanId(
                                        expandedPastPlanId === plan.plan_id
                                          ? null
                                          : plan.plan_id
                                      )
                                    }
                                  >
                                    <td className="expand-icon">
                                      {expandedPastPlanId === plan.plan_id ? '▼' : '▶'}
                                    </td>
                                    <td>{formatDate(plan.case_conference_date)}</td>
                                    <td>{plan.plan_category || 'N/A'}</td>
                                    <td>{plan.services_provided || 'N/A'}</td>
                                    <td>
                                      <span
                                        className={`status-pill ${statusClass(plan.status)}`}
                                      >
                                        {plan.status || 'Unknown'}
                                      </span>
                                    </td>
                                    <td>{formatDate(plan.target_date)}</td>
                                    <td
                                      className="action-cell"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        type="button"
                                        className="btn-small btn-edit-lite"
                                        onClick={() => openEditPlanModal(plan)}
                                        disabled={deletingPlanId === plan.plan_id}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        className="btn-small btn-delete"
                                        onClick={() =>
                                          setShowDeletePlanConfirm(plan.plan_id)
                                        }
                                        disabled={deletingPlanId === plan.plan_id}
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>

                                  {expandedPastPlanId === plan.plan_id && (
                                    <tr className="expanded-details">
                                      <td colSpan={7}>
                                        <div className="details-grid">
                                          <div className="detail-section">
                                            <h4>Conference Details</h4>
                                            <div className="detail-item">
                                              <span className="label">Category</span>
                                              <span className="value">
                                                {plan.plan_category || 'N/A'}
                                              </span>
                                            </div>
                                            <div className="detail-item">
                                              <span className="label">Status</span>
                                              <span className="value">
                                                {plan.status || 'N/A'}
                                              </span>
                                            </div>
                                            <div className="detail-item">
                                              <span className="label">Target Value</span>
                                              <span className="value">
                                                {plan.target_value ?? 'N/A'}
                                              </span>
                                            </div>
                                          </div>

                                          <div className="detail-section">
                                            <h4>Timeline</h4>
                                            <div className="detail-item">
                                              <span className="label">Conference Date</span>
                                              <span className="value">
                                                {formatDate(plan.case_conference_date)}
                                              </span>
                                            </div>
                                            <div className="detail-item">
                                              <span className="label">Target Date</span>
                                              <span className="value">
                                                {formatDate(plan.target_date)}
                                              </span>
                                            </div>
                                            <div className="detail-item">
                                              <span className="label">Last Updated</span>
                                              <span className="value">
                                                {formatDate(plan.updated_at)}
                                              </span>
                                            </div>
                                          </div>

                                          <div className="detail-section detail-section-wide">
                                            <h4>Plan Description</h4>
                                            <p className="detail-paragraph">
                                              {plan.plan_description ||
                                                'No description recorded.'}
                                            </p>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}

                                  {showDeletePlanConfirm === plan.plan_id && (
                                    <tr className="delete-confirm-row">
                                      <td colSpan={7}>
                                        <div className="delete-confirm-box">
                                          <p>
                                            Are you sure you want to delete this case
                                            conference record?
                                          </p>
                                          <p className="delete-subtext">
                                            This action cannot be undone.
                                          </p>
                                          <div className="confirm-actions">
                                            <button
                                              type="button"
                                              className="btn-confirm-delete"
                                              onClick={() => handleDeletePlan(plan.plan_id)}
                                              disabled={deletingPlanId === plan.plan_id}
                                            >
                                              {deletingPlanId === plan.plan_id
                                                ? 'Deleting...'
                                                : 'Yes, Delete'}
                                            </button>
                                            <button
                                              type="button"
                                              className="btn-confirm-cancel"
                                              onClick={() => setShowDeletePlanConfirm(null)}
                                              disabled={deletingPlanId === plan.plan_id}
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {showVisitModal && (
        <div className="modal-overlay active" onClick={resetVisitForm}>
          <div className="modal-content home-visitation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingVisitId !== null ? 'Edit Home Visit' : 'Add Home Visit'}</h2>
              <button className="modal-close" onClick={resetVisitForm}>
                ×
              </button>
            </div>

            <form onSubmit={handleVisitSubmit} className="resident-form">
              <div className="form-section">
                <h3>Visit Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Visit Date</label>
                    <input
                      type="date"
                      value={visitForm.visit_date}
                      onChange={(e) =>
                        setVisitForm({ ...visitForm, visit_date: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Social Worker</label>
                    <input
                      type="text"
                      value={visitForm.social_worker}
                      onChange={(e) =>
                        setVisitForm({ ...visitForm, social_worker: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Visit Type</label>
                    <select
                      value={visitForm.visit_type}
                      onChange={(e) =>
                        setVisitForm({ ...visitForm, visit_type: e.target.value })
                      }
                      required
                    >
                      <option value="">Select type</option>
                      <option value="Initial Assessment">Initial Assessment</option>
                      <option value="Routine Follow-Up">Routine Follow-Up</option>
                      <option value="Reintegration Assessment">
                        Reintegration Assessment
                      </option>
                      <option value="Post-Placement Monitoring">
                        Post-Placement Monitoring
                      </option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Family Cooperation Level</label>
                    <select
                      value={visitForm.family_cooperation_level}
                      onChange={(e) =>
                        setVisitForm({
                          ...visitForm,
                          family_cooperation_level: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select level</option>
                      <option value="Highly Cooperative">Highly Cooperative</option>
                      <option value="Cooperative">Cooperative</option>
                      <option value="Neutral">Neutral</option>
                      <option value="Uncooperative">Uncooperative</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Visit Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Location Visited</label>
                    <input
                      type="text"
                      value={visitForm.location_visited}
                      onChange={(e) =>
                        setVisitForm({ ...visitForm, location_visited: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Family Members Present</label>
                    <input
                      type="text"
                      value={visitForm.family_members_present}
                      onChange={(e) =>
                        setVisitForm({
                          ...visitForm,
                          family_members_present: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-row full">
                  <div className="form-group">
                    <label>Purpose</label>
                    <input
                      type="text"
                      value={visitForm.purpose}
                      onChange={(e) =>
                        setVisitForm({ ...visitForm, purpose: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-row full">
                  <div className="form-group">
                    <label>Observations</label>
                    <textarea
                      value={visitForm.observations}
                      onChange={(e) =>
                        setVisitForm({ ...visitForm, observations: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Outcome & Follow-Up</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Visit Outcome</label>
                    <select
                      value={visitForm.visit_outcome}
                      onChange={(e) =>
                        setVisitForm({ ...visitForm, visit_outcome: e.target.value })
                      }
                      required
                    >
                      <option value="">Select outcome</option>
                      <option value="Favorable">Favorable</option>
                      <option value="Needs Improvement">Needs Improvement</option>
                      <option value="Unfavorable">Unfavorable</option>
                      <option value="Inconclusive">Inconclusive</option>
                    </select>
                  </div>

                  <div className="form-group checkbox-column">
                    <label className="checkbox-inline">
                      <input
                        type="checkbox"
                        checked={visitForm.safety_concerns_noted}
                        onChange={(e) =>
                          setVisitForm({
                            ...visitForm,
                            safety_concerns_noted: e.target.checked,
                          })
                        }
                      />
                      Safety Concerns Noted
                    </label>

                    <label className="checkbox-inline">
                      <input
                        type="checkbox"
                        checked={visitForm.follow_up_needed}
                        onChange={(e) =>
                          setVisitForm({
                            ...visitForm,
                            follow_up_needed: e.target.checked,
                            follow_up_notes: e.target.checked
                              ? visitForm.follow_up_notes
                              : '',
                          })
                        }
                      />
                      Follow-Up Needed
                    </label>
                  </div>
                </div>

                <div className="form-row full">
                  <div className="form-group">
                    <label>Follow-Up Notes</label>
                    <textarea
                      value={visitForm.follow_up_notes}
                      onChange={(e) =>
                        setVisitForm({
                          ...visitForm,
                          follow_up_notes: e.target.value,
                        })
                      }
                      required={visitForm.follow_up_needed}
                      disabled={!visitForm.follow_up_needed}
                      placeholder={
                        visitForm.follow_up_needed
                          ? 'Enter required follow-up notes'
                          : 'Check "Follow-Up Needed" to add notes'
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={resetVisitForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submittingVisit}>
                  {submittingVisit
                    ? 'Saving...'
                    : editingVisitId !== null
                    ? 'Update Home Visit'
                    : 'Create Home Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPlanModal && (
        <div className="modal-overlay active" onClick={resetPlanForm}>
          <div className="modal-content home-visitation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingPlanId !== null
                  ? 'Edit Case Conference Record'
                  : 'Add Case Conference Record'}
              </h2>
              <button className="modal-close" onClick={resetPlanForm}>
                ×
              </button>
            </div>

            <form onSubmit={handlePlanSubmit} className="resident-form">
              <div className="form-section">
                <h3>Conference Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Conference Date</label>
                    <input
                      type="date"
                      value={planForm.case_conference_date ?? ''}
                      onChange={(e) =>
                        setPlanForm({
                          ...planForm,
                          case_conference_date: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={planForm.plan_category}
                      onChange={(e) =>
                        setPlanForm({
                          ...planForm,
                          plan_category: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Safety">Safety</option>
                      <option value="Psychosocial">Psychosocial</option>
                      <option value="Education">Education</option>
                      <option value="Physical Health">Physical Health</option>
                      <option value="Legal">Legal</option>
                      <option value="Reintegration">Reintegration</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Services Provided</label>
                    <input
                      type="text"
                      value={planForm.services_provided}
                      onChange={(e) =>
                        setPlanForm({
                          ...planForm,
                          services_provided: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={planForm.status}
                      onChange={(e) =>
                        setPlanForm({
                          ...planForm,
                          status: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select status</option>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Achieved">Achieved</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Target Date</label>
                    <input
                      type="date"
                      value={planForm.target_date ?? ''}
                      onChange={(e) =>
                        setPlanForm({
                          ...planForm,
                          target_date: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Target Value</label>
                    <input
                      type="number"
                      value={planForm.target_value ?? ''}
                      onChange={(e) =>
                        setPlanForm({
                          ...planForm,
                          target_value:
                            e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Plan Description</h3>
                <div className="form-row full">
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={planForm.plan_description}
                      onChange={(e) =>
                        setPlanForm({
                          ...planForm,
                          plan_description: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={resetPlanForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submittingPlan}>
                  {submittingPlan
                    ? 'Saving...'
                    : editingPlanId !== null
                    ? 'Update Case Conference Record'
                    : 'Create Case Conference Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}