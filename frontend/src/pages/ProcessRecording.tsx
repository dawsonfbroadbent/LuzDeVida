import { useState } from 'react';
import '../styles/ProcessRecording.css';

interface SessionRecord {
  id: number;
  residentId: number;
  sessionDate: string;
  socialWorker: string;
  sessionType: string;
  emotionalStateObserved: string;
  emotionalStateEnd: string;
  sessionNarrative: string;
  interventionsApplied: string;
  followUpActions: string;
  progressNoted: boolean;
  concernsFlagged: boolean;
  referralMade: boolean;
}

export default function ProcessRecording() {
  const [records, setRecords] = useState<SessionRecord[]>([
    {
      id: 1,
      residentId: 1,
      sessionDate: '2024-04-01',
      socialWorker: 'Maria Santos',
      sessionType: 'Individual',
      emotionalStateObserved: 'Anxious',
      emotionalStateEnd: 'Calm',
      sessionNarrative: 'Client discussed family contact concerns. Explored coping strategies.',
      interventionsApplied: 'Cognitive reframing, relaxation techniques',
      followUpActions: 'Weekly check-in, family meeting next Tuesday',
      progressNoted: true,
      concernsFlagged: false,
      referralMade: false
    },
    {
      id: 2,
      residentId: 1,
      sessionDate: '2024-03-25',
      socialWorker: 'Juan Reyes',
      sessionType: 'Group',
      emotionalStateObserved: 'Withdrawn',
      emotionalStateEnd: 'Hopeful',
      sessionNarrative: 'Group activity on life skills. Good peer interaction.',
      interventionsApplied: 'Group discussion, skill-building exercises',
      followUpActions: 'Continue group sessions, one-on-one follow-up',
      progressNoted: true,
      concernsFlagged: false,
      referralMade: false
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    residentId: '',
    sessionDate: '',
    socialWorker: '',
    sessionType: 'Individual',
    emotionalStateObserved: 'Calm',
    emotionalStateEnd: 'Calm',
    sessionNarrative: '',
    interventionsApplied: '',
    followUpActions: '',
    progressNoted: false,
    concernsFlagged: false,
    referralMade: false
  });

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const newRecord: SessionRecord = {
      id: records.length + 1,
      residentId: parseInt(formData.residentId),
      sessionDate: formData.sessionDate,
      socialWorker: formData.socialWorker,
      sessionType: formData.sessionType,
      emotionalStateObserved: formData.emotionalStateObserved,
      emotionalStateEnd: formData.emotionalStateEnd,
      sessionNarrative: formData.sessionNarrative,
      interventionsApplied: formData.interventionsApplied,
      followUpActions: formData.followUpActions,
      progressNoted: formData.progressNoted,
      concernsFlagged: formData.concernsFlagged,
      referralMade: formData.referralMade
    };
    setRecords([newRecord, ...records]);
    setShowForm(false);
    setFormData({
      residentId: '',
      sessionDate: '',
      socialWorker: '',
      sessionType: 'Individual',
      emotionalStateObserved: 'Calm',
      emotionalStateEnd: 'Calm',
      sessionNarrative: '',
      interventionsApplied: '',
      followUpActions: '',
      progressNoted: false,
      concernsFlagged: false,
      referralMade: false
    });
  };

  const getEmotionalStateClass = (state: string) => {
    switch (state) {
      case 'Distressed': return 'state-distressed';
      case 'Angry': return 'state-angry';
      case 'Sad': return 'state-sad';
      case 'Anxious': return 'state-anxious';
      case 'Withdrawn': return 'state-withdrawn';
      case 'Calm': return 'state-calm';
      case 'Hopeful': return 'state-hopeful';
      case 'Happy': return 'state-happy';
      default: return '';
    }
  };

  return (
    <div className="process-recording-container">
      <div className="recording-header">
        <h1>Process Recording (Counseling Sessions)</h1>
        <p>Document and track all therapeutic sessions</p>
      </div>

      <div className="recording-controls">
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Log New Session'}
        </button>
      </div>

      {showForm && (
        <div className="session-form">
          <h3>Log New Counseling Session</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Resident ID</label>
                <input
                  type="number"
                  name="residentId"
                  value={formData.residentId}
                  onChange={handleInputChange}
                  placeholder="e.g., 1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Session Date</label>
                <input
                  type="date"
                  name="sessionDate"
                  value={formData.sessionDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Social Worker Name</label>
                <input
                  type="text"
                  name="socialWorker"
                  value={formData.socialWorker}
                  onChange={handleInputChange}
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Session Type</label>
                <select
                  name="sessionType"
                  value={formData.sessionType}
                  onChange={handleInputChange}
                >
                  <option value="Individual">Individual</option>
                  <option value="Group">Group</option>
                  <option value="Family">Family</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Emotional State (Observed)</label>
                <select
                  name="emotionalStateObserved"
                  value={formData.emotionalStateObserved}
                  onChange={handleInputChange}
                >
                  <option value="Calm">Calm</option>
                  <option value="Anxious">Anxious</option>
                  <option value="Sad">Sad</option>
                  <option value="Angry">Angry</option>
                  <option value="Hopeful">Hopeful</option>
                  <option value="Withdrawn">Withdrawn</option>
                  <option value="Happy">Happy</option>
                  <option value="Distressed">Distressed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Emotional State (End)</label>
                <select
                  name="emotionalStateEnd"
                  value={formData.emotionalStateEnd}
                  onChange={handleInputChange}
                >
                  <option value="Calm">Calm</option>
                  <option value="Anxious">Anxious</option>
                  <option value="Sad">Sad</option>
                  <option value="Angry">Angry</option>
                  <option value="Hopeful">Hopeful</option>
                  <option value="Withdrawn">Withdrawn</option>
                  <option value="Happy">Happy</option>
                  <option value="Distressed">Distressed</option>
                </select>
              </div>
            </div>

            <div className="form-group full-width">
              <label>Session Narrative</label>
              <textarea
                name="sessionNarrative"
                value={formData.sessionNarrative}
                onChange={handleInputChange}
                placeholder="Describe the session, topics discussed, client responses..."
                rows={4}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Interventions Applied</label>
              <textarea
                name="interventionsApplied"
                value={formData.interventionsApplied}
                onChange={handleInputChange}
                placeholder="List therapeutic techniques and interventions used..."
                rows={3}
              />
            </div>

            <div className="form-group full-width">
              <label>Follow-up Actions</label>
              <textarea
                name="followUpActions"
                value={formData.followUpActions}
                onChange={handleInputChange}
                placeholder="Recommended follow-up sessions, assignments, or actions..."
                rows={3}
              />
            </div>

            <div className="form-checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="progressNoted"
                  checked={formData.progressNoted}
                  onChange={handleInputChange}
                />
                <span>Progress Noted</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="concernsFlagged"
                  checked={formData.concernsFlagged}
                  onChange={handleInputChange}
                />
                <span>Concerns Flagged</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="referralMade"
                  checked={formData.referralMade}
                  onChange={handleInputChange}
                />
                <span>Referral Made</span>
              </label>
            </div>

            <button type="submit" className="btn-primary">Save Session Record</button>
          </form>
        </div>
      )}

      <div className="recordings-list">
        {records.map(record => (
          <div key={record.id} className="recording-card">
            <div className="recording-header-card">
              <div className="recording-date">{new Date(record.sessionDate).toLocaleDateString()}</div>
              <div className="recording-type">{record.sessionType} Session</div>
            </div>

            <div className="recording-meta">
              <div className="meta-item">
                <span className="meta-label">Social Worker:</span>
                <span className="meta-value">{record.socialWorker}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Client State (Start → End):</span>
                <span className="meta-value">
                  <span className={`emotional-state ${getEmotionalStateClass(record.emotionalStateObserved)}`}>
                    {record.emotionalStateObserved}
                  </span>
                  <span className="arrow">→</span>
                  <span className={`emotional-state ${getEmotionalStateClass(record.emotionalStateEnd)}`}>
                    {record.emotionalStateEnd}
                  </span>
                </span>
              </div>
            </div>

            <div className="recording-content">
              <div className="content-section">
                <h4>Session Narrative</h4>
                <p>{record.sessionNarrative}</p>
              </div>

              {record.interventionsApplied && (
                <div className="content-section">
                  <h4>Interventions</h4>
                  <p>{record.interventionsApplied}</p>
                </div>
              )}

              {record.followUpActions && (
                <div className="content-section">
                  <h4>Follow-up Actions</h4>
                  <p>{record.followUpActions}</p>
                </div>
              )}
            </div>

            <div className="recording-flags">
              {record.progressNoted && <span className="flag progress">✓ Progress Noted</span>}
              {record.concernsFlagged && <span className="flag concerns">⚠ Concerns Flagged</span>}
              {record.referralMade && <span className="flag referral">→ Referral Made</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
