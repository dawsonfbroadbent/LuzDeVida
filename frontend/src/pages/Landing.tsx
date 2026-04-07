import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import lightbeach from '../assets/beachhearts.webp'
import handsTogether from '../assets/savingabuse.png'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { fetchPublicImpact } from '../api/publicImpact'

const FOUNDED_YEAR = 2018

/* ── Animated counter ─────────────────────────────────── */
interface StatProps {
  target: number
  suffix?: string
  label: string
  className?: string
}

function AnimatedStat({ target, suffix = '', label, className = '' }: StatProps) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.6 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    let startTime: number | null = null
    const duration = 1800

    const tick = (now: number) => {
      if (!startTime) startTime = now
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [started, target])

  return (
    <div className={`stat ${className}`.trim()} ref={ref}>
      <div className="stat__number">
        {count}
        {suffix}
      </div>
      <div className="stat__label">{label}</div>
    </div>
  )
}

/* ── Landing Page ─────────────────────────────────────── */
export default function Landing() {
  useScrollReveal()

  const [girlsSupported, setGirlsSupported] = useState(50)
  const [safehouses, setSafehouses] = useState(2)
  const yearsOfService = new Date().getFullYear() - FOUNDED_YEAR

  useEffect(() => {
    fetchPublicImpact()
      .then(d => {
        setGirlsSupported(d.okr.value)
        setSafehouses(d.highlights.safehousesInNetwork)
      })
      .catch(() => { /* keep fallback values */ })
  }, [])

  return (
    <>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="hero">
        <img
          src={lightbeach}
          alt=""
          className="hero__bg"
          aria-hidden="true"
          fetchPriority="high"
        />
        <div className="hero__overlay" aria-hidden="true" />

        <div className="hero__content">
          <p className="hero__eyebrow">
            <span aria-hidden="true" />
            Costa Rica Safehouses
            <span aria-hidden="true" />
          </p>
          <h1 className="hero__title">Luz De Vida</h1>
          <p className="hero__subtitle">
            Providing Safe Shelter for Girls Escaping Abuse
          </p>
          <div className="hero__actions">
            <Link to="/donate" className="btn btn-sand">
              Give Today
            </Link>
            <Link to="/about" className="btn btn-outline-white">
              How We Help
            </Link>
          </div>
        </div>

        <div className="hero__scroll" aria-hidden="true">
          <span>Scroll</span>
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
            <path
              d="M1 1L8 9L15 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      {/* ── Mission Strip ─────────────────────────────── */}
      <section className="mission-strip">
        <div className="container">
          <p className="mission-strip__text reveal">
            Luz De Vida exists to protect girls from abuse, exploitation, and
            trafficking by providing safe shelter, holistic care, and a future
            they can rebuild with dignity.
          </p>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────── */}
      <section className="stats-section" aria-label="Our impact">
        <div className="container">
          <div className="stats-grid">
            <AnimatedStat target={girlsSupported} label="Girls Supported" />
            <AnimatedStat target={yearsOfService} label="Years of Service" />
            <AnimatedStat
              target={safehouses}
              label="Safehouses in Costa Rica"
              className="stat--featured"
            />
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/impact" className="btn btn-outline-blue">
              See Our Impact
            </Link>
          </div>
        </div>
      </section>

      {/* ── How We Help ───────────────────────────────── */}
      <section className="how-section">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-label">What We Do</span>
            <h2>How We Restore Hope</h2>
            <p>
              Our work addresses the full spectrum of a girl's needs — from
              immediate safety to long-term flourishing.
            </p>
          </div>

          <div className="cards-grid">
            <div className="help-card reveal delay-1">
              <div className="help-card__icon" aria-hidden="true">
                <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                  <path
                    d="M17 3L3 14V31H13V21H21V31H31V14L17 3Z"
                    stroke="var(--blue)"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
              <h3>Safe Housing</h3>
              <p>
                We provide secure, loving homes where girls can heal away from
                harm — spaces of true refuge, belonging, and quiet restoration.
              </p>
            </div>

            <div className="help-card reveal delay-2">
              <div className="help-card__icon" aria-hidden="true">
                <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                  <path
                    d="M17 30C17 30 4 22 4 12.5C4 8.36 7.36 5 11.5 5C13.83 5 15.9 6.08 17 7.77C18.1 6.08 20.17 5 22.5 5C26.64 5 30 8.36 30 12.5C30 22 17 30 17 30Z"
                    stroke="var(--teal)"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
              <h3>Holistic Care</h3>
              <p>
                Trauma-informed counseling, medical support, and therapeutic
                programs that address mind, body, and spirit together.
              </p>
            </div>

            <div className="help-card reveal delay-3">
              <div className="help-card__icon" aria-hidden="true">
                <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                  <path
                    d="M17 4L6 10V19C6 25.08 10.92 30.6 17 32C23.08 30.6 28 25.08 28 19V10L17 4Z"
                    stroke="var(--sand)"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <path
                    d="M12.5 17.5L15.5 20.5L22 14"
                    stroke="var(--sand)"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3>Future Building</h3>
              <p>
                Education, life skills, and reintegration programs that give
                every girl the tools to build the life she deserves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Need ──────────────────────────────────── */}
      <section className="need-section" aria-label="The need we address">
        <div className="need-section__image">
          <img
            src={handsTogether}
            alt="Diverse hands joined together in community and solidarity"
          />
        </div>

        <div className="need-section__content">
          <span className="section-label">The Reality</span>
          <h2 className="reveal">When a Child Needs Safety Most</h2>
          <p className="reveal delay-1">
            Every year, thousands of girls across Latin America face
            exploitation, abuse, and trafficking. In Costa Rica, dedicated
            institutions provide refuge — but resources remain limited and the
            need continues to grow.
          </p>
          <p className="reveal delay-2">
            At Luz De Vida, we step into that gap. We offer not just shelter,
            but a structured path toward healing — backed by trained social
            workers, therapists, and an unwavering commitment to each girl's
            future.
          </p>
          <Link to="/about" className="btn btn-outline-blue reveal delay-3">
            Read Our Story
          </Link>
        </div>
      </section>

      {/* ── Donation CTA ──────────────────────────────── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-section__inner">
            <div className="section-header reveal">
              <span className="section-label">Make a Difference</span>
              <h2>Your Gift Changes Everything</h2>
              <p>
                Every donation goes directly to supporting girls in our care.
                Give today and help us keep the light on for those who need it most.
              </p>
            </div>
            <div className="cta-amounts">
              <Link to="/donate" className="cta-amount-btn">$25</Link>
              <Link to="/donate" className="cta-amount-btn">$50</Link>
              <Link to="/donate" className="cta-amount-btn">$100</Link>
              <Link to="/donate" className="cta-amount-btn">$250</Link>
              <Link to="/donate" className="cta-amount-btn">Other</Link>
            </div>
            <Link to="/donate" className="btn btn-primary nav__cta">
              Give Today
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
