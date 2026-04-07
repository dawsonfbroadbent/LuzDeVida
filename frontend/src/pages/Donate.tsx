import React, { useState } from 'react'
import '../styles/Donate.css'

export const Donate: React.FC = () => {
  const [donationAmount, setDonationAmount] = useState<number | string>('')
  const [donationType, setDonationType] = useState('monetary')

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Integrate with payment processor
    alert('Donation feature will be implemented with payment processing.')
  }

  return (
    <div className="donate-page">
      <div className="donate-container">
        <div className="donate-header">
          <h1>Make a Donation</h1>
          <p>Your generosity transforms lives. Choose how you'd like to support Luz De Vida.</p>
        </div>

        <div className="donate-content">
          <div className="donation-options">
            <h2>Donation Type</h2>

            <div className="option-buttons">
              <label className={`option-label ${donationType === 'monetary' ? 'active' : ''}`}>
                <input
                  type="radio"
                  value="monetary"
                  checked={donationType === 'monetary'}
                  onChange={(e) => setDonationType(e.target.value)}
                />
                💳 Monetary Donation
              </label>

              <label className={`option-label ${donationType === 'inkind' ? 'active' : ''}`}>
                <input
                  type="radio"
                  value="inkind"
                  checked={donationType === 'inkind'}
                  onChange={(e) => setDonationType(e.target.value)}
                />
                📦 In-Kind Donation
              </label>

              <label className={`option-label ${donationType === 'volunteer' ? 'active' : ''}`}>
                <input
                  type="radio"
                  value="volunteer"
                  checked={donationType === 'volunteer'}
                  onChange={(e) => setDonationType(e.target.value)}
                />
                🤝 Volunteer Time
              </label>
            </div>
          </div>

          {donationType === 'monetary' && (
            <form onSubmit={handleDonate} className="donate-form">
              <h2>Monetary Donation</h2>

              <div className="amount-presets">
                {[500, 1000, 2500, 5000, 10000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    className={`preset-btn ${donationAmount === amount ? 'active' : ''}`}
                    onClick={() => setDonationAmount(amount)}
                  >
                    ₡{amount.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="form-group">
                <label>Custom Amount (Costa Rican Colones)</label>
                <div className="currency-input">
                  <span>₡</span>
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value ? parseInt(e.target.value) : '')}
                    placeholder="Enter amount"
                  />
                </div>
              </div>

              <button type="submit" className="donate-button">
                Proceed to Payment
              </button>
            </form>
          )}

          {donationType === 'inkind' && (
            <div className="inkind-section">
              <h2>In-Kind Donation</h2>
              <p>Thank you for considering an in-kind donation! We accept:</p>
              <ul>
                <li>School supplies and educational materials</li>
                <li>Clothing and hygiene products</li>
                <li>Food and nutritional items</li>
                <li>Medical supplies</li>
                <li>Furniture and household goods</li>
              </ul>
              <p>
                Please contact us at <strong>info@luzdevida.cr</strong> to arrange pickup or drop-off.
              </p>
            </div>
          )}

          {donationType === 'volunteer' && (
            <div className="volunteer-section">
              <h2>Volunteer Your Time</h2>
              <p>Help us in the following ways:</p>
              <ul>
                <li>Teaching English, Math, or Computer Skills</li>
                <li>Administrative and bookkeeping support</li>
                <li>Website and technology assistance</li>
                <li>Event planning and fundraising</li>
                <li>Professional consultations (legal, medical, etc.)</li>
              </ul>
              <p>
                Interested? Email us at <strong>volunteers@luzdevida.cr</strong>
              </p>
            </div>
          )}
        </div>

        <div className="impact-callout">
          <h3>Your Impact</h3>
          <div className="impact-examples">
            <div className="impact-item">
              <strong>₡5,000</strong> provides meals for 3 girls for one week
            </div>
            <div className="impact-item">
              <strong>₡15,000</strong> covers one month of counseling services
            </div>
            <div className="impact-item">
              <strong>₡50,000</strong> provides education and vocational training for one girl
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
