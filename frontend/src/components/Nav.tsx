import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const isSolid = scrolled || !isHome

  return (
    <>
      <header className={`nav${isSolid ? ' nav--solid' : ''}`}>
        <div className="nav__container">
          <Link to="/" className="nav__logo">
            <svg
              className="nav__logo-icon"
              width="22"
              height="22"
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

          <ul className="nav__links">
            <li>
              <Link
                to="/"
                className={location.pathname === '/' ? 'active' : ''}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={location.pathname === '/about' ? 'active' : ''}
              >
                About
              </Link>
            </li>
            <li>
              <Link to="/donate" className="btn btn-primary nav__cta">
                Donate
              </Link>
            </li>
          </ul>

          <button
            className={`nav__hamburger${menuOpen ? ' is-open' : ''}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <nav className={`nav__mobile${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/donate" className="btn btn-primary">
          Donate Now
        </Link>
      </nav>
    </>
  )
}
