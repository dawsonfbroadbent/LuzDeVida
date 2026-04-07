import { Link } from 'react-router-dom'
import handsTogether from '../assets/handstogether.png'
import { useScrollReveal } from '../hooks/useScrollReveal'

export default function About() {
  useScrollReveal()

  return (
    <>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero__inner">
            <span className="section-label" style={{ justifyContent: 'center' }}>
              Our Story
            </span>
            <h1>We Are Luz De Vida</h1>
            <p>
              A Costa Rican nonprofit dedicated to restoring safety, dignity, and
              hope to girls who have survived the unimaginable.
            </p>
          </div>
        </div>
      </section>

      {/* ── Hands image strip ─────────────────────────── */}
      <div className="about-image-strip">
        <img
          src={handsTogether}
          alt="Community hands reaching together"
        />
        <div className="about-image-strip__overlay" aria-hidden="true" />
      </div>

      {/* ── Story ─────────────────────────────────────── */}
      <section className="story-section">
        <div className="container">
          <div className="story-grid">
            <blockquote className="story-pull-quote reveal">
              "We don't just provide a roof and a meal. We provide a reason to
              believe in tomorrow."
            </blockquote>

            <div className="story-body">
              <span className="section-label reveal">Born from a Calling</span>
              <p className="reveal delay-1">
                Luz De Vida began with a simple belief: that every girl,
                regardless of what she has experienced, deserves to grow up in
                safety and light. Founded in Costa Rica, we have spent nearly a
                decade building safe havens where girls who have survived the
                unimaginable can begin to heal, grow, and imagine a future.
              </p>
              <p className="reveal delay-2">
                Our work is rooted in Costa Rica's rich tradition of community
                care — a country whose very identity is shaped by values of
                peace, life, and dignity. In a landscape of extraordinary
                beauty, we create spaces where extraordinary transformation can
                happen.
              </p>
              <p className="reveal delay-3">
                We partner closely with Costa Rica's social welfare agencies,
                local churches, and international supporters to ensure that
                every girl in our care receives not just safety, but
                belonging — the profound knowledge that she is seen, valued,
                and worth fighting for.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────── */}
      <section className="values-section">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-label">What Guides Us</span>
            <h2>Our Core Values</h2>
            <p>
              Every decision we make flows from these three commitments to the
              girls we serve.
            </p>
          </div>

          <div className="values-grid">
            <div className="value-card reveal delay-1">
              <div
                className="value-card__accent"
                style={{ background: 'var(--blue)' }}
                aria-hidden="true"
              />
              <h3>Safety First</h3>
              <p>
                Every decision we make is grounded in the physical, emotional,
                and psychological safety of our residents. We operate with
                strict protocols, trauma-informed practices, and unwavering
                vigilance — because trust must be earned, not assumed.
              </p>
            </div>

            <div className="value-card reveal delay-2">
              <div
                className="value-card__accent"
                style={{ background: 'var(--teal)' }}
                aria-hidden="true"
              />
              <h3>Holistic Healing</h3>
              <p>
                We address the whole person — trauma, education, health,
                relationships — with evidence-based, culturally sensitive care.
                Healing is not a program; it is a relationship built over time
                with consistency and compassion.
              </p>
            </div>

            <div className="value-card reveal delay-3">
              <div
                className="value-card__accent"
                style={{ background: 'var(--sand)' }}
                aria-hidden="true"
              />
              <h3>Long-Term Transformation</h3>
              <p>
                Our goal is not just stability but lasting flourishing. We walk
                with girls from crisis to independence — celebrating milestones,
                supporting reintegration, and staying connected long after they
                leave our care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Approach ──────────────────────────────────── */}
      <section className="approach-section">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-label">How It Works</span>
            <h2>Our Approach</h2>
            <p>
              A structured, compassionate process designed to meet each girl
              exactly where she is.
            </p>
          </div>

          <div className="approach-steps">
            <div className="approach-step reveal delay-1">
              <span className="approach-step__num" aria-hidden="true">01</span>
              <div>
                <h4>Crisis Intake & Stabilization</h4>
                <p>
                  Girls arrive through referrals from government agencies,
                  churches, or community advocates. Our first priority is
                  physical safety, medical care, and emotional stabilization.
                </p>
              </div>
            </div>

            <div className="approach-step reveal delay-2">
              <span className="approach-step__num" aria-hidden="true">02</span>
              <div>
                <h4>Therapeutic Support</h4>
                <p>
                  Licensed social workers and counselors provide individual and
                  group therapy, trauma processing, and consistent emotional
                  support throughout each girl's time with us.
                </p>
              </div>
            </div>

            <div className="approach-step reveal delay-3">
              <span className="approach-step__num" aria-hidden="true">03</span>
              <div>
                <h4>Education & Skills Building</h4>
                <p>
                  We ensure every girl continues her education and develops
                  life skills — from financial literacy to vocational
                  training — equipping her for independence.
                </p>
              </div>
            </div>

            <div className="approach-step reveal delay-4">
              <span className="approach-step__num" aria-hidden="true">04</span>
              <div>
                <h4>Reintegration & Alumni Care</h4>
                <p>
                  When girls are ready to transition, we walk alongside them
                  through careful planning, ongoing mentorship, and a
                  community of support that never truly ends.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Location ──────────────────────────────────── */}
      <section className="location-section">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="reveal" style={{ textAlign: 'center' }}>
            <span className="section-label" style={{ justifyContent: 'center' }}>
              Where We Are
            </span>
            <h2>Rooted in Costa Rica</h2>
            <p>
              Our safehouses are situated in Costa Rica — a nation known for
              its commitment to environmental stewardship and human dignity.
              Within this context, we create homes that reflect the beauty and
              resilience of the land itself: spaces of peace where healing can
              take root.
            </p>
            <Link to="/donate" className="btn btn-sand reveal delay-2">
              Support Our Work
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
