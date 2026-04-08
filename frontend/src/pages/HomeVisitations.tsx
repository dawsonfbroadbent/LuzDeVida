import { useEffect, useState } from 'react'
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

type ActiveView = 'homeVisits' | 'caseConferences'

export default function HomeVisitations() {
  const [residents, setResidents] = useState<resident[]>([])
  const [selectedResidentId, setSelectedResidentId] = useState<number | null>(null)
  const [visits, setVisits] = useState<home_visitation[]>([])
  const [plans, setPlans] = useState<intervention_plan[]>([])
  const [activeView, setActiveView] = useState<ActiveView>('homeVisits')

  const [showVisitForm, setShowVisitForm] = useState(false)
  const [showPlanForm, setShowPlanForm] = useState(false)

  const [loading, setLoading] = useState(true)
  const [contentLoading, setContentLoading] = useState(false)
  const [submittingVisit, setSubmittingVisit] = useState(false)
  const [submittingPlan, setSubmittingPlan] = useState(false)
  const [deletingVisitId, setDeletingVisitId] = useState<number | null>(null)
  const [deletingPlanId, setDeletingPlanId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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
  const [editingVisitId, setEditingVisitId] = useState<number | null>(null)

  const [planForm, setPlanForm] = useState<intervention_plan>(emptyPlanForm)
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null)

  const showTemporarySuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const loadVisits = async (residentId: number) => {
    const data = await fetchHomeVisitations(residentId)
    setVisits(data)
  }

  const loadPlans = async (residentId: number) => {
    const data = await fetchInterventionPlans(residentId)
    setPlans(data)
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
    })
    setEditingVisitId(null)
    setShowVisitForm(false)
  }

  const resetPlanForm = () => {
    setPlanForm({
      ...emptyPlanForm,
      resident_id: selectedResidentId ?? 0,
    })
    setEditingPlanId(null)
    setShowPlanForm(false)
  }

  const handleAddVisitClick = () => {
    setError(null)
    setVisitForm({
      ...emptyVisitForm,
      resident_id: selectedResidentId ?? 0,
    })
    setEditingVisitId(null)
    setShowVisitForm(true)
  }

  const handleAddPlanClick = () => {
    setError(null)
    setPlanForm({
      ...emptyPlanForm,
      resident_id: selectedResidentId ?? 0,
    })
    setEditingPlanId(null)
    setShowPlanForm(true)
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
      const selectedResident = residents.find(
        (r) => r.resident_id === selectedResidentId
      )

      const payload = {
        ...visitForm,
        resident_id: selectedResidentId,
        resident: selectedResident,
        follow_up_notes: visitForm.follow_up_needed
          ? visitForm.follow_up_notes
          : '',
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

  const handleEditVisit = (visit: home_visitation) => {
    setError(null)
    setVisitForm(visit)
    setEditingVisitId(visit.visitation_id)
    setShowVisitForm(true)
    setActiveView('homeVisits')
  }

  const handleEditPlan = (plan: intervention_plan) => {
    setError(null)
    setPlanForm(plan)
    setEditingPlanId(plan.plan_id)
    setShowPlanForm(true)
    setActiveView('caseConferences')
  }

  const handleDeleteVisit = async (visitationId: number) => {
    if (selectedResidentId == null) return
    if (!window.confirm('Delete this home visitation?')) return

    setDeletingVisitId(visitationId)
    setError(null)

    try {
      await deleteHomeVisitation(visitationId)
      await loadVisits(selectedResidentId)
      if (editingVisitId === visitationId) resetVisitForm()
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
    if (!window.confirm('Delete this case conference record?')) return

    setDeletingPlanId(planId)
    setError(null)

    try {
      await deleteInterventionPlan(planId)
      await loadPlans(selectedResidentId)
      if (editingPlanId === planId) resetPlanForm()
      showTemporarySuccess('Case conference record deleted successfully!')
    } catch (err) {
      console.error(err)
      setError('Failed to delete case conference record. Please try again.')
    } finally {
      setDeletingPlanId(null)
    }
  }

  const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  return dateString.split('T')[0]
  }

const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
  .toISOString()
  .split('T')[0]

const upcomingPlans = [...plans]
  .filter((p) => {
    if (!p.case_conference_date) return false
    return p.case_conference_date.split('T')[0] >= today
  })
  .sort((a, b) =>
    (a.case_conference_date ?? '').localeCompare(b.case_conference_date ?? '')
  )

const pastPlans = [...plans]
  .filter((p) => {
    if (!p.case_conference_date) return true
    return p.case_conference_date.split('T')[0] < today
  })
  .sort((a, b) =>
    (b.case_conference_date ?? '').localeCompare(a.case_conference_date ?? '')
  )

  const blueButtonStyle = {
    backgroundColor: '#63c7d8',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold' as const,
  }

  const editButtonStyle = {
    backgroundColor: 'white',
    color: '#1f3b4d',
    border: '1px solid #cfd8df',
    padding: '8px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold' as const,
  }

  const deleteButtonStyle = {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold' as const,
  }

  const alertStyle = {
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', marginTop: '60px' }}>
        <h1 style={{ marginTop: '0', marginBottom: '20px' }}>
          Home Visitations & Case Conferences
        </h1>
        <div
          style={{
            padding: '20px',
            borderRadius: '12px',
            backgroundColor: '#f9fbfc',
            border: '1px solid #d0d7de',
          }}
        >
          Loading home visitations and case conferences...
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px', marginTop: '60px' }}>
      <h1 style={{ marginTop: '0', marginBottom: '20px' }}>
        Home Visitations & Case Conferences
      </h1>

      {error && (
        <div
          style={{
            ...alertStyle,
            backgroundColor: '#fdecea',
            color: '#b42318',
            border: '1px solid #f5c2c7',
          }}
        >
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#b42318',
            }}
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div
          style={{
            ...alertStyle,
            backgroundColor: '#ecfdf3',
            color: '#067647',
            border: '1px solid #abefc6',
          }}
        >
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#067647',
            }}
          >
            ×
          </button>
        </div>
      )}

      {residents.length === 0 ? (
        <div
          style={{
            padding: '20px',
            borderRadius: '12px',
            backgroundColor: '#f9fbfc',
            border: '1px solid #d0d7de',
          }}
        >
          <p style={{ marginTop: 0 }}>No residents found.</p>
          <p style={{ marginBottom: '12px' }}>
            Add residents first before managing home visitations or case conferences.
          </p>
          <button type="button" onClick={loadResidents} style={blueButtonStyle}>
            Retry
          </button>
        </div>
      ) : (
        <>
          <div style={{ marginTop: '20px', marginBottom: '20px' }}>
            <label>Select Resident: </label>
            <select
              value={selectedResidentId ?? ''}
              onChange={(e) =>
                setSelectedResidentId(
                  e.target.value ? Number(e.target.value) : null
                )
              }
            >
              {residents.map((r) => (
                <option key={r.resident_id} value={r.resident_id}>
                  {r.case_control_no} ({r.internal_code})
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#e9eef1',
              borderRadius: '12px',
              padding: '6px',
              marginBottom: '24px',
              gap: '6px',
            }}
          >
            <button
              onClick={() => setActiveView('homeVisits')}
              style={{
                padding: '10px 18px',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                backgroundColor:
                  activeView === 'homeVisits' ? '#63c7d8' : 'transparent',
                color: activeView === 'homeVisits' ? '#ffffff' : '#1f3b4d',
                fontWeight: 600,
              }}
            >
              Home Visits
            </button>

            <button
              onClick={() => setActiveView('caseConferences')}
              style={{
                padding: '10px 18px',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                backgroundColor:
                  activeView === 'caseConferences' ? '#63c7d8' : 'transparent',
                color: activeView === 'caseConferences' ? '#ffffff' : '#1f3b4d',
                fontWeight: 600,
              }}
            >
              Case Conference History
            </button>
          </div>

          {contentLoading && (
            <div
              style={{
                padding: '16px',
                marginBottom: '20px',
                borderRadius: '12px',
                backgroundColor: '#f9fbfc',
                border: '1px solid #d0d7de',
              }}
            >
              Loading resident records...
            </div>
          )}

          {activeView === 'homeVisits' ? (
            <>
              <div style={{ marginBottom: '20px' }}>
                {!showVisitForm && (
                  <button
                    type="button"
                    onClick={handleAddVisitClick}
                    style={blueButtonStyle}
                    disabled={contentLoading}
                  >
                    Add Home Visit
                  </button>
                )}
              </div>

              {showVisitForm && (
                <form
                  onSubmit={handleVisitSubmit}
                  style={{
                    border: '1px solid #d0d7de',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px',
                    backgroundColor: '#f9fbfc',
                  }}
                >
                  <h2 style={{ marginTop: 0 }}>
                    {editingVisitId !== null ? 'Edit Home Visit' : 'Add Home Visit'}
                  </h2>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <label>Date</label>
                      <input
                        type="date"
                        value={visitForm.visit_date}
                        onChange={(e) =>
                          setVisitForm({ ...visitForm, visit_date: e.target.value })
                        }
                        style={{ width: '100%' }}
                        required
                      />
                    </div>

                    <div>
                      <label>Social Worker</label>
                      <input
                        type="text"
                        value={visitForm.social_worker}
                        onChange={(e) =>
                          setVisitForm({
                            ...visitForm,
                            social_worker: e.target.value,
                          })
                        }
                        style={{ width: '100%' }}
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
                        style={{ width: '100%' }}
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
                      <label>Family Cooperation</label>
                      <select
                        value={visitForm.family_cooperation_level}
                        onChange={(e) =>
                          setVisitForm({
                            ...visitForm,
                            family_cooperation_level: e.target.value,
                          })
                        }
                        style={{ width: '100%' }}
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
                          setVisitForm({
                            ...visitForm,
                            location_visited: e.target.value,
                          })
                        }
                        style={{ width: '100%' }}
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
                        style={{ width: '100%' }}
                        required
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label>Purpose</label>
                      <input
                        type="text"
                        value={visitForm.purpose}
                        onChange={(e) =>
                          setVisitForm({ ...visitForm, purpose: e.target.value })
                        }
                        style={{ width: '100%' }}
                        required
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label>Observations</label>
                      <textarea
                        value={visitForm.observations}
                        onChange={(e) =>
                          setVisitForm({
                            ...visitForm,
                            observations: e.target.value,
                          })
                        }
                        style={{ width: '100%', minHeight: '90px' }}
                        required
                      />
                    </div>

                    <div>
                      <label>Visit Outcome</label>
                      <select
                        value={visitForm.visit_outcome}
                        onChange={(e) =>
                          setVisitForm({
                            ...visitForm,
                            visit_outcome: e.target.value,
                          })
                        }
                        style={{ width: '100%' }}
                        required
                      >
                        <option value="">Select outcome</option>
                        <option value="Favorable">Favorable</option>
                        <option value="Needs Improvement">Needs Improvement</option>
                        <option value="Unfavorable">Unfavorable</option>
                        <option value="Inconclusive">Inconclusive</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'end', gap: '20px' }}>
                      <label>
                        <input
                          type="checkbox"
                          checked={visitForm.safety_concerns_noted}
                          onChange={(e) =>
                            setVisitForm({
                              ...visitForm,
                              safety_concerns_noted: e.target.checked,
                            })
                          }
                        />{' '}
                        Safety Concerns Noted
                      </label>

                      <label>
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
                        />{' '}
                        Follow-Up Needed
                      </label>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label>Follow-Up Notes</label>
                      <textarea
                        value={visitForm.follow_up_notes}
                        onChange={(e) =>
                          setVisitForm({
                            ...visitForm,
                            follow_up_notes: e.target.value,
                          })
                        }
                        style={{ width: '100%', minHeight: '70px' }}
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

                  <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                    <button
                      type="submit"
                      style={blueButtonStyle}
                      disabled={submittingVisit}
                    >
                      {submittingVisit
                        ? 'Saving...'
                        : editingVisitId !== null
                        ? 'Update Home Visit'
                        : 'Add Home Visit'}
                    </button>
                    <button
                      type="button"
                      onClick={resetVisitForm}
                      style={blueButtonStyle}
                      disabled={submittingVisit}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <table
                border={1}
                cellPadding={10}
                style={{ width: '100%', textAlign: 'center' }}
              >
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Observations</th>
                    <th>Family Cooperation</th>
                    <th>Safety Concerns</th>
                    <th>Follow-Up Needed</th>
                    <th>Outcome</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contentLoading ? (
                    <tr>
                      <td colSpan={8}>Loading home visits...</td>
                    </tr>
                  ) : visits.length === 0 ? (
                    <tr>
                      <td colSpan={8}>No visits found</td>
                    </tr>
                  ) : (
                    visits.map((v) => (
                      <tr key={v.visitation_id}>
                        <td>{formatDate(v.visit_date)}</td>
                        <td>{v.visit_type}</td>
                        <td>{v.observations}</td>
                        <td>{v.family_cooperation_level}</td>
                        <td>{v.safety_concerns_noted ? 'Yes' : 'No'}</td>
                        <td>{v.follow_up_needed ? 'Yes' : 'No'}</td>
                        <td>{v.visit_outcome}</td>
                        <td>
                          <div
                            style={{
                              display: 'flex',
                              gap: '8px',
                              justifyContent: 'center',
                            }}
                          >
                            <button
                              onClick={() => handleEditVisit(v)}
                              style={editButtonStyle}
                              disabled={deletingVisitId === v.visitation_id}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteVisit(v.visitation_id)}
                              style={deleteButtonStyle}
                              disabled={deletingVisitId === v.visitation_id}
                            >
                              {deletingVisitId === v.visitation_id
                                ? 'Deleting...'
                                : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '20px' }}>
                {!showPlanForm && (
                  <button
                    type="button"
                    onClick={handleAddPlanClick}
                    style={blueButtonStyle}
                    disabled={contentLoading}
                  >
                    Add Case Conference Record
                  </button>
                )}
              </div>

              {showPlanForm && (
                <form
                  onSubmit={handlePlanSubmit}
                  style={{
                    border: '1px solid #d0d7de',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px',
                    backgroundColor: '#f9fbfc',
                  }}
                >
                  <h2 style={{ marginTop: 0 }}>
                    {editingPlanId !== null
                      ? 'Edit Case Conference Record'
                      : 'Add Case Conference Record'}
                  </h2>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))',
                      gap: '12px',
                    }}
                  >
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
                        style={{ width: '100%' }}
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
                        style={{ width: '100%' }}
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
                        style={{ width: '100%' }}
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
                        style={{ width: '100%' }}
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
                        style={{ width: '100%' }}
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
                            target_value:
                              e.target.value === '' ? null : Number(e.target.value),
                          })
                        }
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label>Plan Description</label>
                      <textarea
                        value={planForm.plan_description}
                        onChange={(e) =>
                          setPlanForm({
                            ...planForm,
                            plan_description: e.target.value,
                          })
                        }
                        style={{ width: '100%', minHeight: '90px' }}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                    <button
                      type="submit"
                      style={blueButtonStyle}
                      disabled={submittingPlan}
                    >
                      {submittingPlan
                        ? 'Saving...'
                        : editingPlanId !== null
                        ? 'Update Case Conference Record'
                        : 'Add Case Conference Record'}
                    </button>
                    <button
                      type="button"
                      onClick={resetPlanForm}
                      style={blueButtonStyle}
                      disabled={submittingPlan}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <h2 style={{ marginTop: 0 }}>Upcoming Case Conferences</h2>
              <table
                border={1}
                cellPadding={10}
                style={{
                  width: '100%',
                  textAlign: 'center',
                  marginBottom: '28px',
                }}
              >
                <thead>
                  <tr>
                    <th>Conference Date</th>
                    <th>Category</th>
                    <th>Plan Description</th>
                    <th>Services Provided</th>
                    <th>Status</th>
                    <th>Target Date</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contentLoading ? (
                    <tr>
                      <td colSpan={8}>Loading upcoming case conferences...</td>
                    </tr>
                  ) : upcomingPlans.length === 0 ? (
                    <tr>
                      <td colSpan={8}>No upcoming case conferences found</td>
                    </tr>
                  ) : (
                    upcomingPlans.map((p) => (
                      <tr key={p.plan_id}>
                        <td>{formatDate(p.case_conference_date)}</td>
                        <td>{p.plan_category}</td>
                        <td>{p.plan_description}</td>
                        <td>{p.services_provided}</td>
                        <td>{p.status}</td>
                        <td>{formatDate(p.target_date)}</td>
                        <td>{formatDate(p.updated_at)}</td>
                        <td>
                          <div
                            style={{
                              display: 'flex',
                              gap: '8px',
                              justifyContent: 'center',
                            }}
                          >
                            <button
                              onClick={() => handleEditPlan(p)}
                              style={editButtonStyle}
                              disabled={deletingPlanId === p.plan_id}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePlan(p.plan_id)}
                              style={deleteButtonStyle}
                              disabled={deletingPlanId === p.plan_id}
                            >
                              {deletingPlanId === p.plan_id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <h2>Past Case Conferences</h2>
              <table
                border={1}
                cellPadding={10}
                style={{ width: '100%', textAlign: 'center' }}
              >
                <thead>
                  <tr>
                    <th>Conference Date</th>
                    <th>Category</th>
                    <th>Plan Description</th>
                    <th>Services Provided</th>
                    <th>Status</th>
                    <th>Target Date</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contentLoading ? (
                    <tr>
                      <td colSpan={8}>Loading past case conferences...</td>
                    </tr>
                  ) : pastPlans.length === 0 ? (
                    <tr>
                      <td colSpan={8}>No past case conferences found</td>
                    </tr>
                  ) : (
                    pastPlans.map((p) => (
                      <tr key={p.plan_id}>
                        <td>{formatDate(p.case_conference_date)}</td>
                        <td>{p.plan_category}</td>
                        <td>{p.plan_description}</td>
                        <td>{p.services_provided}</td>
                        <td>{p.status}</td>
                        <td>{formatDate(p.target_date)}</td>
                        <td>{formatDate(p.updated_at)}</td>
                        <td>
                          <div
                            style={{
                              display: 'flex',
                              gap: '8px',
                              justifyContent: 'center',
                            }}
                          >
                            <button
                              onClick={() => handleEditPlan(p)}
                              style={editButtonStyle}
                              disabled={deletingPlanId === p.plan_id}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePlan(p.plan_id)}
                              style={deleteButtonStyle}
                              disabled={deletingPlanId === p.plan_id}
                            >
                              {deletingPlanId === p.plan_id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </>
          )}
        </>
      )}
    </div>
  )
}