import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/Layout'
import { Landing } from './pages/Landing'
import { About } from './pages/About'
import { Login } from './pages/Login'
import { Donate } from './pages/Donate'
import { Dashboard } from './pages/Dashboard'
import { Impact } from './pages/Impact'
import Caseload from './pages/Caseload'
import ProcessRecording from './pages/ProcessRecording'
import HomeVisitation from './pages/HomeVisitation'
import Reports from './pages/Reports'
import Privacy from './pages/Privacy'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/caseload" element={<Caseload />} />
            <Route path="/sessions" element={<ProcessRecording />} />
            <Route path="/visits" element={<HomeVisitation />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/privacy" element={<Privacy />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  </React.StrictMode>,
)
