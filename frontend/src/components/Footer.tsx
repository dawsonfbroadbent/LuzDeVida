import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link to="/" className="footer__brand-logo">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4.5" fill="currentColor" />
                <path
                  d="M12 2V4.5M12 19.5V22M2 12H4.5M19.5 12H22M4.93 4.93L6.64 6.64M17.36 17.36L19.07 19.07M19.07 4.93L17.36 6.64M6.64 17.36L4.93 19.07"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
              Luz De Vida
            </Link>
            <p>
              Restoring light to girls who need it most — through safe housing,
              holistic care, and hope for the future. Based in Costa Rica.
            </p>
            <Link to="/donate" className="btn btn-sand" style={{ fontSize: '11px' }}>
              Give Today
            </Link>
          </div>

          <div className="footer__col">
            <h4>Navigate</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/impact">Our Impact</Link></li>
              <li><Link to="/donate">Donate</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4>Connect</h4>
            <ul>
              <li>
                <a href="mailto:info@luzdevida.org">info@luzdevida.org</a>
              </li>
              <li>
                <p>Costa Rica</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} Luz De Vida. All rights reserved.</p>
          <p>A registered 501(c)(3) nonprofit organization.</p>
        </div>
      </div>
    </footer>
  )
}
