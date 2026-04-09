import { apiUrl } from './apiConfig';

export interface DonationPayload {
  amount: number
  isRecurring: boolean
  campaignName?: string
  notes?: string
}

export async function createDonation(
  payload: DonationPayload,
): Promise<{ donation_id: number }> {
  const res = await fetch(apiUrl('/api/donations'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { message?: string }).message ?? 'Failed to record donation.')
  }
  return data as { donation_id: number }
}
