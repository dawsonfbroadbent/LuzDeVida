import { apiUrl } from './apiConfig';

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

export const fetchResidents = async (): Promise<resident[]> => {
  const response = await fetch(apiUrl('/api/Residents'), { credentials: 'include' })
  if (!response.ok) {
    throw new Error(`Failed to fetch residents: ${response.statusText}`)
  }
  return await response.json()
}

export const fetchResidentById = async (residentId: number): Promise<resident> => {
  const response = await fetch(apiUrl(`/api/Residents/${residentId}`), { credentials: 'include' })
  if (!response.ok) {
    throw new Error(`Failed to fetch resident: ${response.statusText}`)
  }
  return await response.json()
}

export const createResident = async (resident: Omit<resident, 'resident_id' | 'created_at'>): Promise<resident> => {
  const response = await fetch(apiUrl('/api/Residents'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(resident),
  })
  if (!response.ok) {
    throw new Error(`Failed to create resident: ${response.statusText}`)
  }
  return await response.json()
}

export const updateResident = async (
  residentId: number,
  resident: Omit<resident, 'resident_id' | 'created_at'>
): Promise<void> => {
  const response = await fetch(apiUrl(`/api/Residents/${residentId}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ ...resident, resident_id: residentId }),
  })
  if (!response.ok) {
    throw new Error(`Failed to update resident: ${response.statusText}`)
  }
}

export const deleteResident = async (residentId: number): Promise<void> => {
  const response = await fetch(apiUrl(`/api/Residents/${residentId}`), {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error(`Failed to delete resident: ${response.statusText}`)
  }
}
