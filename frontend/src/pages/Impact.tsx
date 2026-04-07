import React from 'react'
import '../styles/Impact.css'

export const Impact: React.FC = () => {
  return (
    <div className="impact-page">
      <section className="impact-hero">
        <h1>Our Impact</h1>
        <p>Measurable outcomes that tell the story of transformation</p>
      </section>

      <section className="impact-overview">
        <h2>2024 Impact Report</h2>

        <div className="impact-grid">
          <div className="impact-card highlight">
            <div className="icon">👧</div>
            <div className="number">145+</div>
            <div className="label">Girls Served (Cumulative)</div>
            <p className="detail">This includes girls currently in our care and those successfully reintegrated</p>
          </div>

          <div className="impact-card highlight">
            <div className="icon">✅</div>
            <div className="number">28</div>
            <div className="label">Successfully Reintegrated</div>
            <p className="detail">Girls who have transitioned back to their families or independent living</p>
          </div>

          <div className="impact-card highlight">
            <div className="icon">📚</div>
            <div className="number">89%</div>
            <div className="label">Continued in Education</div>
            <p className="detail">Girls remaining enrolled in school or vocational programs</p>
          </div>

          <div className="impact-card highlight">
            <div className="icon">💬</div>
            <div className="number">420</div>
            <div className="label">Counseling Sessions</div>
            <p className="detail">Individual and group sessions conducted with trained counselors</p>
          </div>

          <div className="impact-card">
            <div className="icon">🏥</div>
            <div className="number">156</div>
            <div className="label">Medical Checkups</div>
            <p className="detail">Health assessments and preventive care provided</p>
          </div>

          <div className="impact-card highlight">
            <div className="icon">🏠</div>
            <div className="number">8</div>
            <div className="label">Active Safehouses</div>
            <p className="detail">Strategic locations throughout Costa Rica</p>
          </div>
        </div>
      </section>

      <section className="impact-services">
        <h2>Services Provided</h2>

        <div className="services-breakdown">
          <div className="service-category">
            <h3>🏠 Caring (Shelter & Safety)</h3>
            <ul>
              <li>24/7 secure housing and supervision</li>
              <li>Basic needs: food, clothing, hygiene</li>
              <li>Safety protocols and incident response</li>
              <li>Average girls served: 45/month</li>
            </ul>
          </div>

          <div className="service-category">
            <h3>💝 Healing (Psychosocial Support)</h3>
            <ul>
              <li>Professional trauma-informed counseling</li>
              <li>Mental health assessments and referrals</li>
              <li>Peer support groups</li>
              <li>Medical and dental care coordination</li>
            </ul>
          </div>

          <div className="service-category">
            <h3>📖 Teaching (Education & Skills)</h3>
            <ul>
              <li>Remedial and catch-up education</li>
              <li>Vocational skills training</li>
              <li>Life skills workshops</li>
              <li>Computer and digital literacy</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="impact-outcomes">
        <h2>Resident Outcome Trends</h2>

        <div className="outcomes-grid">
          <div className="outcome-metric">
            <h4>Emotional Wellbeing Improvement</h4>
            <div className="metric-value">+67%</div>
            <p>Average improvement in emotional state assessments from intake to 6-month mark</p>
          </div>

          <div className="outcome-metric">
            <h4>Academic Progress</h4>
            <div className="metric-value">+42%</div>
            <p>Increase in average academic performance scores during residence</p>
          </div>

          <div className="outcome-metric">
            <h4>Health Score Improvement</h4>
            <div className="metric-value">+55%</div>
            <p>Average improvement in physical health and wellbeing metrics</p>
          </div>

          <div className="outcome-metric">
            <h4>Reintegration Success</h4>
            <div className="metric-value">92%</div>
            <p>Successful long-term reintegration (12+ months post-placement)</p>
          </div>
        </div>
      </section>

      <section className="impact-financial">
        <h2>Financial Transparency</h2>

        <div className="financial-allocation">
          <h3>Where Your Donation Goes (2024)</h3>

          <div className="allocation-chart">
            <div className="allocation-bar" style={{ width: '65%' }}>
              <span>Program Services: 65%</span>
            </div>
            <div className="allocation-bar" style={{ width: '15%', backgroundColor: '#f59e0b' }}>
              <span>Administrative: 15%</span>
            </div>
            <div className="allocation-bar" style={{ width: '20%', backgroundColor: '#10b981' }}>
              <span>Fundraising & Operations: 20%</span>
            </div>
          </div>

          <div className="cost-breakdown">
            <h4>Monthly Cost Per Girl</h4>
            <div className="cost-item">
              <span>Housing & Basic Needs</span>
              <strong>$180</strong>
            </div>
            <div className="cost-item">
              <span>Counseling & Healthcare</span>
              <strong>$120</strong>
            </div>
            <div className="cost-item">
              <span>Education & Vocational</span>
              <strong>$85</strong>
            </div>
            <div className="cost-item">
              <span>Support & Administration</span>
              <strong>$65</strong>
            </div>
            <div className="cost-item total">
              <span>Total Monthly Investment</span>
              <strong>$450 USD</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="impact-stories">
        <h2>Stories of Transformation</h2>
        <p>While we protect the privacy of the girls in our care, we sometimes share anonymized stories that illustrate the impact of our work:</p>

        <div className="stories-grid">
          <div className="story-card">
            <h4>From Crisis to Confidence</h4>
            <p>
              A 14-year-old girl arrived at our safehouse having experienced trafficking. After 18 months of counseling, education, and support, she was successfully reintegrated with her family and is now in secondary school with plans to become a teacher.
            </p>
            <span className="story-outcome">✓ Reintegrated • Continuing Education • Stable Family Contact</span>
          </div>

          <div className="story-card">
            <h4>Skills for Independence</h4>
            <p>
              A 16-year-old completed our vocational program in hospitality and is now employed at a resort near her home community with ongoing support from our staff. She sends part of her earnings to her mother.
            </p>
            <span className="story-outcome">✓ Employment Secured • Family Support • Independent Living</span>
          </div>

          <div className="story-card">
            <h4>Healing Through Education</h4>
            <p>
              A 12-year-old with severe trauma began our catch-up education program 8 months ago. She now reads at grade level and has gone from withdrawn to participating in peer support groups and helping younger girls adjust to the safehouse.
            </p>
            <span className="story-outcome">✓ Academic Progress • Peer Leadership • Emotional Growth</span>
          </div>
        </div>
      </section>

      <section className="impact-cta">
        <h2>Help Us Achieve More</h2>
        <p>These outcomes are only possible because of supporters like you. Help us expand our reach and deepen our impact.</p>
        <a href="/donate" className="cta-button primary large">
          Make a Donation Today
        </a>
      </section>
    </div>
  )
}
