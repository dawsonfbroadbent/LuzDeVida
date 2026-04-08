import React, { useState, useEffect } from 'react';
import '../styles/AdminDashboard.css';

interface AdminDashboardMetrics {
  active_residents_total: number;
  residents_by_safehouse: Array<{
    safehouse_id: number;
    safehouse_name: string;
    active_resident_count: number;
  }>;
  recent_donations_total: number;
  recent_donations_count: number;
  recent_donations: Array<{
    donation_id: number;
    donation_date: string;
    amount: number;
    donation_type: string;
    currency_code: string;
  }>;
  upcoming_case_conferences_count: number;
  upcoming_case_conferences: Array<{
    plan_id: number;
    case_conference_date: string;
    resident_id: number;
    plan_category: string;
    status: string;
  }>;
  progress_data: {
    avg_nutrition_score: number | null;
    avg_sleep_score: number | null;
    avg_energy_score: number | null;
    avg_general_health_score: number | null;
    health_records_count: number;
    medical_checkups_completed: number;
    psychological_checkups_completed: number;
  };
  safehouses_total: number;
  timestamp: string;
}

const API_BASE_URL = 'http://localhost:5289/api';

const fetchAdminDashboardMetrics = async (): Promise<AdminDashboardMetrics> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admindashboard/metrics`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data: AdminDashboardMetrics = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching admin dashboard metrics:', error);
    throw error;
  }
};

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showGirlsInCareTooltip, setShowGirlsInCareTooltip] = useState(false);

  useEffect(() => {
    loadDashboardMetrics();
  }, []);

  const loadDashboardMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      setError('Failed to load dashboard metrics');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return <div className="admin-dashboard loading">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="admin-dashboard error">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadDashboardMetrics} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return <div className="admin-dashboard">No data available</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p className="subtitle">Command Center for Daily Operations</p>
      </div>

      {/* Girls in Care OKR */}
      <div
        className="okr-card"
        onMouseEnter={() => setShowGirlsInCareTooltip(true)}
        onMouseLeave={() => setShowGirlsInCareTooltip(false)}
      >
        <div className="okr-content">
          <p className="okr-label">GIRLS IN CARE</p>
          <p className="okr-value">{metrics.active_residents_total}</p>
          <div className="okr-progress-bar">
            <div
              className="okr-progress-fill"
              style={{
                width: `${Math.min((metrics.active_residents_total / 50) * 100, 100)}%`,
                backgroundColor: '#4caf50',
              }}
            ></div>
          </div>
          <p className="okr-subtitle">Active residents across {metrics.safehouses_total} safehouses</p>
        </div>

        {showGirlsInCareTooltip && (
          <div className="okr-tooltip">
            <p className="tooltip-title">Distribution by Safehouse</p>
            <div className="tooltip-breakdown">
              {metrics.residents_by_safehouse.map((shell) => (
                <div key={shell.safehouse_id} className="tooltip-item">
                  <span className="tooltip-label">{shell.safehouse_name}</span>
                  <span className="tooltip-value">{shell.active_resident_count}</span>
                </div>
              ))}
            </div>
            <p className="tooltip-note">Total active residents currently in our care</p>
          </div>
        )}
      </div>

      {/* Key Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card residents-metric">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <p className="metric-label">Active Residents</p>
            <p className="metric-value">{metrics.active_residents_total}</p>
            <p className="metric-subtext">Across {metrics.safehouses_total} safehouses</p>
          </div>
        </div>

        <div className="metric-card donations-metric">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <p className="metric-label">Recent Donations (30 days)</p>
            <p className="metric-value">{formatCurrency(metrics.recent_donations_total)}</p>
            <p className="metric-subtext">{metrics.recent_donations_count} donations received</p>
          </div>
        </div>

        <div className="metric-card conferences-metric">
          <div className="metric-icon">📅</div>
          <div className="metric-content">
            <p className="metric-label">Upcoming Case Conferences</p>
            <p className="metric-value">{metrics.upcoming_case_conferences_count}</p>
            <p className="metric-subtext">Next 14 days</p>
          </div>
        </div>

        <div className="metric-card health-metric">
          <div className="metric-icon">❤️</div>
          <div className="metric-content">
            <p className="metric-label">Health Records</p>
            <p className="metric-value">{metrics.progress_data.health_records_count}</p>
            <p className="metric-subtext">Last 30 days</p>
          </div>
        </div>
      </div>

      {/* Residents by Safehouse */}
      <div className="dashboard-section">
        <h2>Residents by Safehouse</h2>
        <div className="residents-grid">
          {metrics.residents_by_safehouse.length > 0 ? (
            metrics.residents_by_safehouse.map((shell) => (
              <div key={shell.safehouse_id} className="safehouse-card">
                <h3>{shell.safehouse_name}</h3>
                <p className="resident-count">{shell.active_resident_count}</p>
                <p className="resident-label">Active Residents</p>
              </div>
            ))
          ) : (
            <p className="no-data">No safehouse data available</p>
          )}
        </div>
      </div>

      {/* Progress Data */}
      <div className="dashboard-section">
        <h2>Health & Wellness Progress (Last 30 Days)</h2>
        <div className="progress-grid">
          <div className="progress-card">
            <p className="progress-label">Avg Nutrition Score</p>
            <p className="progress-value">{metrics.progress_data.avg_nutrition_score ? (metrics.progress_data.avg_nutrition_score as number).toFixed(1) : 'N/A'}</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${metrics.progress_data.avg_nutrition_score ? Math.min((metrics.progress_data.avg_nutrition_score as number) * 10, 100) : 0}%` }}></div>
            </div>
          </div>

          <div className="progress-card">
            <p className="progress-label">Avg Sleep Score</p>
            <p className="progress-value">{metrics.progress_data.avg_sleep_score ? (metrics.progress_data.avg_sleep_score as number).toFixed(1) : 'N/A'}</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${metrics.progress_data.avg_sleep_score ? Math.min((metrics.progress_data.avg_sleep_score as number) * 10, 100) : 0}%` }}></div>
            </div>
          </div>

          <div className="progress-card">
            <p className="progress-label">Avg Energy Score</p>
            <p className="progress-value">{metrics.progress_data.avg_energy_score ? (metrics.progress_data.avg_energy_score as number).toFixed(1) : 'N/A'}</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${metrics.progress_data.avg_energy_score ? Math.min((metrics.progress_data.avg_energy_score as number) * 10, 100) : 0}%` }}></div>
            </div>
          </div>

          <div className="progress-card">
            <p className="progress-label">Avg General Health</p>
            <p className="progress-value">{metrics.progress_data.avg_general_health_score ? (metrics.progress_data.avg_general_health_score as number).toFixed(1) : 'N/A'}</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${metrics.progress_data.avg_general_health_score ? Math.min((metrics.progress_data.avg_general_health_score as number) * 10, 100) : 0}%` }}></div>
            </div>
          </div>
        </div>

        <div className="checkup-stats">
          <div className="checkup-stat">
            <span className="stat-icon">🏥</span>
            <p>{metrics.progress_data.medical_checkups_completed} Medical Checkups Completed</p>
          </div>
          <div className="checkup-stat">
            <span className="stat-icon">🧠</span>
            <p>{metrics.progress_data.psychological_checkups_completed} Psychological Checkups Completed</p>
          </div>
        </div>
      </div>

      {/* Recent Donations */}
      <div className="dashboard-section">
        <h2>Recent Donations (Last 30 Days)</h2>
        {metrics.recent_donations.length > 0 ? (
          <div className="donations-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Currency</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recent_donations.map((donation) => (
                  <tr key={donation.donation_id}>
                    <td>{formatDate(donation.donation_date)}</td>
                    <td>{donation.donation_type || 'N/A'}</td>
                    <td className="amount">{formatCurrency(donation.amount || 0)}</td>
                    <td>{donation.currency_code || 'USD'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">No donations in the last 30 days</p>
        )}
      </div>

      {/* Upcoming Case Conferences */}
      <div className="dashboard-section">
        <h2>Upcoming Case Conferences (Next 14 Days)</h2>
        {metrics.upcoming_case_conferences.length > 0 ? (
          <div className="conferences-list">
            {metrics.upcoming_case_conferences.map((conf) => (
              <div key={conf.plan_id} className="conference-item">
                <div className="conference-header">
                  <span className="date-badge">{formatDate(conf.case_conference_date)}</span>
                  <span className="status-badge" data-status={conf.status?.toLowerCase()}>
                    {conf.status || 'Pending'}
                  </span>
                </div>
                <div className="conference-details">
                  <p><strong>Category:</strong> {conf.plan_category || 'N/A'}</p>
                  <p><strong>Resident ID:</strong> {conf.resident_id}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No case conferences scheduled in the next 14 days</p>
        )}
      </div>

      <div className="refresh-info">
        <p>Last updated: {formatDate(metrics.timestamp)}</p>
        <button onClick={loadDashboardMetrics} className="refresh-btn">🔄 Refresh Data</button>
      </div>
    </div>
  );
};

export default AdminDashboard;
