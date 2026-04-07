import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './CaseloadInventory.css'

interface Resident {
  resident_id: number
  internal_code: string
  case_control_no: string
  case_status: string
  case_category: string
  date_of_birth: string
  current_risk_level: string
  assigned_social_worker: string
  safehouse_id: number
}

export default function CaseloadInventory() {
  const [residents, setResidents] = useState<Resident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [caseStatus, setCaseStatus] = useState('Active')
  const [search, setSearch] = useState('')
  const [caseCategory, setCaseCategory] = useState('')

  useEffect(() => {
    fetchResidents()
  }, [caseStatus, search, caseCategory])

  const fetchResidents = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (caseStatus) params.append('caseStatus', caseStatus)
      if (search) params.append('search', search)
      if (caseCategory) params.append('caseCategory', caseCategory)

      const response = await fetch(`http://localhost:5289/api/residents?${params.toString()}`, {
        headers: { 'Content-Type': 'application/json' }
      })
      if (!response.ok) throw new Error('Failed to fetch residents')
      const data = await response.json()
      setResidents(data)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching residents')
      setResidents([])
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (dob: string) => {
    if (!dob) return 'N/A'
    const birth = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  return (
    <div className="caseload-container">
      <div className="caseload-header">
        <h1>Caseload Inventory</h1>
        <Link to="/admin/caseload/new" className="btn btn-sand">
          + Add Resident
        </Link>
      </div>

      <div className="caseload-filters">
        <input
          type="text"
          placeholder="Search by case ID or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-input"
        />

        <select value={caseStatus} onChange={(e) => setCaseStatus(e.target.value)} className="filter-select">
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Closed">Closed</option>
          <option value="Transferred">Transferred</option>
        </select>

        <select value={caseCategory} onChange={(e) => setCaseCategory(e.target.value)} className="filter-select">
          <option value="">All Categories</option>
          <option value="Abandoned">Abandoned</option>
          <option value="Foundling">Foundling</option>
          <option value="Surrendered">Surrendered</option>
          <option value="Neglected">Neglected</option>
          <option value="Trafficked">Trafficked</option>
          <option value="Child Labor">Child Labor</option>
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading residents...</div>
      ) : residents.length === 0 ? (
        <div className="no-results">No residents found</div>
      ) : (
        <div className="caseload-table-wrapper">
          <table className="caseload-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Status</th>
                <th>Age</th>
                <th>Category</th>
                <th>Risk Level</th>
                <th>Social Worker</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {residents.map((res) => (
                <tr key={res.resident_id}>
                  <td className="case-id">
                    <strong>{res.case_control_no}</strong>
                    <br />
                    <small>{res.internal_code}</small>
                  </td>
                  <td>
                    <span className={`badge badge-${res.case_status?.toLowerCase() || 'default'}`}>
                      {res.case_status}
                    </span>
                  </td>
                  <td>{calculateAge(res.date_of_birth)}</td>
                  <td>{res.case_category || 'N/A'}</td>
                  <td>
                    <span className={`risk-level risk-${res.current_risk_level?.toLowerCase() || 'default'}`}>
                      {res.current_risk_level || 'N/A'}
                    </span>
                  </td>
                  <td>{res.assigned_social_worker || '—'}</td>
                  <td>
                    <Link to={`/admin/caseload/${res.resident_id}`} className="btn-link">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
