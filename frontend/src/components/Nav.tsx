import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ADMIN_TABS, getAdminTabHref, normalizeAdminTab } from '../adminTabs'

export default function Nav() {
  const [scrolled, setScrolled]       = useState(false)
  const [menuOpen, setMenuOpen]       = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [adminMenuOpen, setAdminMenuOpen] = useState(false)
  const location                      = useLocation()
  const navigate                      = useNavigate()
  const isHome                        = location.pathname === '/'
  const { isAuthenticated, user, logout } = useAuth()
  const userMenuRef                   = useRef<HTMLDivElement>(null)
  const adminMenuRef                  = useRef<HTMLLIElement>(null)
  const isAdminRoute                  =
    location.pathname === '/admin' ||
    location.pathname.startsWith('/admin/') ||
    location.pathname === '/homevisitations'
  const activeAdminTab                = normalizeAdminTab(
    new URLSearchParams(location.search).get('tab')
  )

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setUserMenuOpen(false)
    setAdminMenuOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname, location.search])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Close header dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
      if (adminMenuRef.current && !adminMenuRef.current.contains(e.target as Node)) {
        setAdminMenuOpen(false)
      }
    }
    if (userMenuOpen || adminMenuOpen) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [adminMenuOpen, userMenuOpen])

  function handleLogout() {
    logout()
    setUserMenuOpen(false)
    navigate('/')
  }

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
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>
                About
              </Link>
            </li>
            <li>
              <Link to="/impact" className={location.pathname === '/impact' ? 'active' : ''}>
                Impact
              </Link>
            </li>
            <li className="nav__item nav__item--dropdown" ref={adminMenuRef}>
              <button
                type="button"
                className={`nav__menu-trigger${isAdminRoute ? ' active' : ''}`}
                onClick={() => setAdminMenuOpen((open) => !open)}
                aria-expanded={adminMenuOpen}
                aria-haspopup="menu"
              >
                <span>Admin</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M2 4l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {adminMenuOpen && (
                <div className="nav__admin-dropdown" role="menu" aria-label="Admin sections">
                  {ADMIN_TABS.map((tab) => (
                    <Link
                      key={tab.id}
                      to={getAdminTabHref(tab.id)}
                      className={`nav__admin-dropdown-item${
                        isAdminRoute && tab.id === activeAdminTab ? ' active' : ''
                      }`}
                      onClick={() => setAdminMenuOpen(false)}
                    >
                      <span className="nav__admin-dropdown-label">{tab.label}</span>
                      <span className="nav__admin-dropdown-copy">{tab.description}</span>
                    </Link>
                  ))}
                </div>
              )}
            </li>
            <li>
              <Link to="/donate" className="btn btn-primary nav__cta">
                Donate
              </Link>
            </li>
            <li className="nav__auth">
              {isAuthenticated && user ? (
                <div className="nav__user-menu" ref={userMenuRef}>
                  <button
                    className="nav__user-btn"
                    onClick={() => setUserMenuOpen(o => !o)}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <span className="nav__user-avatar">
                      {user.displayName.charAt(0).toUpperCase()}
                    </span>
                    <span className="nav__user-name">{user.displayName.split(' ')[0]}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {userMenuOpen && (
                    <div className="nav__dropdown">
                      <div className="nav__dropdown-header">
                        <span className="nav__dropdown-name">{user.displayName}</span>
                        <span className="nav__dropdown-role">{user.role}</span>
                      </div>
                      <button className="nav__dropdown-item nav__dropdown-item--danger" onClick={handleLogout}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`nav__login-link${location.pathname === '/login' ? ' active' : ''}`}
                >
                  Log In
                </Link>
              )}
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
        <Link to="/impact">Impact</Link>
        <div className="nav__mobile-group">
          <span className="nav__mobile-group-label">Admin</span>
          {ADMIN_TABS.map((tab) => (
            <Link key={tab.id} to={getAdminTabHref(tab.id)}>
              {tab.label}
            </Link>
          ))}
        </div>
        <Link to="/donate" className="btn btn-primary">
          Donate Now
        </Link>
        {isAuthenticated && user ? (
          <button
            className="nav__mobile-logout"
            onClick={() => { logout(); navigate('/') }}
          >
            Log Out ({user.displayName.split(' ')[0]})
          </button>
        ) : (
          <Link to="/login" className="nav__mobile-login">
            Log In
          </Link>
        )}
      </nav>
    </>
  )
}
