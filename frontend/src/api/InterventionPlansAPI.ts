import { apiUrl } from './apiConfig';

export type intervention_plan = {
  plan_id: number
  resident_id: number
  resident?: any
  plan_category: string
  plan_description: string
  services_provided: string
  target_value: number | null
  target_date: string
  status: string
  case_conference_date: string | null
  created_at: string
  updated_at: string
}

export async function fetchInterventionPlans(
  residentId?: number
): Promise<intervention_plan[]> {
  const url =
    residentId !== undefined
      ? apiUrl(`/api/InterventionPlans?residentId=${residentId}`)
      : apiUrl('/api/InterventionPlans')

  const response = await fetch(url, { credentials: 'include' })

  if (!response.ok) {
    throw new Error('Failed to fetch intervention plans')
  }

  return await response.json()
}

export async function fetchInterventionPlanById(
  id: number
): Promise<intervention_plan> {
  const response = await fetch(apiUrl(`/api/InterventionPlans/${id}`), { credentials: 'include' })

  if (!response.ok) {
    throw new Error(`Failed to fetch intervention plan ${id}`)
  }

  return await response.json()
}

export async function createInterventionPlan(
  plan: Omit<intervention_plan, 'plan_id'>
): Promise<intervention_plan> {
  const response = await fetch(apiUrl('/api/InterventionPlans'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(plan),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to create intervention plan: ${response.status} ${errorText}`)
  }

  return await response.json()
}

export async function updateInterventionPlan(
  id: number,
  plan: intervention_plan
): Promise<void> {
  const response = await fetch(apiUrl(`/api/InterventionPlans/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(plan),
  })

  if (!response.ok) {
    throw new Error(`Failed to update intervention plan ${id}`)
  }
}

export async function deleteInterventionPlan(id: number): Promise<void> {
  const response = await fetch(apiUrl(`/api/InterventionPlans/${id}`), {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to delete intervention plan ${id}`)
  }
}
