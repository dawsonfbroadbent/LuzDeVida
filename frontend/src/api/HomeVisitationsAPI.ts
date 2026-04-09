import { apiUrl } from './apiConfig';

export interface home_visitation {
  visitation_id: number
  resident_id: number
  resident?: any
  visit_date: string
  social_worker: string
  visit_type: string
  location_visited: string
  family_members_present: string
  purpose: string
  observations: string
  family_cooperation_level: string
  safety_concerns_noted: boolean
  follow_up_needed: boolean
  follow_up_notes: string
  visit_outcome: string
}

export const fetchHomeVisitations = async (
  residentId: number
): Promise<home_visitation[]> => {
  const response = await fetch(apiUrl(`/api/homevisitations?residentId=${residentId}`), {
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch home visitations: ${response.statusText}`)
  }
  return await response.json()
}

export const addHomeVisitation = async (
  newVisit: home_visitation
): Promise<home_visitation> => {
  const response = await fetch(apiUrl('/api/homevisitations'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(newVisit),
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Failed to add home visitation: ${response.status}`)
  }
  return await response.json()
}

export const updateHomeVisitation = async (
  visitationId: number,
  updatedVisit: home_visitation
): Promise<void> => {
  const response = await fetch(apiUrl(`/api/homevisitations/${visitationId}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updatedVisit),
  })
  if (!response.ok) {
    throw new Error(`Failed to update home visitation: ${response.statusText}`)
  }
}

export const deleteHomeVisitation = async (
  visitationId: number
): Promise<void> => {
  const response = await fetch(apiUrl(`/api/homevisitations/${visitationId}`), {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error(`Failed to delete home visitation: ${response.statusText}`)
  }
}
