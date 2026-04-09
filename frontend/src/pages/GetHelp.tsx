import calmSupport from '../assets/hearthands2.jpg'
import coastalLight from '../assets/therapy.png'
import { useScrollReveal } from '../hooks/useScrollReveal'

const HELP_EMAIL = 'info@luzdevida.org'
const HELP_SUBJECT = 'I need help'
const HELP_MAILTO = `mailto:${HELP_EMAIL}?subject=${encodeURIComponent(HELP_SUBJECT)}`

export default function GetHelp() {
  useScrollReveal()

  return (
    <>
      <section className="get-help-hero">
        <div className="container">
          <div className="get-help-hero__grid">
            <div className="get-help-hero__content">
              <span className="section-label">Get help</span>
              <h1>If you or someone you know is being harmed, reach out to us.</h1>
              <p>
                If you are facing abuse, neglect, exploitation, or another unsafe situation,
                email Luz De Vida at <a href={HELP_MAILTO}>{HELP_EMAIL}</a>. We will help
                you find help and direct you toward the safest resources we can.
              </p>
              <div className="get-help-hero__actions">
                <a href={HELP_MAILTO} className="btn btn-primary">
                  Email us for help
                </a>
              </div>
            </div>

            <div className="get-help-hero__image reveal delay-1">
              <img
                src={calmSupport}
                alt="Hands resting together in calm support"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="get-help-commitment">
        <div className="container">
          <div className="get-help-commitment__grid">
            <div className="get-help-commitment__copy reveal">
              <span className="section-label">Who we help</span>
              <h2>Our primary focus is abused girls and girl youth.</h2>
              <p>
                Luz De Vida exists primarily to support abused girls and girl youth who
                need safety, dignity, and a path toward healing.
              </p>
              <p>
                If you are reaching out for a boy, an adult, a family member, or anyone
                else outside our main scope, you are still welcome to contact us. We are
                happy to help direct people to more appropriate local resources whenever we can.
              </p>
            </div>

            <div className="get-help-highlights reveal delay-2">
              <article className="get-help-highlight-card">
                <h3>Reach out on your own behalf</h3>
                <p>
                  You can email us directly if you need guidance, support, or help finding
                  the next safe step.
                </p>
              </article>

              <article className="get-help-highlight-card">
                <h3>Reach out for someone else</h3>
                <p>
                  If you are a friend, caregiver, advocate, teacher, or neighbor trying to
                  help someone vulnerable, we want to hear from you too.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="get-help-contact">
        <div className="container">
          <div className="get-help-contact__card reveal">
            <div className="get-help-contact__copy">
              <span className="section-label">How to reach us</span>
              <h2>Email us and tell us what is happening.</h2>
              <p>
                Send a message to <a href={HELP_MAILTO}>{HELP_EMAIL}</a>. Share as much as
                you safely can about the situation, where the person is located, and what
                kind of help may be needed.
              </p>
              <p>
                We will listen carefully, help assess the situation, and do our best to
                connect you with appropriate support and next steps.
              </p>
              <a href={HELP_MAILTO} className="btn btn-sand">
                Contact Luz De Vida
              </a>
            </div>

            <div className="get-help-contact__image reveal delay-2">
              <img
                src={coastalLight}
                alt="Soft coastal light over the water in Costa Rica"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="get-help-safety">
        <div className="container">
          <div className="get-help-safety__inner reveal">
            <span className="section-label">Safety note</span>
            <h2>If someone is in immediate danger, contact local emergency services first.</h2>
            <p>
              Luz De Vida is a connection point for help, not a live crisis hotline. If
              there is an urgent threat to someone&apos;s safety, contact local emergency
              services right away and email us as soon as it is safe to do so.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}