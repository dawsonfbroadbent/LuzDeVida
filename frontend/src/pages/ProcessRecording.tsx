import React, { useState, useEffect } from 'react';
import { fetchResidentsForRecording, fetchProcessRecordingsByResident, createProcessRecording, updateProcessRecording, deleteProcessRecording } from '../api/ProcessRecordingsAPI';
import type { processRecording } from '../api/ProcessRecordingsAPI';
import '../styles/ProcessRecordings.css';

interface Resident {
  resident_id: number;
  case_control_no: string | null;
  internal_code: string | null;
  assigned_social_worker: string | null;
}

interface FormData {
  recording_id?: number;
  resident_id: number;
  session_date: string;
  social_worker: string;
  session_type: string;
  emotional_state_observed: string;
  session_narrative: string;
  interventions_applied: string;
  follow_up_actions: string;
}

interface Alert {
  type: 'success' | 'error';
  message: string;
}

const ProcessRecording: React.FC = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [recordings, setRecordings] = useState<processRecording[]>([]);
  const [selectedResident, setSelectedResident] = useState<number | null>(null);
  const [expandedRecording, setExpandedRecording] = useState<number | null>(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordingToDelete, setRecordingToDelete] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    resident_id: 0,
    session_date: '',
    social_worker: '',
    session_type: '',
    emotional_state_observed: '',
    session_narrative: '',
    interventions_applied: '',
    follow_up_actions: '',
  });
  
  const [alert, setAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(false);

  // Load residents on mount
  useEffect(() => {
    loadResidents();
  }, []);

  // Load recordings when resident is selected
  useEffect(() => {
    if (selectedResident) {
      loadRecordings(selectedResident);
    } else {
      setRecordings([]);
    }
  }, [selectedResident]);

  const loadResidents = async () => {
    try {
      const data = await fetchResidentsForRecording();
      setResidents(data);
    } catch (error) {
      showAlert('error', 'Failed to load residents');
      console.error('Error loading residents:', error);
    }
  };

  const loadRecordings = async (residentId: number) => {
    try {
      setLoading(true);
      const data = await fetchProcessRecordingsByResident(residentId);
      // Sort by session_date descending (most recent first)
      const sorted = [...data].sort((a, b) => {
        const dateA = new Date(a.session_date || '').getTime();
        const dateB = new Date(b.session_date || '').getTime();
        return dateB - dateA;
      });
      setRecordings(sorted);
    } catch (error) {
      showAlert('error', 'Failed to load process recordings');
      console.error('Error loading recordings:', error);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const dismissAlert = () => {
    setAlert(null);
  };

  const openCreateModal = () => {
    setFormData({
      resident_id: selectedResident || 0,
      session_date: new Date().toISOString().split('T')[0],
      social_worker: '',
      session_type: '',
      emotional_state_observed: '',
      session_narrative: '',
      interventions_applied: '',
      follow_up_actions: '',
    });
    setShowCreateModal(true);
  };

  const openEditModal = (recording: processRecording) => {
    setFormData({
      recording_id: recording.recording_id,
      resident_id: recording.resident_id,
      session_date: recording.session_date || '',
      social_worker: recording.social_worker || '',
      session_type: recording.session_type || '',
      emotional_state_observed: recording.emotional_state_observed || '',
      session_narrative: recording.session_narrative || '',
      interventions_applied: recording.interventions_applied || '',
      follow_up_actions: recording.follow_up_actions || '',
    });
    setShowEditModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setFormData({
      resident_id: selectedResident || 0,
      session_date: '',
      social_worker: '',
      session_type: '',
      emotional_state_observed: '',
      session_narrative: '',
      interventions_applied: '',
      follow_up_actions: '',
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedResident) {
      showAlert('error', 'Please select a resident');
      return;
    }

    if (!formData.session_date) {
      showAlert('error', 'Session date is required');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        resident_id: selectedResident,
        session_date: formData.session_date,
        social_worker: formData.social_worker || null,
        session_type: formData.session_type || null,
        session_duration_minutes: null,
        emotional_state_observed: formData.emotional_state_observed || null,
        emotional_state_end: null,
        session_narrative: formData.session_narrative || null,
        interventions_applied: formData.interventions_applied || null,
        follow_up_actions: formData.follow_up_actions || null,
        progress_noted: null,
        concerns_flagged: null,
        referral_made: null,
        notes_restricted: null,
      };

      if (showEditModal && formData.recording_id) {
        // Update existing recording
        await updateProcessRecording(formData.recording_id, payload);
        showAlert('success', 'Process recording updated successfully');
      } else {
        // Create new recording
        await createProcessRecording(payload);
        showAlert('success', 'Process recording created successfully');
      }

      closeModal();
      loadRecordings(selectedResident);
    } catch (error) {
      showAlert('error', showEditModal ? 'Failed to update recording' : 'Failed to create recording');
      console.error('Error saving recording:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (recordingId: number) => {
    setRecordingToDelete(recordingId);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (recordingToDelete === null || selectedResident === null) return;

    try {
      setLoading(true);
      await deleteProcessRecording(recordingToDelete);
      showAlert('success', 'Process recording deleted successfully');
      setShowDeleteModal(false);
      setRecordingToDelete(null);
      loadRecordings(selectedResident);
    } catch (error) {
      showAlert('error', 'Failed to delete recording');
      console.error('Error deleting recording:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getResidentName = (id: number): string => {
    const resident = residents.find(r => r.resident_id === id);
    return resident ? (resident.case_control_no || resident.internal_code || `Resident #${resident.resident_id}`) : 'Unknown';
  };

  return (
    <div className="process-recordings">
      <div className="process-recordings-header">
        <h1>Process Recordings</h1>
        <p className="subtitle">
          Track and document counseling sessions and interventions for each resident. View the complete healing journey chronologically.
        </p>
      </div>

      {/* Alerts */}
      {alert && (
        <div className={alert.type === 'error' ? 'error-alert' : 'success-alert'}>
          <span>{alert.message}</span>
          <button className="alert-close" onClick={dismissAlert}>×</button>
        </div>
      )}

      {/* Resident Selector */}
      <div className="resident-selector">
        <h2>Select Resident</h2>
        <div className="selector-row">
          <div className="selector-group" style={{ flex: 1, minWidth: '250px' }}>
            <label htmlFor="resident-select">Resident Name</label>
            <select
              id="resident-select"
              value={selectedResident || ''}
              onChange={(e) => setSelectedResident(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">-- Select a Resident --</option>
              {residents.map(resident => (
                <option key={resident.resident_id} value={resident.resident_id}>
                  {resident.case_control_no || resident.internal_code || `Resident #${resident.resident_id}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      {selectedResident && (
        <div className="action-bar">
          <button 
            className="btn-primary" 
            onClick={openCreateModal}
            disabled={loading}
          >
            + New Process Recording
          </button>
        </div>
      )}

      {/* Recordings Timeline */}
      <div className="recordings-timeline">
        {!selectedResident ? (
          <div className="timeline-empty">
            <p>Select a resident to view their process recordings</p>
          </div>
        ) : loading && recordings.length === 0 ? (
          <div className="timeline-empty">
            <p>Loading process recordings...</p>
          </div>
        ) : recordings.length === 0 ? (
          <div className="timeline-empty">
            <p>No process recordings found for this resident. Create one to get started.</p>
          </div>
        ) : (
          recordings.map(recording => (
            <div
              key={recording.recording_id}
              className={`timeline-entry ${expandedRecording === recording.recording_id ? 'expanded' : ''}`}
            >
              <div
                className="timeline-header"
                onClick={() => setExpandedRecording(
                  expandedRecording === recording.recording_id ? null : recording.recording_id
                )}
              >
                <div className="timeline-meta">
                  <h3 className="timeline-date">{formatDate(recording.session_date)}</h3>
                  <div className="timeline-info">
                    {recording.social_worker && (
                      <div className="timeline-info-item">
                        <span className="timeline-info-label">Social Worker:</span>
                        <span className="timeline-info-value">{recording.social_worker}</span>
                      </div>
                    )}
                    {recording.session_type && (
                      <div className="timeline-info-item">
                        <span className="timeline-info-label">Type:</span>
                        <span className="timeline-info-value">{recording.session_type}</span>
                      </div>
                    )}
                    {recording.emotional_state_observed && (
                      <div className="timeline-info-item">
                        <span className="timeline-info-label">Emotional State:</span>
                        <span className="timeline-info-value">{recording.emotional_state_observed}</span>
                      </div>
                    )}
                  </div>
                </div>
                <span className="timeline-expand-icon">▼</span>
              </div>

              {/* Expanded Details */}
              {expandedRecording === recording.recording_id && (
                <div className="timeline-details">
                  {recording.session_narrative && (
                    <div className="detail-section">
                      <h4>Session Narrative</h4>
                      <p>{recording.session_narrative}</p>
                    </div>
                  )}

                  {recording.interventions_applied && (
                    <div className="detail-section">
                      <h4>Interventions Applied</h4>
                      <p>{recording.interventions_applied}</p>
                    </div>
                  )}

                  {recording.follow_up_actions && (
                    <div className="detail-section">
                      <h4>Follow-up Actions</h4>
                      <p>{recording.follow_up_actions}</p>
                    </div>
                  )}

                  <div className="timeline-actions">
                    <button
                      className="btn-small btn-edit"
                      onClick={() => openEditModal(recording)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-small btn-delete"
                      onClick={() => openDeleteModal(recording.recording_id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{showEditModal ? 'Edit Process Recording' : 'New Process Recording'}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <form className="recording-form" onSubmit={handleFormSubmit}>
              <div className="form-section">
                <h3>Session Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="session-date">Session Date *</label>
                    <input
                      id="session-date"
                      type="date"
                      name="session_date"
                      value={formData.session_date}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="session-type">Session Type</label>
                    <select
                      id="session-type"
                      name="session_type"
                      value={formData.session_type}
                      onChange={handleFormChange}
                    >
                      <option value="">-- Select Type --</option>
                      <option value="Individual">Individual</option>
                      <option value="Group">Group</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="social-worker">Social Worker</label>
                    <input
                      id="social-worker"
                      type="text"
                      name="social_worker"
                      value={formData.social_worker}
                      onChange={handleFormChange}
                      placeholder="Enter social worker name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="emotional-state">Emotional State Observed</label>
                    <input
                      id="emotional-state"
                      type="text"
                      name="emotional_state_observed"
                      value={formData.emotional_state_observed}
                      onChange={handleFormChange}
                      placeholder="e.g., Calm, Anxious, Engaged"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Session Details</h3>
                <div className="form-row full">
                  <div className="form-group">
                    <label htmlFor="narrative">Session Narrative</label>
                    <textarea
                      id="narrative"
                      name="session_narrative"
                      value={formData.session_narrative}
                      onChange={handleFormChange}
                      placeholder="Summarize the session, discussion topics, and key points..."
                    />
                  </div>
                </div>

                <div className="form-row full">
                  <div className="form-group">
                    <label htmlFor="interventions">Interventions Applied</label>
                    <textarea
                      id="interventions"
                      name="interventions_applied"
                      value={formData.interventions_applied}
                      onChange={handleFormChange}
                      placeholder="Document any therapeutic techniques, counseling methods, or interventions used..."
                    />
                  </div>
                </div>

                <div className="form-row full">
                  <div className="form-group">
                    <label htmlFor="followup">Follow-up Actions</label>
                    <textarea
                      id="followup"
                      name="follow_up_actions"
                      value={formData.follow_up_actions}
                      onChange={handleFormChange}
                      placeholder="Outline any follow-up appointments, assignments, or next steps..."
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModal}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (showEditModal ? 'Update Recording' : 'Create Recording')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Delete Process Recording</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>

            <div className="recording-form">
              <div className="delete-confirm-box">
                <p>⚠️ Warning: This action cannot be undone</p>
                <p>
                  Are you sure you want to delete this process recording from {' '}
                  {getResidentName(selectedResident || 0)}?
                </p>
              </div>

              <div className="confirm-actions">
                <button
                  className="btn-confirm-cancel"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="btn-confirm-delete"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete Recording'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessRecording;
