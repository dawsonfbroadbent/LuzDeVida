const BASE = 'https://luzdevidabackend-aegdcxe9grhucsfm.francecentral-01.azurewebsites.net/api/donations'

export interface DonationPayload {
  amount: number
  isRecurring: boolean
  campaignName?: string
  notes?: string
}

export async function createDonation(
  payload: DonationPayload,
  token: string,
): Promise<{ donation_id: number }> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { message?: string }).message ?? 'Failed to record donation.')
  }
  return data as { donation_id: number }
}
