import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import About from './pages/About'
import Donate from './pages/Donate'
import Impact from './pages/Impact'
import HomeVisitations from './pages/HomeVisitations'
import CaseloadInventory from './pages/CaseloadInventory'
import ProcessRecording from './pages/ProcessRecording'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Login'

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
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/home-visitations" element={<HomeVisitations />} />
          <Route path="/admin/caseload-inventory" element={<CaseloadInventory />} />
          <Route path="/admin/process-recording" element={<ProcessRecording />} />
          </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  )
}
