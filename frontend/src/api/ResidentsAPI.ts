export interface resident {
  resident_id: number
  case_control_no: string | null
  internal_code: string | null
  safehouse_id: number | null
  case_status: string | null
  sex: string | null
  date_of_birth: string | null
  birth_status: string | null
  place_of_birth: string | null
  religion: string | null
  case_category: string | null
  sub_cat_orphaned: boolean | null
  sub_cat_trafficked: boolean | null
  sub_cat_child_labor: boolean | null
  sub_cat_physical_abuse: boolean | null
  sub_cat_sexual_abuse: boolean | null
  sub_cat_osaec: boolean | null
  sub_cat_cicl: boolean | null
  sub_cat_at_risk: boolean | null
  sub_cat_street_child: boolean | null
  sub_cat_child_with_hiv: boolean | null
  is_pwd: boolean | null
  pwd_type: string | null
  has_special_needs: boolean | null
  special_needs_diagnosis: string | null
  family_is_4ps: boolean | null
  family_solo_parent: boolean | null
  family_indigenous: boolean | null
  family_parent_pwd: boolean | null
  family_informal_settler: boolean | null
  date_of_admission: string | null
  age_upon_admission: string | null
  present_age: string | null
  length_of_stay: string | null
  referral_source: string | null
  referring_agency_person: string | null
  date_colb_registered: string | null
  date_colb_obtained: string | null
  assigned_social_worker: string | null
  initial_case_assessment: string | null
  date_case_study_prepared: string | null
  reintegration_type: string | null
  reintegration_status: string | null
  initial_risk_level: string | null
  current_risk_level: string | null
  date_enrolled: string | null
  date_closed: string | null
  created_at: string | null
  notes_restricted: string | null
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

export const createResident = async (resident: Omit<resident, 'resident_id' | 'created_at'>): Promise<resident> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resident),
    })

    if (!response.ok) {
      throw new Error(`FAILED TO CREATE RESIDENT: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating resident:', error)
    throw error
  }
}

export const updateResident = async (
  residentId: number,
  resident: Omit<resident, 'resident_id' | 'created_at'>
): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${residentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...resident, resident_id: residentId }),
    })

    if (!response.ok) {
      throw new Error(`FAILED TO UPDATE RESIDENT: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error updating resident:', error)
    throw error
  }
}

export const deleteResident = async (residentId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${residentId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`FAILED TO DELETE RESIDENT: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error deleting resident:', error)
    throw error
  }
}