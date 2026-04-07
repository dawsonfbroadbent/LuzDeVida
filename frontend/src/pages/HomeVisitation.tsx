import { useState } from 'react';
import '../styles/HomeVisitation.css';

interface Visitation {
  id: number;
  residentId: number;
  visitDate: string;
  visitType: string;
  socialWorker: string;
  locationVisited: string;
  familyCooperationLevel: string;
  observations: string;
  safetyConcerns: string;
  visitOutcome: string;
}

export default function HomeVisitation() {
  const [visitations, setVisitations] = useState<Visitation[]>([
    {
      id: 1,
      residentId: 1,
      visitDate: '2024-03-20',
      visitType: 'Post-Placement Monitoring',
      socialWorker: 'Maria Santos',
      locationVisited: 'Home of Grandmother, Barangay 3',
      familyCooperationLevel: 'Cooperative',
      observations: 'Client appears well-adjusted. Family supportive. Living conditions are adequate.',
      safetyConcerns: 'None noted. Environment is safe.',
      visitOutcome: 'Favorable'
    },
    {
      id: 2,
      residentId: 2,
      visitDate: '2024-04-01',
      visitType: 'Initial Assessment',
      socialWorker: 'Juan Reyes',
      locationVisited: 'Family home, Barangay 5',
      familyCooperationLevel: 'Somewhat Resistant',
      observations: 'Parents showed some reluctance to engage. Housing conditions need improvement.',
      safetyConcerns: 'Overcrowding, inadequate sanitation facilities.',
      visitOutcome: 'Needs Improvement'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    residentId: '',
    visitDate: '',
    visitType: 'Routine Follow-Up',
    socialWorker: '',
    locationVisited: '',
    familyCooperationLevel: 'Cooperative',
    observations: '',
    safetyConcerns: '',
    visitOutcome: 'Favorable'
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const newVisitation: Visitation = {
      id: visitations.length + 1,
      residentId: parseInt(formData.residentId),
      visitDate: formData.visitDate,
      visitType: formData.visitType,
      socialWorker: formData.socialWorker,
      locationVisited: formData.locationVisited,
      familyCooperationLevel: formData.familyCooperationLevel,
      observations: formData.observations,
      safetyConcerns: formData.safetyConcerns,
      visitOutcome: formData.visitOutcome
    };
    setVisitations([newVisitation, ...visitations]);
    setShowForm(false);
    setFormData({
      residentId: '',
      visitDate: '',
      visitType: 'Routine Follow-Up',
      socialWorker: '',
      locationVisited: '',
      familyCooperationLevel: 'Cooperative',
      observations: '',
      safetyConcerns: '',
      visitOutcome: 'Favorable'
    });
  };

  const getOutcomeClass = (outcome: string) => {
    switch (outcome) {
      case 'Favorable': return 'outcome-favorable';
      case 'Needs Improvement': return 'outcome-improvement';
      case 'Unfavorable': return 'outcome-unfavorable';
      case 'Inconclusive': return 'outcome-inconclusive';
      default: return '';
    }
  };

  const filteredVisitations = filterType === 'all'
    ? visitations
    : visitations.filter(v => v.visitType === filterType);

  return (
    <div className="home-visitation-container">
      <div className="visitation-header">
        <h1>Home Visitation Records</h1>
        <p>Track family assessments and home visits</p>
      </div>

      <div className="visitation-controls">
        <div className="filter-group">
          <label>Filter by Visit Type:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
            <option value="all">All Visits</option>
            <option value="Initial Assessment">Initial Assessment</option>
            <option value="Routine Follow-Up">Routine Follow-Up</option>
            <option value="Reintegration Assessment">Reintegration Assessment</option>
            <option value="Post-Placement Monitoring">Post-Placement Monitoring</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>

        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Log New Visit'}
        </button>
      </div>

      {showForm && (
        <div className="visitation-form">
          <h3>Log New Home Visitation</h3>
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
                <label>Visit Date</label>
                <input
                  type="date"
                  name="visitDate"
                  value={formData.visitDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Visit Type</label>
                <select
                  name="visitType"
                  value={formData.visitType}
                  onChange={handleInputChange}
                >
                  <option value="Initial Assessment">Initial Assessment</option>
                  <option value="Routine Follow-Up">Routine Follow-Up</option>
                  <option value="Reintegration Assessment">Reintegration Assessment</option>
                  <option value="Post-Placement Monitoring">Post-Placement Monitoring</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              <div className="form-group">
                <label>Social Worker</label>
                <input
                  type="text"
                  name="socialWorker"
                  value={formData.socialWorker}
                  onChange={handleInputChange}
                  placeholder="Full name"
                  required
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Location Visited</label>
              <input
                type="text"
                name="locationVisited"
                value={formData.locationVisited}
                onChange={handleInputChange}
                placeholder="Address, barangay, city"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Family Cooperation Level</label>
                <select
                  name="familyCooperationLevel"
                  value={formData.familyCooperationLevel}
                  onChange={handleInputChange}
                >
                  <option value="Cooperative">Cooperative</option>
                  <option value="Somewhat Cooperative">Somewhat Cooperative</option>
                  <option value="Somewhat Resistant">Somewhat Resistant</option>
                  <option value="Not Available">Not Available</option>
                </select>
              </div>
              <div className="form-group">
                <label>Visit Outcome</label>
                <select
                  name="visitOutcome"
                  value={formData.visitOutcome}
                  onChange={handleInputChange}
                >
                  <option value="Favorable">Favorable</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                  <option value="Unfavorable">Unfavorable</option>
                  <option value="Inconclusive">Inconclusive</option>
                </select>
              </div>
            </div>

            <div className="form-group full-width">
              <label>Observations</label>
              <textarea
                name="observations"
                value={formData.observations}
                onChange={handleInputChange}
                placeholder="Client adjustment, family dynamics, environment details..."
                rows={4}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Safety Concerns (if any)</label>
              <textarea
                name="safetyConcerns"
                value={formData.safetyConcerns}
                onChange={handleInputChange}
                placeholder="Document any safety risks or concerns noted..."
                rows={3}
              />
            </div>

            <button type="submit" className="btn-primary">Save Visitation Record</button>
          </form>
        </div>
      )}

      <div className="visitations-grid">
        {filteredVisitations.map(visit => (
          <div key={visit.id} className="visitation-card">
            <div className="card-header">
              <div className="visit-date">{new Date(visit.visitDate).toLocaleDateString()}</div>
              <div className={`outcome-badge ${getOutcomeClass(visit.visitOutcome)}`}>
                {visit.visitOutcome}
              </div>
            </div>

            <div className="card-meta">
              <div className="meta-row">
                <span className="meta-label">Visit Type:</span>
                <span className="meta-value">{visit.visitType}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Social Worker:</span>
                <span className="meta-value">{visit.socialWorker}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Location:</span>
                <span className="meta-value">{visit.locationVisited}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Family Cooperation:</span>
                <span className={`cooperation-badge coop-${visit.familyCooperationLevel.toLowerCase().replace(/\s+/g, '-')}`}>
                  {visit.familyCooperationLevel}
                </span>
              </div>
            </div>

            <div className="card-content">
              <h4>Observations</h4>
              <p>{visit.observations}</p>

              {visit.safetyConcerns && (
                <>
                  <h4>Safety Concerns</h4>
                  <p className="safety-text">{visit.safetyConcerns}</p>
                </>
              )}
            </div>

            <div className="card-actions">
              <button className="btn-small">View Details</button>
              <button className="btn-small">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
