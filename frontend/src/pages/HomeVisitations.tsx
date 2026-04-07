import { useEffect, useState } from 'react'
import { fetchHomeVisitations, type home_visitation } from '../api/HomeVisitationsAPI'
import { fetchResidents, type resident } from '../api/ResidentsAPI'
import { fetchInterventionPlans, type intervention_plan } from '../api/InterventionPlansAPI'

type ActiveView = 'homeVisits' | 'caseConferences'

export default function HomeVisitations() {
  const [residents, setResidents] = useState<resident[]>([])
  const [selectedResidentId, setSelectedResidentId] = useState<number | null>(null)
  const [visits, setVisits] = useState<home_visitation[]>([])
  const [plans, setPlans] = useState<intervention_plan[]>([])
  const [activeView, setActiveView] = useState<ActiveView>('homeVisits')

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

  useEffect(() => {
    if (!selectedResidentId) return

    fetchHomeVisitations(selectedResidentId)
      .then((data: home_visitation[]) => {
        console.log('VISITS:', data)
        setVisits(data)
      })
      .catch((err: unknown) => console.error(err))
  }, [selectedResidentId])

  useEffect(() => {
    if (!selectedResidentId) return

    fetchInterventionPlans(selectedResidentId)
      .then((data: intervention_plan[]) => {
        console.log('PLANS:', data)
        setPlans(data)
      })
      .catch((err: unknown) => console.error(err))
  }, [selectedResidentId])

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
            color:
              activeView === 'caseConferences' ? '#ffffff' : '#1f3b4d',
            fontWeight: 600,
          }}
        >
          Case Conference History
        </button>
      </div>

      {activeView === 'homeVisits' ? (
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
            </tr>
          </thead>
          <tbody>
            {visits.length === 0 ? (
              <tr>
                <td colSpan={7}>No visits found</td>
              </tr>
            ) : (
              visits.map((v) => (
                <tr key={v.visitation_id}>
                  <td>{v.visit_date}</td>
                  <td>{v.visit_type}</td>
                  <td>{v.observations}</td>
                  <td>{v.family_cooperation_level}</td>
                  <td>{v.safety_concerns_noted ? 'Yes' : 'No'}</td>
                  <td>{v.follow_up_needed ? 'Yes' : 'No'}</td>
                  <td>{v.visit_outcome}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      ) : (
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
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr>
                <td colSpan={7}>No case conference history found</td>
              </tr>
            ) : (
              plans.map((p) => (
                <tr key={p.plan_id}>
                  <td>{p.case_conference_date ?? 'N/A'}</td>
                  <td>{p.plan_category}</td>
                  <td>{p.plan_description}</td>
                  <td>{p.services_provided}</td>
                  <td>{p.status}</td>
                  <td>{p.target_date ?? 'N/A'}</td>
                  <td>{p.updated_at}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}