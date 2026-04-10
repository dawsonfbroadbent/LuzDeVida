import { useEffect } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import {
  ADMIN_TABS,
  getAdminTabHref,
  normalizeAdminTab,
  type AdminTabId,
} from '../adminTabs'
import AdminDashboard from './AdminDashboard'
import HomeVisitations from './HomeVisitations'
import CaseloadInventory from './CaseloadInventory'
import ProcessRecording from './ProcessRecording'
import DonorManagement from './DonorManagement'
import ReportsAndAnalytics from './ReportsAndAnalytics'
import { useAuth } from '../context/AuthContext'
import SocialMediaPerformance from './SocialMediaPerformance'
import '../styles/AdminWorkspace.css'
import '../styles/AdminDataSurfaces.css'

function renderTabContent(tabId: AdminTabId) {
  switch (tabId) {
    case 'dashboard':
      return <AdminDashboard embedded />
    case 'home-visitations':
      return <HomeVisitations embedded />
    case 'caseload-inventory':
      return <CaseloadInventory embedded />
    case 'process-recording':
      return <ProcessRecording embedded />
    case 'donor-management':
      return <DonorManagement embedded />
    case 'reports':
      return <ReportsAndAnalytics embedded />
    case 'social-media':
      return <SocialMediaPerformance embedded />
    default:
      return <AdminDashboard embedded />
  }
}

export default function AdminWorkspace() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = normalizeAdminTab(searchParams.get('tab'))
  const activeTabMeta = ADMIN_TABS.find((tab) => tab.id === activeTab) ?? ADMIN_TABS[0]
  const { authSession, isLoading } = useAuth()

  useEffect(() => {
    if (searchParams.get('tab') !== activeTab) {
      setSearchParams({ tab: activeTab }, { replace: true })
    }
  }, [activeTab, searchParams, setSearchParams])

  if (isLoading) return null

  if (!authSession?.isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!authSession.roles.includes('Admin')) {
    return (
      <div className="admin-workspace">
        <section className="admin-workspace__hero">
          <h1>Access Denied</h1>
          <p>Your account does not have admin privileges.</p>
        </section>
      </div>
    )
  }

  return (
    <div className="admin-workspace">
      <section className="admin-workspace__hero">
        <div className="admin-workspace__eyebrow">Administrative Operations</div>
        <div className="admin-workspace__hero-row">
          <div>
            <h1>Luz De Vida Admin</h1>
            <p className="admin-workspace__hero-copy">
              A unified workspace for case management, resident records, home
              visitations, donor stewardship, and operational reporting.
            </p>
          </div>
          <div className="admin-workspace__context-card">
            <span className="admin-workspace__context-label">Current Section</span>
            <strong>{activeTabMeta.label}</strong>
            <p>{activeTabMeta.description}</p>
          </div>
        </div>
      </section>

      <section className="admin-workspace__tabs-shell" aria-label="Admin sections">
        <div className="admin-workspace__tabs">
          {ADMIN_TABS.map((tab) => (
            <Link
              key={tab.id}
              to={getAdminTabHref(tab.id)}
              className={`admin-workspace__tab${
                tab.id === activeTab ? ' is-active' : ''
              }`}
            >
              <span className="admin-workspace__tab-label">{tab.label}</span>
              <span className="admin-workspace__tab-copy">{tab.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="admin-workspace__content">{renderTabContent(activeTab)}</section>
    </div>
  )
}
