export interface home_visitation {
  visitation_id: number
  resident_id: number
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

const API_URL = 'http://localhost:5289/api/homevisitations'

export const fetchHomeVisitations = async (
  residentId: number
): Promise<home_visitation[]> => {
  try {
    const response = await fetch(`${API_URL}?residentId=${residentId}`)

    if (!response.ok) {
      throw new Error(`FAILED TO FETCH HOME VISITATIONS: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching home visitations:', error)
    throw error
  }
}

export const addHomeVisitation = async (
  newVisit: home_visitation
): Promise<home_visitation> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newVisit),
    })

    if (!response.ok) {
      throw new Error(`FAILED TO ADD HOME VISITATION: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error adding home visitation:', error)
    throw error
  }
}

export const updateHomeVisitation = async (
  visitationId: number,
  updatedVisit: home_visitation
): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${visitationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedVisit),
    })

    if (!response.ok) {
      throw new Error(`FAILED TO UPDATE HOME VISITATION: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error updating home visitation:', error)
    throw error
  }
}

export const deleteHomeVisitation = async (
  visitationId: number
): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${visitationId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`FAILED TO DELETE HOME VISITATION: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error deleting home visitation:', error)
    throw error
  }
}