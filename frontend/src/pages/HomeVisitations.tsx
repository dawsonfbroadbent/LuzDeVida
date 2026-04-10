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
import React from 'react'

type ActiveView = 'homeVisits' | 'caseConferences'

interface HomeVisitationsProps {
  embedded?: boolean
}

export default function HomeVisitations({
  embedded = false,
}: HomeVisitationsProps) {
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

  const getLocalDateString = () =>
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0]

  const toInputDate = (dateString?: string | null) => {
    if (!dateString) return ''
    return dateString.split('T')[0]
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A'
    return dateString.split('T')[0]
  }

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

  const [visitForm, setVisitForm] = useState<home_visitation>({
    ...emptyVisitForm,
    visit_date: getLocalDateString(),
  })

  const [planForm, setPlanForm] = useState<intervention_plan>({
    ...emptyPlanForm,
    case_conference_date: getLocalDateString(),
  })

  const selectedResident = useMemo(
    () => residents.find((r) => r.resident_id === selectedResidentId) ?? null,
    [residents, selectedResidentId]
  )

  const upcomingPlans = useMemo(() => {
    const today = getLocalDateString()

    return [...plans]
      .filter((p) => {
        if (!p.case_conference_date) return false
        return p.case_conference_date.split('T')[0] >= today
      })
      .sort((a, b) =>
        (a.case_conference_date ?? '').localeCompare(b.case_conference_date ?? '')
      )
  }, [plans])

  const pastPlans = useMemo(() => {
    const today = getLocalDateString()

    return [...plans]
      .filter((p) => {
        if (!p.case_conference_date) return true
        return p.case_conference_date.split('T')[0] < today
      })
      .sort((a, b) =>
        (b.case_conference_date ?? '').localeCompare(a.case_conference_date ?? '')
      )
  }, [plans])

  const pageClassName = `home-visitations${embedded ? ' home-visitations--embedded' : ''}`

  const showTemporarySuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const statusBadgeStyle = (status?: string | null): React.CSSProperties => {
    const normalized = (status || '').toLowerCase()

    if (normalized === 'open') {
      return {
        background: '#e7f3ff',
        color: '#1f5fa8',
        padding: '6px 10px',
        borderRadius: '999px',
        fontWeight: 700,
        fontSize: '0.78rem',
        display: 'inline-block',
      }
    }

    if (normalized === 'in progress') {
      return {
        background: '#fff3d6',
        color: '#8a5a00',
        padding: '6px 10px',
        borderRadius: '999px',
        fontWeight: 700,
        fontSize: '0.78rem',
        display: 'inline-block',
      }
    }

    if (normalized === 'achieved') {
      return {
        background: '#e8f8ee',
        color: '#1f7a45',
        padding: '6px 10px',
        borderRadius: '999px',
        fontWeight: 700,
        fontSize: '0.78rem',
        display: 'inline-block',
      }
    }

    if (normalized === 'on hold') {
      return {
        background: '#f6ebff',
        color: '#6f3eb2',
        padding: '6px 10px',
        borderRadius: '999px',
        fontWeight: 700,
        fontSize: '0.78rem',
        display: 'inline-block',
      }
    }

    if (normalized === 'closed') {
      return {
        background: '#fbe9e9',
        color: '#9b2e2e',
        padding: '6px 10px',
        borderRadius: '999px',
        fontWeight: 700,
        fontSize: '0.78rem',
        display: 'inline-block',
      }
    }

    return {
      background: '#edf0f2',
      color: '#4d5a61',
      padding: '6px 10px',
      borderRadius: '999px',
      fontWeight: 700,
      fontSize: '0.78rem',
      display: 'inline-block',
    }
  }

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(18, 30, 34, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 1000,
  }

  const modalContentStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '980px',
    maxHeight: '90vh',
    overflowY: 'auto',
    background: 'white',
    borderRadius: '24px',
    border: '1px solid var(--cream-darker)',
    boxShadow: '0 24px 60px rgba(23, 53, 59, 0.18)',
  }

  const modalHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 22px',
    borderBottom: '1px solid var(--cream-darker)',
  }

  const modalCloseStyle: React.CSSProperties = {
    border: 'none',
    background: 'transparent',
    fontSize: '1.4rem',
    cursor: 'pointer',
    color: 'var(--text-light)',
  }

  const detailBoxStyle: React.CSSProperties = {
    marginTop: 12,
    padding: 16,
    background: 'rgba(249, 252, 253, 0.95)',
    borderTop: '1px solid var(--cream-darker)',
  }

  const detailGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 12,
  }

  const detailCardStyle: React.CSSProperties = {
    background: 'white',
    border: '1px solid var(--cream-darker)',
    borderRadius: 16,
    padding: 14,
  }

  const detailLabelStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--text-light)',
    fontWeight: 700,
    marginBottom: 6,
  }

  const actionButtonRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  }

  const formGridTwoColStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))',
    gap: 14,
  }

  const fullWidthStyle: React.CSSProperties = {
    gridColumn: '1 / -1',
  }

  const deleteConfirmStyle: React.CSSProperties = {
    marginTop: 10,
    padding: 14,
    border: '1px solid #efc4c4',
    borderRadius: 16,
    background: '#fff6f6',
  }

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
      visit_date: getLocalDateString(),
    })
    setEditingVisitId(null)
    setShowVisitModal(false)
  }

  const resetPlanForm = () => {
    setPlanForm({
      ...emptyPlanForm,
      resident_id: selectedResidentId ?? 0,
      case_conference_date: getLocalDateString(),
    })
    setEditingPlanId(null)
    setShowPlanModal(false)
  }

  const openCreateVisitModal = () => {
    setError(null)
    setShowDeleteVisitConfirm(null)
    setExpandedVisitId(null)
    setVisitForm({
      ...emptyVisitForm,
      resident_id: selectedResidentId ?? 0,
      visit_date: getLocalDateString(),
    })
    setEditingVisitId(null)
    setShowVisitModal(true)
  }

  const openEditVisitModal = (visit: home_visitation) => {
    setError(null)
    setShowDeleteVisitConfirm(null)
    setVisitForm({
      ...visit,
      visit_date: toInputDate(visit.visit_date),
    })
    setEditingVisitId(visit.visitation_id)
    setShowVisitModal(true)
    setActiveView('homeVisits')
  }

  const openCreatePlanModal = () => {
    setError(null)
    setShowDeletePlanConfirm(null)
    setExpandedUpcomingPlanId(null)
    setExpandedPastPlanId(null)
    setPlanForm({
      ...emptyPlanForm,
      resident_id: selectedResidentId ?? 0,
      case_conference_date: getLocalDateString(),
    })
    setEditingPlanId(null)
    setShowPlanModal(true)
  }

  const openEditPlanModal = (plan: intervention_plan) => {
    setError(null)
    setShowDeletePlanConfirm(null)
    setPlanForm({
      ...plan,
      target_date: toInputDate(plan.target_date),
      case_conference_date: toInputDate(plan.case_conference_date),
    })
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
        visit_date: toInputDate(visitForm.visit_date),
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
          target_date: toInputDate(planForm.target_date),
          case_conference_date: toInputDate(planForm.case_conference_date),
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
          target_date: toInputDate(planForm.target_date),
          status: planForm.status,
          case_conference_date: toInputDate(planForm.case_conference_date),
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

      if (editingVisitId === visitationId) {
        resetVisitForm()
      }

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

      if (editingPlanId === planId) {
        resetPlanForm()
      }

      setShowDeletePlanConfirm(null)
      showTemporarySuccess('Case conference record deleted successfully!')
    } catch (err) {
      console.error(err)
      setError('Failed to delete case conference record. Please try again.')
    } finally {
      setDeletingPlanId(null)
    }
  }

  if (loading) {
    return (
      <div className={pageClassName}>
        <div className="home-visitations__header">
          <h1>Home Visitations &amp; Case Conferences</h1>
          <p className="subtitle">
            Document family visits, follow-up needs, and case conference history.
          </p>
        </div>

        <div className="home-visitations__panel home-visitations__status-card">
          Loading home visitations and case conferences...
        </div>
      </div>
    )
  }

  return (
    <div className={pageClassName}>
      <div className="home-visitations__header">
        <h1>Home Visitations &amp; Case Conferences</h1>
        <p className="subtitle">
          Manage home and field visits, family observations, and case conference planning
          for each resident.
        </p>
      </div>

      {error && (
        <div className="home-visitations__alert home-visitations__alert--error">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="home-visitations__alert-close"
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className="home-visitations__alert home-visitations__alert--success">
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="home-visitations__alert-close"
          >
            ×
          </button>
        </div>
      )}

      {residents.length === 0 ? (
        <div className="home-visitations__panel home-visitations__status-card">
          <p style={{ marginTop: 0 }}>No residents found.</p>
          <p>Add residents first before managing home visitations or case conferences.</p>
          <button
            type="button"
            onClick={loadResidents}
            className="home-visitations__button home-visitations__button--primary"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="home-visitations__panel home-visitations__resident-picker">
            <label htmlFor="resident-select">Select Resident</label>
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

          <div className="home-visitations__toggle">
            <button
              type="button"
              onClick={() => setActiveView('homeVisits')}
              className={`home-visitations__toggle-btn${
                activeView === 'homeVisits' ? ' is-active' : ''
              }`}
            >
              Home Visits
            </button>
            <button
              type="button"
              onClick={() => setActiveView('caseConferences')}
              className={`home-visitations__toggle-btn${
                activeView === 'caseConferences' ? ' is-active' : ''
              }`}
            >
              Case Conference History
            </button>
          </div>

          <div className="home-visitations__actions">
            {activeView === 'homeVisits' ? (
              <button
                type="button"
                onClick={openCreateVisitModal}
                className="home-visitations__button home-visitations__button--primary"
                disabled={contentLoading}
              >
                Add Home Visit
              </button>
            ) : (
              <button
                type="button"
                onClick={openCreatePlanModal}
                className="home-visitations__button home-visitations__button--primary"
                disabled={contentLoading}
              >
                Add Case Conference Record
              </button>
            )}
          </div>

          {contentLoading ? (
            <div className="home-visitations__panel home-visitations__status-card">
              Loading resident records...
            </div>
          ) : activeView === 'homeVisits' ? (
            <div className="home-visitations__table-card">
              <table className="home-visitations__table">
                <thead>
                  <tr>
                    <th>Visit Date</th>
                    <th>Visit Type</th>
                    <th>Social Worker</th>
                    <th>Family Cooperation</th>
                    <th>Outcome</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        No home visitations found for this resident. Create one to get
                        started.
                      </td>
                    </tr>
                  ) : (
                    visits.map((visit) => (
                      <React.Fragment key={visit.visitation_id}>
                        <tr
                          onClick={() =>
                            setExpandedVisitId(
                              expandedVisitId === visit.visitation_id
                                ? null
                                : visit.visitation_id
                            )
                          }
                          style={{ cursor: 'pointer' }}
                        >
                          <td>{formatDate(visit.visit_date)}</td>
                          <td>{visit.visit_type || 'N/A'}</td>
                          <td>{visit.social_worker || 'N/A'}</td>
                          <td>{visit.family_cooperation_level || 'N/A'}</td>
                          <td>{visit.visit_outcome || 'N/A'}</td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div style={actionButtonRowStyle}>
                              <button
                                type="button"
                                onClick={() => openEditVisitModal(visit)}
                                className="home-visitations__button home-visitations__button--secondary"
                                disabled={deletingVisitId === visit.visitation_id}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setShowDeleteVisitConfirm((current) =>
                                    current === visit.visitation_id
                                      ? null
                                      : visit.visitation_id
                                  )
                                }
                                className="home-visitations__button home-visitations__button--danger"
                                disabled={deletingVisitId === visit.visitation_id}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>

                        {expandedVisitId === visit.visitation_id && (
                          <tr>
                            <td colSpan={6} style={{ padding: 0 }}>
                              <div style={detailBoxStyle}>
                                <div style={detailGridStyle}>
                                  <div style={detailCardStyle}>
                                    <div style={detailLabelStyle}>Location Visited</div>
                                    <div>{visit.location_visited || 'N/A'}</div>
                                  </div>

                                  <div style={detailCardStyle}>
                                    <div style={detailLabelStyle}>Family Members Present</div>
                                    <div>{visit.family_members_present || 'N/A'}</div>
                                  </div>

                                  <div style={detailCardStyle}>
                                    <div style={detailLabelStyle}>Purpose</div>
                                    <div>{visit.purpose || 'N/A'}</div>
                                  </div>

                                  <div style={detailCardStyle}>
                                    <div style={detailLabelStyle}>Safety Concerns Noted</div>
                                    <div>{visit.safety_concerns_noted ? 'Yes' : 'No'}</div>
                                  </div>

                                  <div style={detailCardStyle}>
                                    <div style={detailLabelStyle}>Follow-Up Needed</div>
                                    <div>{visit.follow_up_needed ? 'Yes' : 'No'}</div>
                                  </div>

                                  <div style={detailCardStyle}>
                                    <div style={detailLabelStyle}>Follow-Up Notes</div>
                                    <div>{visit.follow_up_notes || 'None recorded'}</div>
                                  </div>

                                  <div
                                    style={{
                                      ...detailCardStyle,
                                      gridColumn: '1 / -1',
                                    }}
                                  >
                                    <div style={detailLabelStyle}>Observations</div>
                                    <div>{visit.observations || 'No observations recorded.'}</div>
                                  </div>
                                </div>

                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <>
              <h2 style={{ marginTop: 0 }}>Upcoming Case Conferences</h2>
              <div className="home-visitations__table-card home-visitations__table-card--spaced">
                <table className="home-visitations__table">
                  <thead>
                    <tr>
                      <th>Conference Date</th>
                      <th>Category</th>
                      <th>Services Provided</th>
                      <th>Status</th>
                      <th>Target Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingPlans.length === 0 ? (
                      <tr>
                        <td colSpan={6}>No upcoming case conferences found.</td>
                      </tr>
                    ) : (
                      upcomingPlans.map((plan) => (
                        <React.Fragment key={plan.plan_id}>
                          <tr
                            onClick={() =>
                              setExpandedUpcomingPlanId(
                                expandedUpcomingPlanId === plan.plan_id
                                  ? null
                                  : plan.plan_id
                              )
                            }
                            style={{ cursor: 'pointer' }}
                          >
                            <td>{formatDate(plan.case_conference_date)}</td>
                            <td>{plan.plan_category || 'N/A'}</td>
                            <td>{plan.services_provided || 'N/A'}</td>
                            <td>
                              <span style={statusBadgeStyle(plan.status)}>
                                {plan.status || 'Unknown'}
                              </span>
                            </td>
                            <td>{formatDate(plan.target_date)}</td>
                            <td onClick={(e) => e.stopPropagation()}>
                              <div style={actionButtonRowStyle}>
                                <button
                                  type="button"
                                  onClick={() => openEditPlanModal(plan)}
                                  className="home-visitations__button home-visitations__button--secondary"
                                  disabled={deletingPlanId === plan.plan_id}
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowDeletePlanConfirm((current) =>
                                      current === plan.plan_id ? null : plan.plan_id
                                    )
                                  }
                                  className="home-visitations__button home-visitations__button--danger"
                                  disabled={deletingPlanId === plan.plan_id}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>

                          {expandedUpcomingPlanId === plan.plan_id && (
                            <tr>
                              <td colSpan={6} style={{ padding: 0 }}>
                                <div style={detailBoxStyle}>
                                  <div style={detailGridStyle}>
                                    <div style={detailCardStyle}>
                                      <div style={detailLabelStyle}>Category</div>
                                      <div>{plan.plan_category || 'N/A'}</div>
                                    </div>

                                    <div style={detailCardStyle}>
                                      <div style={detailLabelStyle}>Status</div>
                                      <div>{plan.status || 'N/A'}</div>
                                    </div>

                                    <div style={detailCardStyle}>
                                      <div style={detailLabelStyle}>Target Value</div>
                                      <div>{plan.target_value ?? 'N/A'}</div>
                                    </div>

                                    <div style={detailCardStyle}>
                                      <div style={detailLabelStyle}>Conference Date</div>
                                      <div>{formatDate(plan.case_conference_date)}</div>
                                    </div>

                                    <div style={detailCardStyle}>
                                      <div style={detailLabelStyle}>Target Date</div>
                                      <div>{formatDate(plan.target_date)}</div>
                                    </div>

                                    <div style={detailCardStyle}>
                                      <div style={detailLabelStyle}>Last Updated</div>
                                      <div>{formatDate(plan.updated_at)}</div>
                                    </div>

                                    <div
                                      style={{
                                        ...detailCardStyle,
                                        gridColumn: '1 / -1',
                                      }}
                                    >
                                      <div style={detailLabelStyle}>Plan Description</div>
                                      <div>{plan.plan_description || 'No description recorded.'}</div>
                                    </div>
                                  </div>

                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <h2>Past Case Conferences</h2>
              <div className="home-visitations__table-card">
                <table className="home-visitations__table">
                  <thead>
                    <tr>
                      <th>Conference Date</th>
                      <th>Category</th>
                      <th>Services Provided</th>
                      <th>Status</th>
                      <th>Target Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastPlans.length === 0 ? (
                      <tr>
                        <td colSpan={6}>No past case conferences found.</td>
                      </tr>
                    ) : (
                      pastPlans.map((plan) => (
                        <React.Fragment key={plan.plan_id}>
                          <tr
                            onClick={() =>
                              setExpandedPastPlanId(
                                expandedPastPlanId === plan.plan_id ? null : plan.plan_id
                              )
                            }
                            style={{ cursor: 'pointer' }}
                          >
                            <td>{formatDate(plan.case_conference_date)}</td>
                            <td>{plan.plan_category || 'N/A'}</td>
                            <td>{plan.services_provided || 'N/A'}</td>
                            <td>
                              <span style={statusBadgeStyle(plan.status)}>
                                {plan.status || 'Unknown'}
                              </span>
                            </td>
                            <td>{formatDate(plan.target_date)}</td>
                            <td onClick={(e) => e.stopPropagation()}>
                              <div style={actionButtonRowStyle}>
                                <button
                                  type="button"
                                  onClick={() => openEditPlanModal(plan)}
                                  className="home-visitations__button home-visitations__button--secondary"
                                  disabled={deletingPlanId === plan.plan_id}
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowDeletePlanConfirm((current) =>
                                      current === plan.plan_id ? null : plan.plan_id
                                    )
                                  }
                                  className="home-visitations__button home-visitations__button--danger"
                                  disabled={deletingPlanId === plan.plan_id}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>

                          {expandedPastPlanId === plan.plan_id && (
                            <tr>
                              <td colSpan={6} style={{ padding: 0 }}>
                                <div style={detailBoxStyle}>
                                  <div style={detailGridStyle}>
                                    <div style={detailCardStyle}>
                                      <div style={detailLabelStyle}>Category</div>
                                      <div>{plan.plan_category || 'N/A'}</div>
                                    </div>

                                    <div style={detailCardStyle}>
                                      <div style={detailLabelStyle}>Status</div>
                                      <div>{plan.status || 'N/A'}</div>
                                    </div>

                                    <div style={detailCardStyle}>
                                      <div style={detailLabelStyle}>Target Value</div>
                                      <div>{plan.target_value ?? 'N/A'}</div>
                                    </div>

                                    <div style={detailCardStyle}>
                                      <div style={detailLabelStyle}>Conference Date</div>
                                      <div>{formatDate(plan.case_conference_date)}</div>
                                    </div>

                                    <div style={detailCardStyle}>
                                      <div style={detailLabelStyle}>Target Date</div>
                                      <div>{formatDate(plan.target_date)}</div>
                                    </div>

                                    <div style={detailCardStyle}>
                                      <div style={detailLabelStyle}>Last Updated</div>
                                      <div>{formatDate(plan.updated_at)}</div>
                                    </div>

                                    <div
                                      style={{
                                        ...detailCardStyle,
                                        gridColumn: '1 / -1',
                                      }}
                                    >
                                      <div style={detailLabelStyle}>Plan Description</div>
                                      <div>{plan.plan_description || 'No description recorded.'}</div>
                                    </div>
                                  </div>

                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {showVisitModal && (
        <div style={modalOverlayStyle} onClick={resetVisitForm}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={{ margin: 0 }}>
                {editingVisitId !== null ? 'Edit Home Visit' : 'Add Home Visit'}
              </h2>
              <button type="button" style={modalCloseStyle} onClick={resetVisitForm}>
                ×
              </button>
            </div>

            <form
              onSubmit={handleVisitSubmit}
              className="home-visitations__form"
              style={{ marginBottom: 0, borderRadius: 0, boxShadow: 'none', border: 'none' }}
            >
              <div style={formGridTwoColStyle}>
                <div>
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

                <div>
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

                <div>
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

                <div>
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

                <div>
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

                <div>
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

                <div style={fullWidthStyle}>
                  <label>Purpose</label>
                  <input
                    type="text"
                    value={visitForm.purpose}
                    onChange={(e) => setVisitForm({ ...visitForm, purpose: e.target.value })}
                    required
                  />
                </div>

                <div style={fullWidthStyle}>
                  <label>Observations</label>
                  <textarea
                    value={visitForm.observations}
                    onChange={(e) =>
                      setVisitForm({ ...visitForm, observations: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
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

                <div>
                  <label style={{ marginBottom: 10 }}>Flags</label>
                  <div style={{ display: 'grid', gap: 10, paddingTop: 6 }}>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: 0,
                        textTransform: 'none',
                        letterSpacing: 'normal',
                      }}
                    >
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

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: 0,
                        textTransform: 'none',
                        letterSpacing: 'normal',
                      }}
                    >
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

                <div style={fullWidthStyle}>
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

              <div style={{ marginTop: 18, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  className="home-visitations__button home-visitations__button--primary"
                  disabled={submittingVisit}
                >
                  {submittingVisit
                    ? 'Saving...'
                    : editingVisitId !== null
                    ? 'Update Home Visit'
                    : 'Create Home Visit'}
                </button>

                <button
                  type="button"
                  onClick={resetVisitForm}
                  className="home-visitations__button home-visitations__button--secondary"
                  disabled={submittingVisit}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteVisitConfirm !== null && (
        <div style={modalOverlayStyle} onClick={() => setShowDeleteVisitConfirm(null)}>
          <div style={{ ...modalContentStyle, maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={{ margin: 0 }}>Delete Home Visitation</h2>
              <button type="button" style={modalCloseStyle} onClick={() => setShowDeleteVisitConfirm(null)}>×</button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ background: '#fff6f6', border: '1px solid #efc4c4', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Warning: This action cannot be undone</p>
                <p style={{ margin: 0 }}>Are you sure you want to delete this home visitation record?</p>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowDeleteVisitConfirm(null)}
                  className="home-visitations__button home-visitations__button--secondary"
                  disabled={deletingVisitId === showDeleteVisitConfirm}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteVisit(showDeleteVisitConfirm)}
                  className="home-visitations__button home-visitations__button--danger"
                  disabled={deletingVisitId === showDeleteVisitConfirm}
                >
                  {deletingVisitId === showDeleteVisitConfirm ? 'Deleting...' : 'Delete Visitation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeletePlanConfirm !== null && (
        <div style={modalOverlayStyle} onClick={() => setShowDeletePlanConfirm(null)}>
          <div style={{ ...modalContentStyle, maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={{ margin: 0 }}>Delete Case Conference Record</h2>
              <button type="button" style={modalCloseStyle} onClick={() => setShowDeletePlanConfirm(null)}>×</button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ background: '#fff6f6', border: '1px solid #efc4c4', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Warning: This action cannot be undone</p>
                <p style={{ margin: 0 }}>Are you sure you want to delete this case conference record?</p>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowDeletePlanConfirm(null)}
                  className="home-visitations__button home-visitations__button--secondary"
                  disabled={deletingPlanId === showDeletePlanConfirm}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePlan(showDeletePlanConfirm)}
                  className="home-visitations__button home-visitations__button--danger"
                  disabled={deletingPlanId === showDeletePlanConfirm}
                >
                  {deletingPlanId === showDeletePlanConfirm ? 'Deleting...' : 'Delete Record'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPlanModal && (
        <div style={modalOverlayStyle} onClick={resetPlanForm}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={{ margin: 0 }}>
                {editingPlanId !== null
                  ? 'Edit Case Conference Record'
                  : 'Add Case Conference Record'}
              </h2>
              <button type="button" style={modalCloseStyle} onClick={resetPlanForm}>
                ×
              </button>
            </div>

            <form
              onSubmit={handlePlanSubmit}
              className="home-visitations__form"
              style={{ marginBottom: 0, borderRadius: 0, boxShadow: 'none', border: 'none' }}
            >
              <div style={formGridTwoColStyle}>
                <div>
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

                <div>
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

                <div>
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

                <div>
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

                <div>
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

                <div>
                  <label>Target Value</label>
                  <input
                    type="number"
                    value={planForm.target_value ?? ''}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        target_value: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div style={fullWidthStyle}>
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

              <div style={{ marginTop: 18, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  className="home-visitations__button home-visitations__button--primary"
                  disabled={submittingPlan}
                >
                  {submittingPlan
                    ? 'Saving...'
                    : editingPlanId !== null
                    ? 'Update Case Conference Record'
                    : 'Create Case Conference Record'}
                </button>

                <button
                  type="button"
                  onClick={resetPlanForm}
                  className="home-visitations__button home-visitations__button--secondary"
                  disabled={submittingPlan}
                >
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