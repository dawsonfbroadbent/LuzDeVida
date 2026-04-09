import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCookieConsent } from '../context/CookieConsentContext'
import '../styles/CookieConsentBanner.css'

export default function CookieConsentBanner() {
  const {
    preferences,
    hasDecided,
    acceptAll,
    declineAll,
    savePreferences,
    openPreferences,
    closePreferences,
    isPreferencesOpen,
  } = useCookieConsent()

  // Local analytics state for the modal (mirrors saved prefs while editing)
  const [analyticsLocal, setAnalyticsLocal] = useState(preferences?.analytics ?? false)

  // Sync local state when modal opens
  useEffect(() => {
    if (isPreferencesOpen) {
      setAnalyticsLocal(preferences?.analytics ?? false)
    }
  }, [isPreferencesOpen, preferences?.analytics])

  // ── Focus trap for modal ─────────────────────────────────
  const modalRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isPreferencesOpen) return

    // Store the element that triggered the modal to restore focus on close
    triggerRef.current = document.activeElement as HTMLElement

    // Move focus into the modal
    const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
      'button, [href], input, [tabindex]:not([tabindex="-1"])'
    )
    firstFocusable?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (!modalRef.current) return

      if (e.key === 'Escape') {
        closePreferences()
        return
      }

      if (e.key === 'Tab') {
        const focusable = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter(el => !el.closest('.cookie-modal__toggle--disabled'))

        if (focusable.length === 0) { e.preventDefault(); return }

        const first = focusable[0]
        const last  = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isPreferencesOpen, closePreferences])

  // Restore focus when modal closes
  useEffect(() => {
    if (!isPreferencesOpen && triggerRef.current) {
      triggerRef.current.focus()
      triggerRef.current = null
    }
  }, [isPreferencesOpen])

  function handleSave() {
    savePreferences({ analytics: analyticsLocal })
  }

  return (
    <>
      {/* ── Banner ─────────────────────────────────────────── */}
      <div
        role="region"
        aria-label="Cookie consent"
        aria-live="polite"
        className={`cookie-banner${!hasDecided ? ' cookie-banner--visible' : ''}`}
      >
        <div className="cookie-banner__inner">
          <div className="cookie-banner__text">
            <p className="cookie-banner__title">We value your privacy</p>
            <p className="cookie-banner__copy">
              We use cookies to understand how visitors use our site, so we can improve
              the experience for the girls and families we serve.{' '}
              <Link to="/privacy">Read our Privacy Policy</Link>
            </p>
          </div>
          <div className="cookie-banner__actions">
            <button
              type="button"
              className="cookie-banner__manage"
              onClick={openPreferences}
            >
              Manage Preferences
            </button>
            <button
              type="button"
              className="btn btn-outline-blue"
              onClick={declineAll}
            >
              Decline
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={acceptAll}
            >
              Accept All
            </button>
          </div>
        </div>
      </div>

      {/* ── Preferences Modal ──────────────────────────────── */}
      {isPreferencesOpen && (
        <>
          <div
            className="cookie-modal__backdrop"
            onClick={closePreferences}
            aria-hidden="true"
          />
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-modal-title"
            className="cookie-modal"
            tabIndex={-1}
          >
            <div className="cookie-modal__header">
              <h2 id="cookie-modal-title">Cookie Preferences</h2>
              <button
                type="button"
                className="cookie-modal__close"
                aria-label="Close cookie preferences"
                onClick={closePreferences}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="cookie-modal__body">
              {/* Necessary — always on */}
              <div className="cookie-modal__category">
                <div className="cookie-modal__category-info">
                  <span className="cookie-modal__category-name">Necessary</span>
                  <p className="cookie-modal__category-desc">
                    Required for the site to work. Includes your login session (set by the
                    server), anti-forgery security tokens, multi-factor auth state, and this
                    consent record. These cannot be disabled.
                  </p>
                </div>
                <span className="cookie-modal__always-on" aria-label="Always active">
                  Always on
                </span>
              </div>

              {/* Analytics — user-controlled */}
              <div className="cookie-modal__category">
                <div className="cookie-modal__category-info">
                  <span className="cookie-modal__category-name">Analytics</span>
                  <p className="cookie-modal__category-desc">
                    Helps us understand how visitors use the site so we can improve the
                    experience for the girls and families we serve.
                  </p>
                </div>
                <label
                  className="cookie-modal__toggle"
                  aria-label="Analytics cookies"
                >
                  <input
                    type="checkbox"
                    checked={analyticsLocal}
                    onChange={e => setAnalyticsLocal(e.target.checked)}
                  />
                  <span className="cookie-modal__toggle-track" aria-hidden="true" />
                </label>
              </div>
            </div>

            <div className="cookie-modal__footer">
              <button
                type="button"
                className="btn btn-outline-blue"
                onClick={closePreferences}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
