export interface resident {
  resident_id: number
  case_control_no: string
  internal_code: string
  safehouse_id: number | null
  case_status: string
  assigned_social_worker: string
  current_risk_level: string
  reintegration_status: string | null
}

const API_URL = 'http://localhost:5289/api/residents'
// change the port if your HTTPS backend uses a different one

export const fetchResidents = async (): Promise<resident[]> => {
  try {
    const response = await fetch(API_URL)

    if (!response.ok) {
      throw new Error(`FAILED TO FETCH RESIDENTS: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching residents:', error)
    throw error
  }
}

export const fetchResidentById = async (residentId: number): Promise<resident> => {
  try {
    const response = await fetch(`${API_URL}/${residentId}`)

    if (!response.ok) {
      throw new Error(`FAILED TO FETCH RESIDENT: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching resident:', error)
    throw error
  }
}