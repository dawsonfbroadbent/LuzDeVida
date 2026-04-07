import { Outlet } from 'react-router-dom'
import './AdminLayout.css'

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__header">
          <h2>Staff Portal</h2>
        </div>
        <nav className="admin-nav">
          <ul>
            <li><a href="/admin/dashboard">Dashboard</a></li>
            <li><a href="/admin/caseload">Caseload Inventory</a></li>
            <li><a href="/admin/process-recordings">Process Recordings</a></li>
            <li><a href="/admin/home-visits">Home Visits</a></li>
          </ul>
        </nav>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}
