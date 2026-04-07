import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import '../styles/Dashboard.css'

export const Dashboard: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="loading">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.username}!</h1>
        <p>Role: {user?.role}</p>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-card">
          <h2>Active Residents</h2>
          <div className="stat-large">45</div>
          <p>across 8 safehouses</p>
        </section>

        <section className="dashboard-card">
          <h2>Recent Donations</h2>
          <div className="stat-large">₡125,000</div>
          <p>this week</p>
        </section>

        <section className="dashboard-card">
          <h2>Upcoming Conferences</h2>
          <div className="stat-large">7</div>
          <p>scheduled</p>
        </section>

        <section className="dashboard-card">
          <h2>Average Progress</h2>
          <div className="stat-large">72%</div>
          <p>across interventions</p>
        </section>
      </div>

      <section className="dashboard-card full-width">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <button className="action-btn">+ New Resident</button>
          <button className="action-btn">+ Process Recording</button>
          <button className="action-btn">+ Donation Entry</button>
          <button className="action-btn">View Reports</button>
        </div>
      </section>

      <section className="dashboard-card full-width">
        <h2>Recent Activity</h2>
        <p>Dashboard fully coming soon with real-time data integration...</p>
      </section>
    </div>
  )
}
