import React from 'react'
import { Link, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Layout.css'

export const Layout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-brand">
            <span className="brand-icon">🌟</span>
            Luz De Vida
          </Link>

          <ul className="nav-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/impact">Impact</Link>
            </li>
            {isAuthenticated ? (
              <>
                <li>
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li className="dropdown">
                  <span className="dropdown-toggle">Staff Tools ▼</span>
                  <ul className="dropdown-menu">
                    <li><Link to="/caseload">Caseload Inventory</Link></li>
                    <li><Link to="/sessions">Counseling Sessions</Link></li>
                    <li><Link to="/visits">Home Visits</Link></li>
                    <li><Link to="/reports">Reports & Analytics</Link></li>
                  </ul>
                </li>
                <li className="user-menu">
                  <span className="username">{user?.username}</span>
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link to="/login" className="login-link">
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <h4>About Luz De Vida</h4>
            <p>Transforming lives through safe homes, education, and hope for girls in the Philippines.</p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <Link to="/impact">Our Impact</Link>
              </li>
              <li>
                <Link to="/privacy">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: info@luzdevida.cr</p>
            <p>Location: Costa Rica</p>
          </div>

          <div className="footer-section">
            <h4>Follow Us</h4>
            <div className="social-links">
              <a href="#" title="Facebook">
                f
              </a>
              <a href="#" title="Instagram">
                IG
              </a>
              <a href="#" title="Twitter">
                𝕏
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Luz De Vida. All rights reserved.</p>
          <p>
            Mission-driven nonprofit • Organization ID: CR-LDV-2026 | Based in Costa Rica
          </p>
        </div>
      </footer>
    </div>
  )
}
