import { useEffect, useState } from 'react'
import { fetchHomeVisitations, type home_visitation } from '../api/HomeVisitationsAPI'
import { fetchResidents, type resident } from '../api/ResidentsAPI'

export default function HomeVisitations() {
  const [residents, setResidents] = useState<resident[]>([])
  const [selectedResidentId, setSelectedResidentId] = useState<number | null>(null)
  const [visits, setVisits] = useState<home_visitation[]>([])

  // 🔹 Load residents
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

  // 🔹 Load visits when resident changes
  useEffect(() => {
    if (!selectedResidentId) return

    fetchHomeVisitations(selectedResidentId)
    .then((data: home_visitation[]) => {
        console.log('VISITS:', data)
        setVisits(data)
    })
    .catch((err: unknown) => console.error(err))
  }, [selectedResidentId])

  return (
    <div style={{ padding: '40px' }}>
      <h1>Home Visitations</h1>

      {/* 🔹 Resident Dropdown */}
      <div style={{ marginBottom: '20px' }}>
        <label>Select Resident: </label>
        <select
          value={selectedResidentId ?? ''}
          onChange={(e) => setSelectedResidentId(Number(e.target.value))}
        >
          {residents.map(r => (
            <option key={r.resident_id} value={r.resident_id}>
              {r.case_control_no} ({r.internal_code})
            </option>
          ))}
        </select>
      </div>

      {/* 🔹 Visits Table */}
      <table border={1} cellPadding={10} style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Social Worker</th>
            <th>Outcome</th>
          </tr>
        </thead>
        <tbody>
          {visits.length === 0 ? (
            <tr>
              <td colSpan={4}>No visits found</td>
            </tr>
          ) : (
            visits.map(v => (
              <tr key={v.visitation_id}>
                <td>{v.visit_date}</td>
                <td>{v.visit_type}</td>
                <td>{v.social_worker}</td>
                <td>{v.visit_outcome}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}