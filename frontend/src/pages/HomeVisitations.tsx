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

  useEffect(() => {
    fetchResidents()
      .then((data: resident[]) => {
        setResidents(data)
        if (data.length > 0) {
          setSelectedResidentId(data[0].resident_id)
        }
      })
      .catch((err: unknown) => console.error(err))
  }, [])

  const loadVisits = async (residentId: number) => {
    try {
      const data = await fetchHomeVisitations(residentId)
      setVisits(data)
    } catch (err) {
      console.error(err)
    }
  }

  const loadPlans = async (residentId: number) => {
    try {
      const data = await fetchInterventionPlans(residentId)
      setPlans(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (selectedResidentId == null) return

    loadVisits(selectedResidentId)
    loadPlans(selectedResidentId)

    setVisitForm((prev) => ({ ...prev, resident_id: selectedResidentId }))
    setPlanForm((prev) => ({ ...prev, resident_id: selectedResidentId }))
  }, [selectedResidentId])

  const resetVisitForm = () => {
    setVisitForm({
      ...emptyVisitForm,
      resident_id: selectedResidentId ?? 0,
    })
    setEditingVisitId(null)
  }

  const resetPlanForm = () => {
    setPlanForm({
      ...emptyPlanForm,
      resident_id: selectedResidentId ?? 0,
    })
    setEditingPlanId(null)
  }

  const handleVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedResidentId == null) return

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
      alert('Please fill in all required fields before saving.')
      return
    }

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
      } else {
        await addHomeVisitation(payload)
      }

      await loadVisits(selectedResidentId)
      resetVisitForm()
    } catch (err) {
      console.error(err)
      alert('Failed to save home visitation.')
    }
  }

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedResidentId == null) return

    try {
      const now = new Date().toISOString()

      if (editingPlanId !== null) {
        await updateInterventionPlan(editingPlanId, {
          ...planForm,
          resident_id: selectedResidentId,
          updated_at: now,
        })
      } else {
        const selectedResident = residents.find(
          (r) => r.resident_id === selectedResidentId
        )

        await createInterventionPlan({
          resident_id: selectedResidentId,
          resident: selectedResident,
          plan_category: planForm.plan_category,
          plan_description: planForm.plan_description,
          services_provided: planForm.services_provided,
          target_value: planForm.target_value,
          target_date: planForm.target_date,
          status: planForm.status,
          case_conference_date: planForm.case_conference_date,
          created_at: now,
          updated_at: now,
        })
      }

      await loadPlans(selectedResidentId)
      resetPlanForm()
    } catch (err) {
      console.error(err)
      alert('Failed to save case conference history.')
    }
  }

  const handleEditVisit = (visit: home_visitation) => {
    setVisitForm(visit)
    setEditingVisitId(visit.visitation_id)
    setActiveView('homeVisits')
  }

  const handleEditPlan = (plan: intervention_plan) => {
    setPlanForm(plan)
    setEditingPlanId(plan.plan_id)
    setActiveView('caseConferences')
  }

  const handleDeleteVisit = async (visitationId: number) => {
    if (selectedResidentId == null) return
    if (!window.confirm('Delete this home visitation?')) return

    try {
      await deleteHomeVisitation(visitationId)
      await loadVisits(selectedResidentId)
      if (editingVisitId === visitationId) resetVisitForm()
    } catch (err) {
      console.error(err)
      alert('Failed to delete home visitation.')
    }
  }

  const handleDeletePlan = async (planId: number) => {
    if (selectedResidentId == null) return
    if (!window.confirm('Delete this case conference record?')) return

    try {
      await deleteInterventionPlan(planId)
      await loadPlans(selectedResidentId)
      if (editingPlanId === planId) resetPlanForm()
    } catch (err) {
      console.error(err)
      alert('Failed to delete case conference record.')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div style={{ padding: '40px', marginTop: '60px' }}>
      <h1 style={{ marginTop: '0', marginBottom: '20px' }}>
        Home Visitations & Case Conferences
      </h1>

      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <label>Select Resident: </label>
        <select
          value={selectedResidentId ?? ''}
          onChange={(e) => setSelectedResidentId(Number(e.target.value))}
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

      {activeView === 'homeVisits' ? (
        <>
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
                    setVisitForm({ ...visitForm, social_worker: e.target.value })
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
              <button type="submit">
                {editingVisitId !== null ? 'Update Home Visit' : 'Add Home Visit'}
              </button>
              <button type="button" onClick={resetVisitForm}>
                Cancel
              </button>
            </div>
          </form>

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
              {visits.length === 0 ? (
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
                        <button onClick={() => handleEditVisit(v)}>Edit</button>
                        <button onClick={() => handleDeleteVisit(v.visitation_id)}>
                          Delete
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
              <button type="submit">
                {editingPlanId !== null
                  ? 'Update Case Conference Record'
                  : 'Add Case Conference Record'}
              </button>
              <button type="button" onClick={resetPlanForm}>
                Cancel
              </button>
            </div>
          </form>

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
              {plans.length === 0 ? (
                <tr>
                  <td colSpan={8}>No case conference history found</td>
                </tr>
              ) : (
                plans.map((p) => (
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
                        <button onClick={() => handleEditPlan(p)}>Edit</button>
                        <button onClick={() => handleDeletePlan(p.plan_id)}>
                          Delete
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
    </div>
  )
}