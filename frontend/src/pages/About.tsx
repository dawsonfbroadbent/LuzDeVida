import React from 'react'
import '../styles/About.css'

export const About: React.FC = () => {
  return (
    <div className="about">
      <section className="about-hero">
        <h1>About Luz De Vida</h1>
        <p>Mission-driven organization transforming lives through safe homes, education, and healing</p>
      </section>

      <section className="about-story">
        <h2>Our Story</h2>
        <p>
          Luz De Vida was founded with a single vision: to provide a safe refuge and pathway to healing for girls who are survivors of sexual abuse, human trafficking, and exploitation in Costa Rica.
        </p>
        <p>
          Inspired by the transformative work of organizations like Lighthouse Sanctuary, we established Luz De Vida as a locally-rooted nonprofit committed to protecting some of society's most vulnerable children while treating them with dignity and hope.
        </p>
      </section>

      <section className="about-values">
        <h2>Our Core Values</h2>

        <div className="values-grid">
          <div className="value-card">
            <h3>Safety First</h3>
            <p>
              Every girl's physical and emotional safety is our highest priority. We provide secure facilities and trained staff operating under strict child protection protocols.
            </p>
          </div>

          <div className="value-card">
            <h3>Dignity & Respect</h3>
            <p>
              We honor the dignity of each girl, treating trauma survivors with compassion and respect for their unique needs and autonomy.
            </p>
          </div>

          <div className="value-card">
            <h3>Hope & Healing</h3>
            <p>
              We believe in the resilience of these young women. Our goal is fostering genuine healing through trauma-informed care and professional support.
            </p>
          </div>

          <div className="value-card">
            <h3>Empowerment</h3>
            <p>
              We equip girls with education, skills, and confidence to reclaim their futures and reintegrate successfully into their communities.
            </p>
          </div>

          <div className="value-card">
            <h3>Transparency</h3>
            <p>
              We operate with accountability, sharing real data about our impact and how each dollar is invested in changing lives.
            </p>
          </div>

          <div className="value-card">
            <h3>Community</h3>
            <p>
              We work in partnership with families, local organizations, and donors to create lasting, sustainable change in the communities we serve.
            </p>
          </div>
        </div>
      </section>

      <section className="about-approach">
        <h2>Our Approach</h2>

        <div className="approach-timeline">
          <div className="timeline-item">
            <div className="timeline-marker">1</div>
            <h3>Intake & Safety</h3>
            <p>
              Girls arrive at our safehouses and are provided immediate safety, medical evaluation, and initial assessment.
            </p>
          </div>

          <div className="timeline-item">
            <div className="timeline-marker">2</div>
            <h3>Stabilization</h3>
            <p>
              Professional counselors work with each girl to process trauma, establish trust, and create personalized healing plans.
            </p>
          </div>

          <div className="timeline-item">
            <div className="timeline-marker">3</div>
            <h3>Development</h3>
            <p>
              Education, vocational training, and life skills programs help girls build confidence and independence.
            </p>
          </div>

          <div className="timeline-item">
            <div className="timeline-marker">4</div>
            <h3>Reintegration</h3>
            <p>
              With family support and follow-up monitoring, girls transition back to their communities with ongoing assistance and resources.
            </p>
          </div>
        </div>
      </section>

      <section className="about-team">
        <h2>Our Team</h2>
        <p>
          Luz De Vida is led by compassionate professionals with deep experience in social welfare, child protection, and trauma-informed care. Our multidisciplinary team includes social workers, counselors, educators, and medical professionals committed to serving without burnout and modeling the healing we seek for the girls in our care.
        </p>

        <div className="team-focus">
          <h3>We Focus On:</h3>
          <ul>
            <li>Professional, trained staff with strict child safeguarding protocols</li>
            <li>Trauma-informed approach across all interventions</li>
            <li>Regular supervision and staff well-being to prevent compassion fatigue</li>
            <li>Continuous learning and adaptation based on outcomes data</li>
          </ul>
        </div>
      </section>

      <section className="about-footprint">
        <h2>Our Footprint</h2>
        <p>
          Currently, Luz De Vida operates 8 safehouses across Luzon, Visayas, and Mindanao, serving girls aged 6-18 who have experienced abuse or trafficking.
        </p>

        <div className="footprint-regions">
          <div className="region">
            <strong>Luzon</strong>
            <p>4 Safehouses</p>
          </div>
          <div className="region">
            <strong>Visayas</strong>
            <p>2 Safehouses</p>
          </div>
          <div className="region">
            <strong>Mindanao</strong>
            <p>2 Safehouses</p>
          </div>
        </div>
      </section>

      <section className="about-partnership">
        <h2>Partnership & Accountability</h2>
        <p>
          Luz De Vida partners with:
        </p>
        <ul>
          <li>Philippine government agencies for licensing, compliance, and referrals</li>
          <li>Medical providers for health assessments and ongoing care</li>
          <li>Educational institutions for tutoring and formal enrollment</li>
          <li>Local and international NGOs for specialized services and best practice sharing</li>
          <li>Faith-based communities that share our values and provide volunteer support</li>
        </ul>
        <p>
          All staff undergo background checks, child protection training, and regular supervision. Our operations align with Philippine child welfare standards and international best practices in trauma-informed care.
        </p>
      </section>

      <section className="about-financials">
        <h2>Financial Accountability</h2>
        <p>
          We believe transparency in our finances strengthens donor trust and ensures accountability. Every donation is tracked and reported. We aim for at least 80% of revenue to go directly to program services, with administrative overhead kept lean without sacrificing quality.
        </p>
      </section>
    </div>
  )
}
