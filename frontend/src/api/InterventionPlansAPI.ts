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

const API_BASE = 'https://luzdevidabackend-aegdcxe9grhucsfm.francecentral-01.azurewebsites.net/api/InterventionPlans'
// change this if your backend uses a different port

export async function fetchInterventionPlans(
  residentId?: number
): Promise<intervention_plan[]> {
  const url =
    residentId !== undefined
      ? `${API_BASE}?residentId=${residentId}`
      : API_BASE

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to fetch intervention plans')
  }

  return await response.json()
}

export async function fetchInterventionPlanById(
  id: number
): Promise<intervention_plan> {
  const response = await fetch(`${API_BASE}/${id}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch intervention plan ${id}`)
  }

  return await response.json()
}

export async function createInterventionPlan(
  plan: Omit<intervention_plan, 'plan_id'>
): Promise<intervention_plan> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(plan),
  })

  if (!response.ok) {
    throw new Error('Failed to create intervention plan')
  }

  return await response.json()
}

export async function updateInterventionPlan(
  id: number,
  plan: intervention_plan
): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(plan),
  })

  if (!response.ok) {
    throw new Error(`Failed to update intervention plan ${id}`)
  }
}

export async function deleteInterventionPlan(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`Failed to delete intervention plan ${id}`)
  }
}