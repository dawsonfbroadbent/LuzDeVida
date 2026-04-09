import { useState, useEffect } from 'react';
import '../styles/CookieConsent.css';

/**
 * Cookie Consent component for GDPR compliance.
 * Shows a notification to users about cookie usage on first visit.
 * User must consent before analytics and tracking cookies are set.
 * 
 * Cookie categories:
 * - Essential: Required for site to function (authentication)
 * - Analytics: Used to understand user behavior
 * - Marketing: Used for targeted advertisements (not used here)
 */
export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setIsVisible(true), 1000);
    } else {
      setConsentGiven(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookieConsent', 'all');
    localStorage.setItem('cookieConsent_timestamp', new Date().toISOString());
    setConsentGiven(true);
    setIsVisible(false);
    
    // Enable analytics cookies
    enableAnalyticsCookies();
  };

  const handleRejectAll = () => {
    localStorage.setItem('cookieConsent', 'essential-only');
    localStorage.setItem('cookieConsent_timestamp', new Date().toISOString());
    setConsentGiven(true);
    setIsVisible(false);
    
    // No additional cookies enabled
  };

  const handleAcceptEssentials = () => {
    localStorage.setItem('cookieConsent', 'essential-only');
    localStorage.setItem('cookieConsent_timestamp', new Date().toISOString());
    setConsentGiven(true);
    setIsVisible(false);
  };

  const enableAnalyticsCookies = () => {
    // In a real application, this would enable Google Analytics, Mixpanel, etc.
    console.log('Analytics cookies enabled');
    // Example: gtag('consent', 'update', { 'analytics_storage': 'granted' });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="cookie-consent-banner" role="alert" aria-live="polite">
      <div className="cookie-consent-content">
        <div className="cookie-consent-text">
          <h3>Cookie Preferences</h3>
          <p>
            We use cookies to enhance your experience and analyze our website traffic. 
            <a href="/privacy" className="cookie-link">Learn more about our cookie policy</a>
          </p>

          <div className="cookie-categories">
            <div className="cookie-category">
              <div className="category-header">
                <strong>Essential Cookies</strong>
                <span className="badge">Always Active</span>
              </div>
              <p className="category-description">
                Required for authentication, security, and basic site functionality. 
                These cannot be disabled.
              </p>
            </div>

            <div className="cookie-category">
              <div className="category-header">
                <strong>Analytics Cookies</strong>
                <span className="badge">Optional</span>
              </div>
              <p className="category-description">
                Help us understand how you use our site to improve your experience. 
                Your usage data is completely anonymized.
              </p>
            </div>
          </div>
        </div>

        <div className="cookie-consent-actions">
          <button 
            className="btn-secondary" 
            onClick={handleRejectAll}
            aria-label="Reject optional cookies"
          >
            Reject Optional
          </button>
          <button 
            className="btn-secondary" 
            onClick={handleAcceptEssentials}
            aria-label="Accept only essential cookies"
          >
            Accept Essential Only
          </button>
          <button 
            className="btn-primary" 
            onClick={handleAcceptAll}
            aria-label="Accept all cookies"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
