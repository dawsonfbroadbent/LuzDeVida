export type AdminTabId =
  | 'dashboard'
  | 'home-visitations'
  | 'caseload-inventory'
  | 'process-recording'
  | 'donor-management'

export interface AdminTabDefinition {
  id: AdminTabId
  label: string
  description: string
}

export const DEFAULT_ADMIN_TAB: AdminTabId = 'dashboard'

export const ADMIN_TABS: AdminTabDefinition[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Operations overview and program health metrics.',
  },
  {
    id: 'home-visitations',
    label: 'Home Visitations',
    description: 'Family visits, case conferences, and follow-up planning.',
  },
  {
    id: 'caseload-inventory',
    label: 'Caseload Inventory',
    description: 'Resident records, admissions, and reintegration tracking.',
  },
  {
    id: 'process-recording',
    label: 'Process Recording',
    description: 'Session notes, interventions, and resident progress history.',
  },
  {
    id: 'donor-management',
    label: 'Donor Management',
    description: 'Supporter profiles, giving history, and relationship management.',
  },
]

const ADMIN_TAB_SET = new Set<AdminTabId>(ADMIN_TABS.map((tab) => tab.id))

export function isAdminTabId(value: string | null | undefined): value is AdminTabId {
  return value != null && ADMIN_TAB_SET.has(value as AdminTabId)
}

export function normalizeAdminTab(value: string | null | undefined): AdminTabId {
  return isAdminTabId(value) ? value : DEFAULT_ADMIN_TAB
}

export function getAdminTabHref(tabId: AdminTabId): string {
  return `/admin?tab=${tabId}`
}
