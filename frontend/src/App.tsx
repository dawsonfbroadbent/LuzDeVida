import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import AdminLayout from './components/AdminLayout'
import Landing from './pages/Landing'
import About from './pages/About'
import Donate from './pages/Donate'
import CaseloadInventory from './pages/CaseloadInventory'
import ProcessRecording from './pages/ProcessRecording'

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/donate" element={<Donate />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="caseload" element={<CaseloadInventory />} />
            <Route path="caseload/:id" element={<CaseloadInventory />} />
            <Route path="caseload/new" element={<CaseloadInventory />} />
            <Route path="process-recordings" element={<ProcessRecording />} />
            <Route path="process-recordings/resident/:residentId" element={<ProcessRecording />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}
