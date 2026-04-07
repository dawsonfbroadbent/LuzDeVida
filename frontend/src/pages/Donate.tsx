import { useState } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'

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
  {
    q: 'Is my payment information secure?',
    a: 'Yes. All payments are processed with 256-bit SSL encryption via Stripe, the same payment infrastructure used by leading nonprofits and Fortune 500 companies worldwide.',
  },
  {
    q: 'Can I dedicate my gift in someone\'s honor?',
    a: 'Yes. You can include a dedication message with your gift. We will acknowledge your dedication in the email receipt and, if you choose, send a notification to the honoree.',
  },
]

/* ── Donate Page ─────────────────────────────────────────── */
export default function Donate() {
  useScrollReveal()

  const [frequency, setFrequency] = useState<Frequency>('once')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50)
  const [isCustom, setIsCustom] = useState(false)
  const [customValue, setCustomValue] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const amounts = frequency === 'once' ? ONCE_AMOUNTS : MONTHLY_AMOUNTS
  const impactText =
    selectedAmount && IMPACT[frequency][selectedAmount]
      ? IMPACT[frequency][selectedAmount]
      : 'Every dollar you give goes directly to supporting girls in our care.'

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
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

            {/* Right — Form */}
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
                      Your generosity means the world to us — and to the girls
                      whose lives you're helping to change.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate>
                    <h3>Your Information</h3>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="first-name">First Name</label>
                        <input
                          id="first-name"
                          type="text"
                          placeholder="Jane"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="last-name">Last Name</label>
                        <input
                          id="last-name"
                          type="text"
                          placeholder="Smith"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        id="email"
                        type="email"
                        placeholder="jane@example.com"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="dedication">
                        Dedication{' '}
                        <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '12px' }}>
                          (optional)
                        </span>
                      </label>
                      <input
                        id="dedication"
                        type="text"
                        placeholder="In honor of / In memory of..."
                      />
                    </div>

                    {/* Card info */}
                    <div style={{ marginBottom: '18px' }}>
                      <span className="card-field-label">Card Information</span>
                      <div className="card-field-group">
                        <input
                          type="text"
                          className="card-field-input"
                          placeholder="Card number"
                          maxLength={19}
                          inputMode="numeric"
                          autoComplete="cc-number"
                        />
                        <div className="card-field-row">
                          <input
                            type="text"
                            className="card-field-input"
                            placeholder="MM / YY"
                            maxLength={7}
                            autoComplete="cc-exp"
                          />
                          <input
                            type="text"
                            className="card-field-input"
                            placeholder="CVV"
                            maxLength={4}
                            autoComplete="cc-csc"
                          />
                        </div>
                      </div>
                    </div>

                    <label className="form-checkbox">
                      <input type="checkbox" defaultChecked />
                      <span>
                        Keep me updated on how my gift is making a difference.
                      </span>
                    </label>

                    <button type="submit" className="donate-submit-btn">
                      Complete Donation{' '}
                      {selectedAmount && !isCustom
                        ? `— $${selectedAmount}${frequency === 'monthly' ? '/mo' : ''}`
                        : customValue
                        ? `— $${customValue}`
                        : ''}
                    </button>

                    <div className="security-note">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M7 11V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      256-bit SSL encrypted · Powered by Stripe
                    </div>
                  </form>
                )}
              </div>
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
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="var(--blue)" strokeWidth="1.5"/>
                  <path d="M7 11V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7V11" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h4>Secure Payments</h4>
              <p>Bank-level 256-bit SSL encryption on every transaction.</p>
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
