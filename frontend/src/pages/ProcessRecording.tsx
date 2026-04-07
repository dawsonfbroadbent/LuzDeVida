import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import './ProcessRecording.css'

interface ProcessRecording {
  recording_id: number
  resident_id: number
  session_date: string
  social_worker: string
  session_type: string
  emotional_state_observed: string
  emotional_state_end: string
  session_narrative: string
  interventions_applied: string
  follow_up_actions: string
  progress_noted: boolean
  concerns_flagged: boolean
  referral_made: boolean
  session_duration_minutes: number
}

interface Resident {
  resident_id: number
  first_name: string
  last_name: string
}

const API_BASE_URL = 'http://localhost:5289'

export default function ProcessRecording() {
  const { residentId } = useParams<{ residentId: string }>()
  const [recordings, setRecordings] = useState<ProcessRecording[]>([])
  const [residents, setResidents] = useState<Resident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filterResidentId, setFilterResidentId] = useState<number | null>(
    residentId ? parseInt(residentId) : null
  )

  // Form state
  const [formData, setFormData] = useState<Partial<ProcessRecording>>({
    resident_id: residentId ? parseInt(residentId) : undefined,
    session_date: new Date().toISOString().split('T')[0],
    session_type: 'Individual',
    emotional_state_observed: 'Calm',
    emotional_state_end: 'Calm'
  })

  useEffect(() => {
    fetchRecordings()
    if (!residentId) {
      fetchResidents()
    }
  }, [residentId, filterResidentId])

  const fetchResidents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/residents`, {
        headers: { 'Content-Type': 'application/json' }
      })
      if (!response.ok) throw new Error('Failed to fetch residents')
      const data = await response.json()
      setResidents(data)
    } catch (err) {
      console.error('Error fetching residents:', err)
    }
  }

  const fetchRecordings = async () => {
    setLoading(true)
    try {
      let url = `${API_BASE_URL}/api/processrecordings`
      if (residentId) {
        url = `${API_BASE_URL}/api/processrecordings/resident/${residentId}`
      } else if (filterResidentId) {
        url = `${API_BASE_URL}/api/processrecordings/resident/${filterResidentId}`
      }
      
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' }
      })
      if (!response.ok) throw new Error('Failed to fetch recordings')
      const data = await response.json()
      setRecordings(data)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching recordings')
      setRecordings([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.resident_id) {
      setError('Please select a resident')
      return
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/processrecordings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!response.ok) throw new Error('Failed to create recording')
      await fetchRecordings()
      setShowForm(false)
      setFormData({
        resident_id: residentId ? parseInt(residentId) : undefined,
        session_date: new Date().toISOString().split('T')[0],
        session_type: 'Individual',
        emotional_state_observed: 'Calm',
        emotional_state_end: 'Calm'
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating recording')
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const selectedRecording = recordings.find(r => r.recording_id === selectedId)

  return (
    <div className="process-recording-container">
      <div className="pr-header">
        <div>
          <h1>Process Recordings (Counseling Sessions)</h1>
          {!residentId && residents.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <select
                value={filterResidentId || ''}
                onChange={(e) => setFilterResidentId(e.target.value ? parseInt(e.target.value) : null)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--cream-darker)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px'
                }}
              >
                <option value="">View all recordings</option>
                {residents.map((r) => (
                  <option key={r.resident_id} value={r.resident_id}>
                    {r.first_name} {r.last_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-sand">
          + New Session
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreateSubmit} className="pr-form">
          <h3>Document Counseling Session</h3>

          {!residentId && (
            <div className="form-row">
              <div className="form-group full-width">
                <label>Resident *</label>
                <select
                  value={formData.resident_id || ''}
                  onChange={(e) => setFormData({ ...formData, resident_id: parseInt(e.target.value) })}
                  required
                >
                  <option value="">Select a resident</option>
                  {residents.map((r) => (
                    <option key={r.resident_id} value={r.resident_id}>
                      {r.first_name} {r.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Session Date</label>
              <input
                type="date"
                value={formData.session_date || ''}
                onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Social Worker</label>
              <input
                type="text"
                placeholder="Name of social worker"
                value={formData.social_worker || ''}
                onChange={(e) => setFormData({ ...formData, social_worker: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Session Type</label>
              <select
                value={formData.session_type || 'Individual'}
                onChange={(e) => setFormData({ ...formData, session_type: e.target.value })}
              >
                <option>Individual</option>
                <option>Group</option>
              </select>
            </div>
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                value={formData.session_duration_minutes || ''}
                onChange={(e) =>
                  setFormData({ ...formData, session_duration_minutes: parseInt(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Emotional State (Start)</label>
              <select
                value={formData.emotional_state_observed || 'Calm'}
                onChange={(e) =>
                  setFormData({ ...formData, emotional_state_observed: e.target.value })
                }
              >
                <option>Calm</option>
                <option>Anxious</option>
                <option>Sad</option>
                <option>Angry</option>
                <option>Hopeful</option>
                <option>Withdrawn</option>
                <option>Happy</option>
                <option>Distressed</option>
              </select>
            </div>
            <div className="form-group">
              <label>Emotional State (End)</label>
              <select
                value={formData.emotional_state_end || 'Calm'}
                onChange={(e) => setFormData({ ...formData, emotional_state_end: e.target.value })}
              >
                <option>Calm</option>
                <option>Anxious</option>
                <option>Sad</option>
                <option>Angry</option>
                <option>Hopeful</option>
                <option>Withdrawn</option>
                <option>Happy</option>
                <option>Distressed</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Session Summary (Narrative)</label>
            <textarea
              placeholder="What was discussed? What was observed?"
              value={formData.session_narrative || ''}
              onChange={(e) => setFormData({ ...formData, session_narrative: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="form-group full-width">
            <label>Interventions Applied</label>
            <textarea
              placeholder="What techniques or interventions were used?"
              value={formData.interventions_applied || ''}
              onChange={(e) => setFormData({ ...formData, interventions_applied: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-group full-width">
            <label>Follow-Up Actions</label>
            <textarea
              placeholder="What actions are planned for next session?"
              value={formData.follow_up_actions || ''}
              onChange={(e) => setFormData({ ...formData, follow_up_actions: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-checkboxes">
            <label>
              <input
                type="checkbox"
                checked={formData.progress_noted || false}
                onChange={(e) => setFormData({ ...formData, progress_noted: e.target.checked })}
              />
              Progress Noted
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.concerns_flagged || false}
                onChange={(e) => setFormData({ ...formData, concerns_flagged: e.target.checked })}
              />
              Concerns Flagged
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.referral_made || false}
                onChange={(e) => setFormData({ ...formData, referral_made: e.target.checked })}
              />
              Referral Made
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-sand">
              Save Recording
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List & Detail */}
      <div className="pr-content">
        {/* List */}
        <div className="pr-list">
          <h3>Session History</h3>
          {loading ? (
            <div className="loading">Loading sessions...</div>
          ) : recordings.length === 0 ? (
            <div className="no-results">No counseling sessions recorded yet</div>
          ) : (
            <div className="sessions-list">
              {recordings.map((rec) => (
                <div
                  key={rec.recording_id}
                  className={`session-card ${selectedId === rec.recording_id ? 'active' : ''}`}
                  onClick={() => setSelectedId(rec.recording_id)}
                >
                  <div className="session-date">{formatDate(rec.session_date)}</div>
                  <div className="session-type">{rec.session_type}</div>
                  <div className="session-emotion">{rec.emotional_state_observed}</div>
                  {rec.progress_noted && <span className="badge-success">Progress</span>}
                  {rec.concerns_flagged && <span className="badge-warning">Concerns</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        {selectedRecording && (
          <div className="pr-detail">
            <h3>Session Details</h3>
            <div className="detail-group">
              <div className="detail-row">
                <span className="label">Date:</span>
                <span>{formatDate(selectedRecording.session_date)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Social Worker:</span>
                <span>{selectedRecording.social_worker}</span>
              </div>
              <div className="detail-row">
                <span className="label">Type:</span>
                <span>{selectedRecording.session_type}</span>
              </div>
              {selectedRecording.session_duration_minutes && (
                <div className="detail-row">
                  <span className="label">Duration:</span>
                  <span>{selectedRecording.session_duration_minutes} minutes</span>
                </div>
              )}
            </div>

            <div className="detail-group">
              <h4>Emotional State</h4>
              <div className="detail-row">
                <span className="label">Start:</span>
                <span className="emotion-badge">{selectedRecording.emotional_state_observed}</span>
              </div>
              <div className="detail-row">
                <span className="label">End:</span>
                <span className="emotion-badge">{selectedRecording.emotional_state_end}</span>
              </div>
            </div>

            {selectedRecording.session_narrative && (
              <div className="detail-group">
                <h4>Session Summary</h4>
                <p>{selectedRecording.session_narrative}</p>
              </div>
            )}

            {selectedRecording.interventions_applied && (
              <div className="detail-group">
                <h4>Interventions Applied</h4>
                <p>{selectedRecording.interventions_applied}</p>
              </div>
            )}

            {selectedRecording.follow_up_actions && (
              <div className="detail-group">
                <h4>Follow-Up Actions</h4>
                <p>{selectedRecording.follow_up_actions}</p>
              </div>
            )}

            <div className="detail-flags">
              {selectedRecording.progress_noted && <span className="flag flag-progress">✓ Progress Noted</span>}
              {selectedRecording.concerns_flagged && <span className="flag flag-concerns">⚠ Concerns Flagged</span>}
              {selectedRecording.referral_made && <span className="flag flag-referral">→ Referral Made</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
