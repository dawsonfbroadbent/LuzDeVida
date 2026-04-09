import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Nav from './components/Nav'
import Footer from './components/Footer'
import CookieConsent from './components/CookieConsent'
import Landing from './pages/Landing'
import About from './pages/About'
import Donate from './pages/Donate'
import Impact from './pages/Impact'
import AdminWorkspace from './pages/AdminWorkspace'
import Login from './pages/Login'
import PrivacyPolicy from './pages/PrivacyPolicy'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Nav />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/admin" element={<AdminWorkspace />} />
            <Route
              path="/admin/dashboard"
              element={<Navigate to="/admin?tab=dashboard" replace />}
            />
            <Route
              path="/homevisitations"
              element={<Navigate to="/admin?tab=home-visitations" replace />}
            />
            <Route
              path="/admin/caseload-inventory"
              element={<Navigate to="/admin?tab=caseload-inventory" replace />}
            />
            <Route
              path="/admin/process-recording"
              element={<Navigate to="/admin?tab=process-recording" replace />}
            />
            <Route
              path="/admin/donor-management"
              element={<Navigate to="/admin?tab=donor-management" replace />}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
          </Routes>
        </main>
        <Footer />
        <CookieConsent />
      </AuthProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
