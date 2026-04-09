import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface CookiePreferences {
  version: 1          // increment when adding new categories; enables migration
  necessary: true     // always true; covers: ASP.NET Identity session,
                      // antiforgery tokens, MFA state, and this consent record
  analytics: boolean  // user-controlled; gates any future analytics scripts
  // future categories: functional?: boolean, marketing?: boolean
}

export interface CookieConsentContextValue {
  preferences: CookiePreferences | null // null = no decision yet
  hasDecided: boolean                   // derived: preferences !== null
  isAnalyticsAccepted: boolean          // derived: preferences?.analytics === true
  acceptAll: () => void
  declineAll: () => void
  savePreferences: (partial: Pick<CookiePreferences, 'analytics'>) => void
  openPreferences: () => void
  closePreferences: () => void
  isPreferencesOpen: boolean
}

const COOKIE_NAME = 'ldv_cookie_consent'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year in seconds

function readConsentCookie(): CookiePreferences | null {
  try {
    const match = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${COOKIE_NAME}=`))
    if (!match) return null
    const raw = decodeURIComponent(match.split('=').slice(1).join('='))
    const parsed = JSON.parse(raw)
    // Require version field — values without it are legacy/invalid
    if (typeof parsed?.version !== 'number') return null
    if (typeof parsed?.analytics !== 'boolean') return null
    return { version: 1, necessary: true, analytics: parsed.analytics }
  } catch {
    return null
  }
}

function writeConsentCookie(prefs: CookiePreferences): void {
  const value = encodeURIComponent(JSON.stringify(prefs))
  // Omit Secure in dev (localhost is HTTP); the backend should enforce Secure
  // in production via its own Set-Cookie header if it ever takes over this record.
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${COOKIE_NAME}=${value}; SameSite=Strict; Path=/; Max-Age=${COOKIE_MAX_AGE}${secure}`
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null)

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(readConsentCookie)
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)

  // Keep cookie in sync whenever preferences change
  useEffect(() => {
    if (preferences !== null) {
      writeConsentCookie(preferences)
    }
  }, [preferences])

  function acceptAll() {
    setPreferences({ version: 1, necessary: true, analytics: true })
  }

  function declineAll() {
    setPreferences({ version: 1, necessary: true, analytics: false })
  }

  function savePreferences(partial: Pick<CookiePreferences, 'analytics'>) {
    setPreferences({ version: 1, necessary: true, analytics: partial.analytics })
    setIsPreferencesOpen(false)
  }

  function openPreferences() {
    setIsPreferencesOpen(true)
  }

  function closePreferences() {
    setIsPreferencesOpen(false)
  }

  const value: CookieConsentContextValue = {
    preferences,
    hasDecided: preferences !== null,
    isAnalyticsAccepted: preferences?.analytics === true,
    acceptAll,
    declineAll,
    savePreferences,
    openPreferences,
    closePreferences,
    isPreferencesOpen,
  }

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  )
}

export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext)
  if (!ctx) throw new Error('useCookieConsent must be used inside CookieConsentProvider')
  return ctx
}
