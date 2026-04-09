import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useAuth } from '../context/AuthContext'
import { createDonation } from '../api/DonationAPI'

/* ── Types ──────────────────────────────────────────────── */
type Frequency = 'once' | 'monthly'

const ONCE_AMOUNTS = [25, 50, 100, 250, 500]
const MONTHLY_AMOUNTS = [25, 50, 100, 250]

const IMPACT: Record<Frequency, Record<number, string>> = {
  once: {
    25:  'Provides a week of nutritious meals for one girl in our care.',
    50:  'Funds a month of therapeutic counseling materials.',
    100: 'Supports safe housing for one girl for one week.',
    250: 'Provides emergency supplies for an entire safehouse.',
    500: "Sponsors one girl's comprehensive care for a full month.",
  },
  monthly: {
    25:  'Supplies school materials and learning resources year-round.',
    50:  'Funds continuous counseling support throughout the entire year.',
    100: 'Provides a consistent, safe home — every single month.',
    250: 'Sponsors a complete rehabilitation and reintegration program.',
  },
}

const FAQ_ITEMS = [
  {
    q: 'Is my donation tax-deductible?',
    a: 'Yes. Luz De Vida is a registered 501(c)(3) nonprofit organization. All donations are tax-deductible to the fullest extent permitted by law. You will receive a donation receipt via email.',
  },
  {
    q: 'How is my donation used?',
    a: '100% of your donation goes directly to program costs — housing, counseling, education, and care for girls in our safehouses. We are committed to radical transparency in how funds are used.',
  },
  {
    q: 'Can I set up a recurring monthly gift?',
    a: 'Absolutely. Monthly gifts are especially powerful because they allow us to plan ahead and provide consistent care. Simply select the "Monthly" option before completing your gift.',
  },
]

/* ── Donate Page ─────────────────────────────────────────── */
export default function Donate() {
  useScrollReveal()

  const { isAuthenticated } = useAuth()

  const [frequency, setFrequency] = useState<Frequency>('once')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50)
  const [isCustom, setIsCustom] = useState(false)
  const [customValue, setCustomValue] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const amounts = frequency === 'once' ? ONCE_AMOUNTS : MONTHLY_AMOUNTS
  const impactText =
    selectedAmount && IMPACT[frequency][selectedAmount]
      ? IMPACT[frequency][selectedAmount]
      : 'Every dollar you give goes directly to supporting girls in our care.'

  const finalAmount = isCustom ? parseFloat(customValue) : (selectedAmount ?? 0)

  const handleFrequency = (f: Frequency) => {
    setFrequency(f)
    setSelectedAmount(50)
    setIsCustom(false)
    setCustomValue('')
  }

  const handleAmount = (amount: number) => {
    setSelectedAmount(amount)
    setIsCustom(false)
    setCustomValue('')
  }

  const handleCustom = () => {
    setIsCustom(true)
    setSelectedAmount(null)
  }

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setSubmitError(null)

    if (!finalAmount || finalAmount <= 0) {
      setSubmitError('Please enter a valid donation amount.')
      return
    }

    setIsSubmitting(true)
    try {
      await createDonation(
        {
          amount: finalAmount,
          isRecurring: frequency === 'monthly',
        },
      )
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* ── Hero ──────────────────────────────────────── */}
      <section className="donate-hero">
        <div className="container">
          <span className="section-label" style={{ justifyContent: 'center' }}>
            Support Our Mission
          </span>
          <h1>Give with Purpose</h1>
          <p>
            Every gift — no matter the size — goes directly to a girl in our
            care. Thank you for being part of her story.
          </p>
        </div>
      </section>

      {/* ── Main Donation Section ─────────────────────── */}
      <section className="donate-main">
        <div className="container">
          <div className="donate-layout">

            {/* Left — Amount picker */}
            <div>
              <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '20px' }}>
                Choose Your Gift
              </h3>

              {/* Frequency toggle */}
              <div className="frequency-toggle" role="group" aria-label="Donation frequency">
                <button
                  className={`frequency-btn${frequency === 'once' ? ' active' : ''}`}
                  onClick={() => handleFrequency('once')}
                >
                  One-time
                </button>
                <button
                  className={`frequency-btn${frequency === 'monthly' ? ' active' : ''}`}
                  onClick={() => handleFrequency('monthly')}
                >
                  Monthly
                </button>
              </div>

              {/* Amount grid */}
              <fieldset className="amounts-fieldset">
                <legend className="sr-only">Select donation amount</legend>
                <div className="amounts-grid">
                  {amounts.map((amt) => (
                    <label
                      key={amt}
                      className={`amount-label${selectedAmount === amt && !isCustom ? ' is-selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="amount"
                        value={amt}
                        checked={selectedAmount === amt && !isCustom}
                        onChange={() => handleAmount(amt)}
                        className="sr-only"
                      />
                      <div className="amount-card">
                        <span className="amount-card__value">${amt}</span>
                        <span className="amount-card__freq">
                          {frequency === 'monthly' ? '/mo' : 'one-time'}
                        </span>
                      </div>
                    </label>
                  ))}
                  <label className={`amount-label${isCustom ? ' is-selected' : ''}`}>
                    <input
                      type="radio"
                      name="amount"
                      value="custom"
                      checked={isCustom}
                      onChange={handleCustom}
                      className="sr-only"
                    />
                    <div className="amount-card">
                      <span className="amount-card__value">Other</span>
                      <span className="amount-card__freq">custom</span>
                    </div>
                  </label>
                </div>
              </fieldset>

              {/* Custom amount input */}
              {isCustom && (
                <div className="custom-amount-wrap">
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter your amount ($)"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    className="custom-amount-input"
                    autoFocus
                  />
                </div>
              )}

              {/* Impact display */}
              <div className="impact-display">
                <div className="impact-display__icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 21C12 21 3 15 3 8.5C3 6.01 5.01 4 7.5 4C9.09 4 10.48 4.84 11.25 6.1L12 7.2L12.75 6.1C13.52 4.84 14.91 4 16.5 4C18.99 4 21 6.01 21 8.5C21 15 12 21 12 21Z"
                      fill="var(--blue)"
                      opacity="0.18"
                    />
                    <path
                      d="M12 21C12 21 3 15 3 8.5C3 6.01 5.01 4 7.5 4C9.09 4 10.48 4.84 11.25 6.1L12 7.2L12.75 6.1C13.52 4.84 14.91 4 16.5 4C18.99 4 21 6.01 21 8.5C21 15 12 21 12 21Z"
                      stroke="var(--blue)"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="impact-display__text">
                  <strong>Your gift provides</strong>
                  {impactText}
                </div>
              </div>

              {/* Trust blurb */}
              <p style={{ fontSize: '13px', color: 'var(--text-light)', lineHeight: 1.6, marginTop: '8px' }}>
                100% of your donation supports girls in our care. Luz De Vida is a
                registered 501(c)(3) nonprofit.
              </p>
            </div>

            {/* Right — Form or Auth Gate */}
            <div>
              <div className="donate-form-card">
                {submitted ? (
                  <div className="donate-success">
                    <div className="donate-success__icon" aria-hidden="true">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 13L9 17L19 7"
                          stroke="var(--blue)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h3>Thank You!</h3>
                    <p>
                      Your donation has been recorded. You'll receive an update by email
                      once we've allocated your gift and can share its impact.
                    </p>
                  </div>
                ) : !isAuthenticated ? (
                  /* ── Auth Gate ── */
                  <div className="donate-auth-gate">
                    <div className="donate-auth-gate__icon" aria-hidden="true">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z"
                          stroke="var(--blue)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M4 20C4 17.33 7.58 15 12 15C13.12 15 14.18 15.17 15.14 15.47"
                          stroke="var(--blue)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <rect x="14" y="15" width="7" height="6" rx="1.5" stroke="var(--blue)" strokeWidth="1.5"/>
                        <path d="M16 15V13.5C16 12.67 16.67 12 17.5 12C18.33 12 19 12.67 19 13.5V15" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>

                    <h3>Sign in to complete your gift</h3>

                    <p className="donate-auth-gate__reason">
                      To donate, please log in or create a free supporter account. This
                      allows us to:
                    </p>

                    <ul className="donate-auth-gate__benefits">
                      <li>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M5 13L9 17L19 7" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Track your donation and link it to real outcomes
                      </li>
                      <li>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M5 13L9 17L19 7" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Inform you of how your gift was allocated
                      </li>
                      <li>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M5 13L9 17L19 7" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Share impact updates on the girls your generosity supports
                      </li>
                      <li>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M5 13L9 17L19 7" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Send your tax-deductible donation receipt
                      </li>
                    </ul>

                    <div className="donate-auth-gate__actions">
                      <Link to="/login?tab=login&redirect=/donate" className="donate-submit-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                        Log In
                      </Link>
                      <Link to="/login?tab=register&redirect=/donate" className="donate-auth-gate__register-link">
                        Create a free supporter account
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* ── Donation Form ── */
                  <form onSubmit={handleSubmit} noValidate>
                    <h3>Complete Your Gift</h3>

                    {submitError && (
                      <p className="donate-error-msg" role="alert">{submitError}</p>
                    )}

                    <button
                      type="submit"
                      className="donate-submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? 'Processing…'
                        : `Complete Donation${
                            finalAmount > 0
                              ? ` — $${finalAmount}${frequency === 'monthly' ? '/mo' : ''}`
                              : ''
                          }`}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── In-Kind Donation ──────────────────────────── */}
      <section className="inkind-section">
        <div className="container">
          <div className="inkind-card">
            <div className="inkind-card__body">
              <span className="section-label" style={{ marginBottom: '8px' }}>Another Way to Help</span>
              <h3>In-Kind Donations</h3>
              <p>
                Not every gift comes in the form of money — and we are more than
                happy to receive in-kind donations that directly support the girls
                in our care. Whether it's clothing, school supplies, hygiene
                products, books, or professional services, every contribution makes
                a tangible difference in the lives of those we serve. If you'd like
                to give an in-kind donation, we'd love to hear from you. Simply
                reach out to us by email and we'll work with you to make sure your
                gift gets where it's needed most.
              </p>
              <a
                href="mailto:info@luzdevida.org?subject=In-Kind%20Donation%20Inquiry"
                className="inkind-email-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                info@luzdevida.org
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Signals ─────────────────────────────── */}
      <section className="trust-section">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-item reveal delay-1">
              <div className="trust-item__icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3L4 7V13C4 17.42 7.5 21.56 12 23C16.5 21.56 20 17.42 20 13V7L12 3Z" stroke="var(--blue)" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M9 12L11.5 14.5L16 10" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h4>Registered Nonprofit</h4>
              <p>Luz De Vida is a recognized 501(c)(3) — your gift is tax-deductible.</p>
            </div>

            <div className="trust-item reveal delay-2">
              <div className="trust-item__icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3C12 3 4 6 4 12V17L12 21L20 17V12C20 6 12 3 12 3Z" stroke="var(--blue)" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M9 12L11 14L15 10" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h4>Full Transparency</h4>
              <p>We report back on every allocation — you'll know exactly how your gift was put to work.</p>
            </div>

            <div className="trust-item reveal delay-3">
              <div className="trust-item__icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 21C12 21 3 15 3 8.5C3 6.01 5.01 4 7.5 4C9.09 4 10.48 4.84 11.25 6.1L12 7.2L12.75 6.1C13.52 4.84 14.91 4 16.5 4C18.99 4 21 6.01 21 8.5C21 15 12 21 12 21Z" stroke="var(--blue)" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>
              <h4>Direct Impact</h4>
              <p>100% of donations go directly to programming and resident care.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────── */}
      <section className="faq-section">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-label">Common Questions</span>
            <h2>Frequently Asked</h2>
          </div>

          <div className="faq-list" role="list">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className={`faq-item${openFaq === i ? ' is-open' : ''}`}
                role="listitem"
              >
                <button
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  {item.q}
                  <span className="faq-icon" aria-hidden="true">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M5 1V9M1 5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </span>
                </button>
                <div className="faq-answer" aria-hidden={openFaq !== i}>
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
