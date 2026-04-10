import { apiUrl } from './apiConfig';

export interface DonationPayload {
  amount: number
  isRecurring: boolean
  campaignName?: string
  notes?: string
}

export interface DonationHistoryItem {
  donation_id: number
  donation_date: string | null
  amount: number | null
  currency_code: string | null
  is_recurring: boolean | null
  donation_type: string | null
}

export async function fetchMyDonations(): Promise<DonationHistoryItem[]> {
  const res = await fetch(apiUrl('/api/donations/my-history'), {
    credentials: 'include',
  })
  if (!res.ok) return []
  return res.json()
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
