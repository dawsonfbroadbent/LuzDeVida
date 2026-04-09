import { apiUrl } from './apiConfig';

export interface processRecording {
  recording_id: number
  resident_id: number
  session_date: string | null
  social_worker: string | null
  session_type: string | null
  session_duration_minutes: number | null
  emotional_state_observed: string | null
  emotional_state_end: string | null
  session_narrative: string | null
  interventions_applied: string | null
  follow_up_actions: string | null
  progress_noted: boolean | null
  concerns_flagged: boolean | null
  referral_made: boolean | null
  notes_restricted: string | null
}

export async function fetchResidentsForRecording(): Promise<any[]> {
  const response = await fetch(apiUrl('/api/residents'), { credentials: 'include' })
  if (!response.ok) {
    throw new Error(`Failed to fetch residents: ${response.status}`)
  }
  return response.json()
}

export async function fetchProcessRecordings(
  residentId?: number
): Promise<processRecording[]> {
  const url = residentId
    ? apiUrl(`/api/processrecordings?residentId=${residentId}`)
    : apiUrl('/api/processrecordings')

  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) {
    throw new Error(`Failed to fetch process recordings: ${response.status}`)
  }
  return response.json()
}

export async function fetchProcessRecordingsByResident(
  residentId: number
): Promise<processRecording[]> {
  const response = await fetch(
    apiUrl(`/api/processrecordings?residentId=${residentId}`),
    { credentials: 'include' }
  )
  if (!response.ok) {
    throw new Error(
      `Failed to fetch process recordings for resident: ${response.status}`
    )
  }
  return response.json()
}

export async function createProcessRecording(
  recording: Omit<processRecording, 'recording_id'>
): Promise<processRecording> {
  const response = await fetch(apiUrl('/api/processrecordings'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(recording),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to create process recording: ${response.status} ${text}`)
  }

  return response.json()
}

export async function updateProcessRecording(
  recordingId: number,
  recording: Omit<processRecording, 'recording_id'>
): Promise<void> {
  const response = await fetch(apiUrl(`/api/processrecordings/${recordingId}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      ...recording,
      recording_id: recordingId,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to update process recording: ${response.status} ${text}`)
  }
}

export async function deleteProcessRecording(recordingId: number): Promise<void> {
  const response = await fetch(apiUrl(`/api/processrecordings/${recordingId}`), {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to delete process recording: ${response.status} ${text}`)
  }
}
