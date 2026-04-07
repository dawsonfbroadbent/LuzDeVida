import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/Landing.css'

export const Landing: React.FC = () => {
  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">🌟 Providing Hope Since 2015</div>
          <h1>Safe Homes. Second Chances. New Futures.</h1>
          <p className="hero-subtitle">
            Luz De Vida rescues and rehabilitates girls who are survivors of sexual abuse, human trafficking, and exploitation in Costa Rica. We provide shelter, counseling, education, and life skills to help them heal and build independent, dignified lives.
          </p>

          <div className="hero-ctas">
            <Link to="/donate" className="cta-button primary large">
              💝 Make a Donation
            </Link>
            <Link to="/about" className="cta-button secondary large">
              Learn Our Story
            </Link>
          </div>

          <p className="hero-footnote">✓ Transparent • ✓ 92% Program Funding • ✓ Registered NGO</p>
        </div>
      </section>

      {/* Key Stats Section */}
      <section className="key-stats">
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-large">145+</div>
            <div className="stat-text">Girls Served to Date</div>
            <div className="stat-note">Lives transformed through healing</div>
          </div>
          <div className="stat-card">
            <div className="stat-large">92%</div>
            <div className="stat-text">Reintegration Success Rate</div>
            <div className="stat-note">Successfully returned to families</div>
          </div>
          <div className="stat-card">
            <div className="stat-large">8</div>
            <div className="stat-text">Active Safehouses</div>
            <div className="stat-note">Across Costa Rica</div>
          </div>
          <div className="stat-card">
            <div className="stat-large">24/7</div>
            <div className="stat-text">Trained Staff Available</div>
            <div className="stat-note">Crisis support always on call</div>
          </div>
        </div>
      </section>

      {/* The Problem We're Solving */}
      <section className="problem-section">
        <div className="problem-content">
          <h2>The Crisis These Girls Face</h2>
          <p>
            In Costa Rica, thousands of girls face sexual exploitation, human trafficking, and abuse every year. Many come from impoverished communities, are not in school, and lack access to basic healthcare or protection. Without intervention, these girls face cycles of trauma, poverty, and continued exploitation.
          </p>
          <div className="problem-grid">
            <div className="problem-item">
              <span className="problem-icon">🚨</span>
              <p><strong>Sexual Abuse & Trafficking:</strong> Vulnerability to exploitation due to poverty and lack of protection</p>
            </div>
            <div className="problem-item">
              <span className="problem-icon">📉</span>
              <p><strong>Educational Barriers:</strong> Girls drop out of school due to trauma, poverty, or family circumstances</p>
            </div>
            <div className="problem-item">
              <span className="problem-icon">💔</span>
              <p><strong>Psychological Trauma:</strong> Deep emotional wounds from abuse requiring professional healing</p>
            </div>
            <div className="problem-item">
              <span className="problem-icon">🏚️</span>
              <p><strong>Lack of Safe Housing:</strong> Nowhere to go for immediate protection and secure environments</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Comprehensive Solution */}
      <section className="solution-section">
        <h2>Our Comprehensive Approach to Healing</h2>
        <p className="section-subtitle">We provide what these girls need most: safety, support, and sustainable pathways to independence.</p>

        <div className="solution-cards">
          <div className="solution-card">
            <div className="solution-number">1</div>
            <h3>🏠 Safe Housing</h3>
            <p>Secure, homelike environments where girls are protected 24/7. Our safehouses provide structure, safety, and the foundation for healing to begin.</p>
            <ul>
              <li>Maximum 15-20 girls per house</li>
              <li>Trained female staff as caregivers</li>
              <li>Medical staff on-site</li>
              <li>Safe, comfortable living spaces</li>
            </ul>
          </div>

          <div className="solution-card">
            <div className="solution-number">2</div>
            <h3>💬 Trauma-Informed Counseling</h3>
            <p>Professional psychological support to help girls process trauma, rebuild self-worth, and develop healthy coping mechanisms.</p>
            <ul>
              <li>Individual and group therapy</li>
              <li>Crisis counseling available 24/7</li>
              <li>Narrative therapy & healing techniques</li>
              <li>Family reconciliation support</li>
            </ul>
          </div>

          <div className="solution-card">
            <div className="solution-number">3</div>
            <h3>📚 Education & Skills Training</h3>
            <p>Catch-up academic programs and vocational training to ensure girls can complete school and develop marketable skills for employment.</p>
            <ul>
              <li>Tutoring and catch-up programs</li>
              <li>Support to continue formal schooling</li>
              <li>Vocational skills (sewing, cooking, etc.)</li>
              <li>Computer & business training</li>
            </ul>
          </div>

          <div className="solution-card">
            <div className="solution-number">4</div>
            <h3>❤️ Holistic Life Skills & Health</h3>
            <p>Comprehensive support for independence: health education, life skills, spiritual care, and ongoing mentorship.</p>
            <ul>
              <li>Health education & reproductive health</li>
              <li>Life skills (cooking, budgeting, etc.)</li>
              <li>Leadership and confidence building</li>
              <li>Ongoing mentorship post-reintegration</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2024 Impact Metrics */}
      <section className="impact-section">
        <h2>2024 Impact: How Your Support Transformed Lives</h2>

        <div className="impact-grid">
          <div className="impact-card">
            <div className="impact-icon">✅</div>
            <div className="impact-large">28</div>
            <div className="impact-title">Girls Reintegrated</div>
            <p>Successfully returned to safe family and community settings with ongoing support</p>
          </div>

          <div className="impact-card">
            <div className="impact-icon">🗣️</div>
            <div className="impact-large">420+</div>
            <div className="impact-title">Counseling Sessions</div>
            <p>Professional therapy and trauma support provided to girls in our care</p>
          </div>

          <div className="impact-card">
            <div className="impact-icon">📖</div>
            <div className="impact-large">89%</div>
            <div className="impact-title">Back in School</div>
            <p>Girls continuing educational development and building their futures</p>
          </div>

          <div className="impact-card">
            <div className="impact-icon">💊</div>
            <div className="impact-large">156</div>
            <div className="impact-title">Health Checkups</div>
            <p>Medical care, reproductive health, and wellness monitoring provided</p>
          </div>
        </div>
      </section>

      {/* Where Your Money Goes */}
      <section className="financial-transparency">
        <h2>Financial Transparency: Where Your Dollar Goes</h2>
        <p className="section-subtitle">We're committed to responsible stewardship of every donation.</p>

        <div className="budget-breakdown">
          <div className="budget-item primary">
            <div className="budget-percentage">65%</div>
            <div className="budget-label">Program Services</div>
              <p>Housing, food, counseling, education, medical care in Costa Rica</p>
            </div>
            <div className="budget-item secondary">
              <div className="budget-percentage">15%</div>
              <div className="budget-label">Administration</div>
              <p>Local staff, facility maintenance, Costa Rica operations</p>
            </div>
            <div className="budget-item accent">
              <div className="budget-percentage">20%</div>
              <div className="budget-label">Fundraising & Outreach</div>
              <p>Donor communications, community awareness in CR</p>
          </div>
        </div>

        <p className="transparency-note">Luz De Vida is a registered nonprofit organization in Costa Rica. Annual audits ensure full compliance and transparency.</p>
      </section>

      {/* How to Support */}
      <section className="support-section">
        <h2>How You Can Make a Difference</h2>

        <div className="support-cards">
          <div className="support-card donation-card">
            <div className="support-header">💝</div>
            <h3>Make a Donation</h3>
            <p>Your financial gifts provide meals, medical care, counseling, and education.</p>
            <div className="impact-example">
              <p><strong>Your impact:</strong></p>
              <ul>
                <li>₱500 = One week of meals for a girl</li>
                <li>₱2,000 = A month of counseling services</li>
                <li>₱5,000 = School supplies & uniforms</li>
                <li>₱10,000 = One month of comprehensive care</li>
              </ul>
            </div>
            <Link to="/donate" className="cta-button primary">
              Donate Securely
            </Link>
          </div>

          <div className="support-card volunteer-card">
            <div className="support-header">🤝</div>
            <h3>Share Your Skills</h3>
            <p>Volunteers bring expertise, hope, and human connection to our girls.</p>
            <div className="volunteer-roles">
              <p><strong>Opportunities:</strong></p>
              <ul>
                <li>Teaching classes (English, skills)</li>
                <li>Medical/health support</li>
                <li>Mental health professionals</li>
                <li>Administrative support</li>
                <li>Mentorship programs</li>
              </ul>
            </div>
            <button className="cta-button secondary">
              Learn About Volunteering
            </button>
          </div>

          <div className="support-card advocate-card">
            <div className="support-header">📢</div>
            <h3>Become an Advocate</h3>
            <p>Help us raise awareness and reach more potential supporters and donors.</p>
            <div className="advocate-ways">
              <p><strong>Ways to advocate:</strong></p>
              <ul>
                <li>Share our mission on social media</li>
                <li>Organize a fundraiser event</li>
                <li>Corporate partnership opportunities</li>
                <li>Refer donors and partners</li>
                <li>Campaign for policy change</li>
              </ul>
            </div>
            <button className="cta-button secondary">
              Become an Advocate
            </button>
          </div>
        </div>
      </section>

      {/* Impact Stories */}
      <section className="stories-section">
        <h2>Stories of Transformation</h2>
        <p className="section-subtitle">Every girl has a story. Here are just a few.</p>

        <div className="stories-grid">
          <div className="story-card">
            <div className="story-number">01</div>
            <h3>From Crisis to Hope</h3>
            <p>
              "When I arrived at the safehouse, I was broken and afraid. The staff showed me that I was worth protecting. After a year of counseling and education, I'm back in school and dreaming of becoming a teacher to help other girls."
            </p>
            <p className="story-credit">— Maria, Age 17</p>
          </div>

          <div className="story-card">
            <div className="story-number">02</div>
            <h3>Second Chances Work</h3>
            <p>
              "My family thought I was lost forever. Luz De Vida didn't just rescue me; they helped my whole family heal. Now I'm working as a seamstress and sending my younger siblings to school."
            </p>
            <p className="story-credit">— Ana, Age 19, Reintegrated</p>
          </div>

          <div className="story-card">
            <div className="story-number">03</div>
            <h3>Education Equals Opportunity</h3>
            <p>
              "I never thought I'd go to college. With Luz De Vida's academic support, I not only finished high school but earned a scholarship. I'm now studying nursing to come back and help."
            </p>
            <p className="story-credit">— Rosa, Age 20, College Student</p>
          </div>
        </div>

        <Link to="/impact" className="cta-button secondary large">
          Read More Impact Stories
        </Link>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <h2>Every Girl Deserves a Second Chance</h2>
        <p>
          With your support, we're building a Philippines where every girl—no matter her circumstances—has access to safety, healing, and the opportunity to build a better future.
        </p>
        <p className="cta-emphasis">Will you help us transform more lives?</p>

        <div className="final-cta-buttons">
          <Link to="/donate" className="cta-button primary large">
            💝 Donate Now
          </Link>
          <Link to="/about" className="cta-button secondary large">
            Learn More About Us
          </Link>
        </div>
      </section>
    </div>
  )
}
