const BASE = 'https://luzdevidabackend-aegdcxe9grhucsfm.francecentral-01.azurewebsites.net/api/supporters'

export interface SupporterStats {
  totalSupporters: number
  activeSupporters: number
  totalMonetaryDonated: number
  recurringDonorsCount: number
  inKindDonorsCount: number
  avgDonation: number
}

export interface SupporterListItem {
  supporterId: number
  displayName: string
  supporterType: string | null
  status: string | null
  region: string | null
  totalGiven: number
  lastDonationDate: string | null
  contributionTypes: string[]
}

export interface AllocationDetail {
  allocationId: number
  safehouseId: number
  programArea: string | null
  amountAllocated: number | null
  allocationDate: string | null
  allocationNotes: string | null
}

export interface InKindItem {
  itemId: number
  itemName: string | null
  itemCategory: string | null
  quantity: number | null
  unitOfMeasure: string | null
  estimatedUnitValue: number | null
  intendedUse: string | null
  receivedCondition: string | null
}

export interface DonationDetail {
  donationId: number
  donationType: string | null
  donationDate: string | null
  channelSource: string | null
  currencyCode: string | null
  amount: number | null
  estimatedValue: number | null
  impactUnit: string | null
  isRecurring: boolean | null
  campaignName: string | null
  notes: string | null
  allocations: AllocationDetail[]
  inKindItems: InKindItem[]
}

export interface SupporterDetail {
  supporterId: number
  supporterType: string | null
  displayName: string | null
  organizationName: string | null
  firstName: string | null
  lastName: string | null
  relationshipType: string | null
  region: string | null
  country: string | null
  email: string | null
  phone: string | null
  status: string | null
  firstDonationDate: string | null
  acquisitionChannel: string | null
  createdAt: string | null
  donations: DonationDetail[]
}

export interface SupporterPagedResult {
  items: SupporterListItem[]
  totalCount: number
  page: number
  pageSize: number
}

export interface CreateSupporterPayload {
  supporterType?: string
  displayName?: string
  organizationName?: string
  firstName?: string
  lastName?: string
  relationshipType?: string
  region?: string
  country?: string
  email?: string
  phone?: string
  status?: string
  acquisitionChannel?: string
}

export type UpdateSupporterPayload = CreateSupporterPayload

export async function fetchSupporterStats(token: string): Promise<SupporterStats> {
  const res = await fetch(`${BASE}/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { message?: string }).message ?? 'Failed to load stats.')
  return data as SupporterStats
}

export async function fetchSupporters(
  params: {
    page?: number
    pageSize?: number
    search?: string
    status?: string
    supporter_type?: string
    contribution_type?: string
    region?: string
  },
  token: string,
): Promise<SupporterPagedResult> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))
  if (params.search) query.set('search', params.search)
  if (params.status && params.status !== 'All') query.set('status', params.status)
  if (params.supporter_type && params.supporter_type !== 'All') query.set('supporter_type', params.supporter_type)
  if (params.contribution_type && params.contribution_type !== 'All') query.set('contribution_type', params.contribution_type)
  if (params.region && params.region !== 'All') query.set('region', params.region)

  const res = await fetch(`${BASE}?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { message?: string }).message ?? 'Failed to load supporters.')
  return data as SupporterPagedResult
}

export async function fetchSupporterById(id: number, token: string): Promise<SupporterDetail> {
  const res = await fetch(`${BASE}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { message?: string }).message ?? 'Failed to load supporter.')
  return data as SupporterDetail
}

export async function createSupporter(
  payload: CreateSupporterPayload,
  token: string,
): Promise<SupporterDetail> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { message?: string }).message ?? 'Failed to create supporter.')
  return data as SupporterDetail
}

export async function updateSupporter(
  id: number,
  payload: UpdateSupporterPayload,
  token: string,
): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { message?: string }).message ?? 'Failed to update supporter.')
  }
}
