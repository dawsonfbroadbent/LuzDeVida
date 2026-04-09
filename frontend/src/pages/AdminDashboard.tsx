import React, { useState, useEffect } from 'react';
import '../styles/AdminDashboard.css';

interface AdminDashboardProps {
  embedded?: boolean;
}

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
  active_intervention_plans_count: number;
  active_intervention_plans: Array<{
    plan_id: number;
    resident_id: number;
    plan_category: string;
    start_date: string;
    target_completion_date: string;
    status: string;
  }>;
  home_visitations_this_week_count: number;
  home_visitations_this_week: Array<{
    visitation_id: number;
    resident_id: number;
    visitation_date: string;
    status: string;
    notes: string;
  }>;
  case_management_progress: {
    avg_length_of_stay_days: number;
    resident_transition_rate: number;
    family_reunification_rate: number;
    case_closure_rate: number;
  };
  intervention_plan_metrics: {
    avg_days_to_complete: number;
    completion_rate: number;
    most_common_category: string;
    success_rate_by_type: Array<{ category: string; success_rate: number }>;
  };
  engagement_support: {
    partner_engagement_frequency_avg: number;
    in_kind_donation_trend: number;
    donor_retention_rate: number;
    avg_volunteer_hours_per_month: number;
  };
  recommendations: Array<{
    id: string;
    severity: string;
    title: string;
    message: string;
    metric: string;
  }>;
  safehouses_total: number;
  timestamp: string;
}

const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://luzdevidabackend-aegdcxe9grhucsfm.francecentral-01.azurewebsites.net/api'
  : 'http://localhost:5289/api';

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

const AdminDashboard: React.FC<AdminDashboardProps> = ({ embedded = false }) => {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showGirlsInCareTooltip, setShowGirlsInCareTooltip] = useState(false);
  const [expandedMetrics, setExpandedMetrics] = useState<Set<string>>(new Set());
  const [showThresholdGuide, setShowThresholdGuide] = useState(false);
  const [showCaseManagementGuide, setShowCaseManagementGuide] = useState(false);
  const [showInterventionGuide, setShowInterventionGuide] = useState(false);
  const [showEngagementGuide, setShowEngagementGuide] = useState(false);
  const pageClassName = `admin-dashboard${embedded ? ' admin-dashboard--embedded' : ''}`;

  const toggleMetricExpanded = (metricId: string) => {
    setExpandedMetrics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(metricId)) {
        newSet.delete(metricId);
      } else {
        newSet.add(metricId);
      }
      return newSet;
    });
  };

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
    return <div className={`${pageClassName} loading`}>Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className={`${pageClassName} error`}>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadDashboardMetrics} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return <div className={pageClassName}>No data available</div>;
  }

  return (
    <div className={pageClassName}>
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

      {/* Recommendations Section */}
      {metrics.recommendations.length > 0 && (
        <div className="dashboard-section" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0 }}>Recommendations & Alerts</h2>
            <button
              onClick={() => setShowThresholdGuide(!showThresholdGuide)}
              style={{
                background: 'var(--teal)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                fontSize: '1.2rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s var(--ease)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--teal-dark)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--teal)')}
              title="View threshold guide"
            >
              ?
            </button>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1rem'
          }}>
            {metrics.recommendations.map((rec) => (
              <div 
                key={rec.id}
                style={{
                  padding: '1.5rem',
                  borderRadius: '4px',
                  borderLeft: rec.severity === 'critical' ? '4px solid #d32f2f' : '4px solid #ff9800',
                  background: rec.severity === 'critical' ? '#ffebee' : '#fff3e0',
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  marginBottom: '0.75rem'
                }}>
                  <span style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: rec.severity === 'critical' ? '#8f1d1d' : '#8a4b10',
                    background: rec.severity === 'critical' ? '#ffd9d9' : '#ffe7c2'
                  }}>
                    {rec.severity === 'critical' ? 'Critical' : 'Monitor'}
                  </span>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                    {rec.title}
                  </h3>
                </div>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.9rem', 
                  color: 'var(--text-mid)',
                  lineHeight: '1.5'
                }}>
                  {rec.message}
                </p>
              </div>
            ))}
          </div>

          {showThresholdGuide && (
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              background: 'var(--cream-dark)',
              borderRadius: '4px',
              border: '1px solid var(--cream-darker)',
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-dark)' }}>Threshold Guide</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <p style={{ fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--text-dark)' }}>Family Reunification Rate</p>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Threshold: Less than 40%</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>Alerts if family reintegration rate is below target - prioritize family engagement</p>
                </div>

                <div>
                  <p style={{ fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--text-dark)' }}>In-Kind Donations Trend</p>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Threshold: Down 20% or more</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>Alerts when in-kind donations decline significantly month-over-month</p>
                </div>

                <div>
                  <p style={{ fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--text-dark)' }}>Case Closure Rate</p>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Threshold: Less than 15%</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>Alerts if cases aren't closing at expected rate - review intervention effectiveness</p>
                </div>

                <div>
                  <p style={{ fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--text-dark)' }}>Average Length of Stay</p>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Threshold: More than 730 days (2 years)</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>Alerts when residents stay significantly longer than expected</p>
                </div>

                <div>
                  <p style={{ fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--text-dark)' }}>Intervention Completion Rate</p>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Threshold: Less than 25%</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>Alerts if intervention plans aren't being completed - investigate bottlenecks</p>
                </div>

                <div>
                  <p style={{ fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--text-dark)' }}>Partner Engagement</p>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Threshold: Less than 5 times per month</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>Alerts when partners aren't engaging regularly - reconnect and strengthen relationships</p>
                </div>

                <div>
                  <p style={{ fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--text-dark)' }}>Donor Retention Rate</p>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Threshold: Less than 60%</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>Alerts when repeat donor rate is low - develop retention strategies</p>
                </div>

                <div>
                  <p style={{ fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--text-dark)' }}>Volunteer Hours</p>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Threshold: Less than 40 hours per month</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>Alerts when volunteer engagement is low - recruit or re-engage volunteers</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Key Metrics Dropdowns */}
      <div className="metrics-grid">
        {/* Active Residents Dropdown */}
        <div className="metric-card residents-metric">
          <div 
            className="metric-header"
            onClick={() => toggleMetricExpanded('residents')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
              <div className="metric-icon metric-icon--residents">RS</div>
              <div className="metric-content">
                <p className="metric-label">Active Residents</p>
                <p className="metric-value">{metrics.active_residents_total}</p>
              </div>
            </div>
            <span className={`metric-chevron ${expandedMetrics.has('residents') ? 'expanded' : ''}`}>›</span>
          </div>
          {expandedMetrics.has('residents') && (
            <div className="metric-details">
              <p className="detail-text"><strong>Across:</strong> {metrics.safehouses_total} safehouses</p>
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--cream-darker)' }}>
                {metrics.residents_by_safehouse.map((shell) => (
                  <div key={shell.safehouse_id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>{shell.safehouse_name}:</span>
                    <strong>{shell.active_resident_count}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Donations Dropdown */}
        <div className="metric-card donations-metric">
          <div 
            className="metric-header"
            onClick={() => toggleMetricExpanded('donations')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
              <div className="metric-icon metric-icon--donations">DN</div>
              <div className="metric-content">
                <p className="metric-label">Recent Donations (30 days)</p>
                <p className="metric-value">{formatCurrency(metrics.recent_donations_total)}</p>
              </div>
            </div>
            <span className={`metric-chevron ${expandedMetrics.has('donations') ? 'expanded' : ''}`}>›</span>
          </div>
          {expandedMetrics.has('donations') && (
            <div className="metric-details">
              <p className="detail-text"><strong>{metrics.recent_donations_count}</strong> donations received</p>
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--cream-darker)' }}>
                {metrics.recent_donations.slice(0, 5).map((donation) => (
                  <div key={donation.donation_id} style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <div>{formatDate(donation.donation_date)} - {donation.donation_type}</div>
                    <div style={{ color: 'var(--text-light)' }}>{formatCurrency(donation.amount || 0)} {donation.currency_code}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Case Conferences Dropdown */}
        <div className="metric-card conferences-metric">
          <div 
            className="metric-header"
            onClick={() => toggleMetricExpanded('conferences')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
              <div className="metric-icon metric-icon--conferences">CC</div>
              <div className="metric-content">
                <p className="metric-label">Upcoming Case Conferences</p>
                <p className="metric-value">{metrics.upcoming_case_conferences_count}</p>
              </div>
            </div>
            <span className={`metric-chevron ${expandedMetrics.has('conferences') ? 'expanded' : ''}`}>›</span>
          </div>
          {expandedMetrics.has('conferences') && (
            <div className="metric-details">
              <p className="detail-text">Next 14 days</p>
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--cream-darker)' }}>
                {metrics.upcoming_case_conferences.slice(0, 5).map((conf) => (
                  <div key={conf.plan_id} style={{ marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                    <div>{formatDate(conf.case_conference_date)} - <strong>{conf.plan_category}</strong></div>
                    <div style={{ color: 'var(--text-light)' }}>Resident {conf.resident_id} • {conf.status}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Case Management Progress */}
      {metrics?.case_management_progress && (
        <div className="dashboard-section" style={{ cursor: 'pointer' }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: expandedMetrics.has('casemanagement') ? '1.5rem' : 0 }}
            onClick={() => toggleMetricExpanded('casemanagement')}
          >
            <h2 style={{ margin: 0 }}>Case Management Progress</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {expandedMetrics.has('casemanagement') && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowCaseManagementGuide(!showCaseManagementGuide); }}
                  style={{
                    background: 'var(--teal)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s var(--ease)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--teal-dark)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--teal)')}
                  title="View calculation guide"
                >
                  ?
                </button>
              )}
              <span className={`metric-chevron ${expandedMetrics.has('casemanagement') ? 'expanded' : ''}`} style={{ fontSize: '1.5rem' }}>›</span>
            </div>
          </div>
          {expandedMetrics.has('casemanagement') && (
            <>
            <div className="metrics-grid">
              <div className="stat-card">
                <div className="stat-label">Avg Length of Stay</div>
                <div className="stat-value">{(metrics.case_management_progress.avg_length_of_stay_days ?? 0).toFixed(1)} days</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Resident Transition Rate</div>
                <div className="stat-value">{((metrics.case_management_progress.resident_transition_rate ?? 0) * 100).toFixed(1)}%</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Family Reunification Rate</div>
                <div className="stat-value">{((metrics.case_management_progress.family_reunification_rate ?? 0) * 100).toFixed(1)}%</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Case Closure Rate</div>
                <div className="stat-value">{((metrics.case_management_progress.case_closure_rate ?? 0) * 100).toFixed(1)}%</div>
              </div>
            </div>
            {showCaseManagementGuide && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                background: 'var(--cream-dark)',
                borderRadius: '4px',
                border: '1px solid var(--cream-darker)',
              }}>
                <h4 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-dark)' }}>How These Metrics Are Calculated</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div>
                    <p style={{ fontWeight: 600, margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-dark)' }}>Avg Length of Stay</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>Average number of days from admission to current date for active residents</p>
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-dark)' }}>Resident Transition Rate</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>Percentage of active residents who are 18+ years old</p>
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-dark)' }}>Family Reunification Rate</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>Percentage of closed cases with "Family Reunified" reintegration status</p>
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-dark)' }}>Case Closure Rate</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>Percentage of intervention plans with Completed or Closed status</p>
                  </div>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      )}

      {/* Intervention Plan Metrics */}
      {metrics?.intervention_plan_metrics && (
        <div className="dashboard-section" style={{ cursor: 'pointer' }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: expandedMetrics.has('interventionmetrics') ? '1.5rem' : 0 }}
            onClick={() => toggleMetricExpanded('interventionmetrics')}
          >
            <h2 style={{ margin: 0 }}>Intervention Plan Metrics</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {expandedMetrics.has('interventionmetrics') && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowInterventionGuide(!showInterventionGuide); }}
                  style={{
                    background: 'var(--teal)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s var(--ease)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--teal-dark)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--teal)')}
                  title="View calculation guide"
                >
                  ?
                </button>
              )}
              <span className={`metric-chevron ${expandedMetrics.has('interventionmetrics') ? 'expanded' : ''}`} style={{ fontSize: '1.5rem' }}>›</span>
            </div>
          </div>
          {expandedMetrics.has('interventionmetrics') && (
            <>
              <div className="metrics-grid">
                <div className="stat-card">
                  <div className="stat-label">Avg Days to Complete Plan</div>
                  <div className="stat-value">{(metrics.intervention_plan_metrics.avg_days_to_complete ?? 0).toFixed(1)} days</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Completion Rate</div>
                  <div className="stat-value">{((metrics.intervention_plan_metrics.completion_rate ?? 0) * 100).toFixed(1)}%</div>
                </div>
                <div className="stat-card" style={{ gridColumn: 'span 2' }}>
                  <div className="stat-label">Most Common Category</div>
                  <div className="stat-value">{metrics.intervention_plan_metrics.most_common_category || 'N/A'}</div>
                </div>
              </div>
              {(metrics.intervention_plan_metrics.success_rate_by_type?.length ?? 0) > 0 && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--cream-darker)' }}>
                  <p style={{ fontWeight: 600, marginBottom: '1rem' }}>Success Rate by Plan Type:</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {(metrics.intervention_plan_metrics.success_rate_by_type ?? []).map((item) => (
                      <div key={item.category} style={{ background: 'var(--cream-dark)', padding: '1rem', borderRadius: '4px' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>{item.category}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--teal-dark)' }}>{((item.success_rate ?? 0) * 100).toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {showInterventionGuide && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1.5rem',
                  background: 'var(--cream-dark)',
                  borderRadius: '4px',
                  border: '1px solid var(--cream-darker)',
                }}>
                  <h4 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-dark)' }}>How These Metrics Are Calculated</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <div>
                      <p style={{ fontWeight: 600, margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-dark)' }}>Avg Days to Complete Plan</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>Average number of days from plan creation to completion for finished plans</p>
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-dark)' }}>Completion Rate</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>Percentage of plans with Completed or Closed status</p>
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-dark)' }}>Most Common Category</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>Plan category with the highest number of plans</p>
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-dark)' }}>Success Rate by Type</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>Percentage of completed plans for each category</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Engagement & Support */}
      {metrics?.engagement_support && (
        <div className="dashboard-section" style={{ cursor: 'pointer' }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: expandedMetrics.has('engagement') ? '1.5rem' : 0 }}
            onClick={() => toggleMetricExpanded('engagement')}
          >
            <h2 style={{ margin: 0 }}>Engagement & Support</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {expandedMetrics.has('engagement') && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowEngagementGuide(!showEngagementGuide); }}
                  style={{
                    background: 'var(--teal)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s var(--ease)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--teal-dark)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--teal)')}
                  title="View calculation guide"
                >
                  ?
                </button>
              )}
              <span className={`metric-chevron ${expandedMetrics.has('engagement') ? 'expanded' : ''}`} style={{ fontSize: '1.5rem' }}>›</span>
            </div>
          </div>
          {expandedMetrics.has('engagement') && (
            <>
              <div className="metrics-grid">
                <div className="stat-card">
                  <div className="stat-label">Avg Partner Engagement</div>
                  <div className="stat-value">{(metrics.engagement_support.partner_engagement_frequency_avg ?? 0).toFixed(1)}x/mo</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">In-Kind Donation Trend</div>
                  <div className="stat-value" style={{ color: (metrics.engagement_support.in_kind_donation_trend ?? 0) >= 0 ? 'var(--teal-dark)' : '#d32f2f' }}>
                    {(metrics.engagement_support.in_kind_donation_trend ?? 0) > 0 ? '↑' : '↓'} {Math.abs(metrics.engagement_support.in_kind_donation_trend ?? 0).toFixed(1)}%
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Donor Retention Rate</div>
                  <div className="stat-value">{((metrics.engagement_support.donor_retention_rate ?? 0) * 100).toFixed(1)}%</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Avg Volunteer Hours/Month</div>
                  <div className="stat-value">{(metrics.engagement_support.avg_volunteer_hours_per_month ?? 0).toFixed(0)} hrs</div>
                </div>
              </div>
              {showEngagementGuide && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1.5rem',
                  background: 'var(--cream-dark)',
                  borderRadius: '4px',
                  border: '1px solid var(--cream-darker)',
                }}>
                  <h4 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-dark)' }}>How These Metrics Are Calculated</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <div>
                      <p style={{ fontWeight: 600, margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-dark)' }}>Avg Partner Engagement</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>Average frequency of partner engagements per month</p>
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-dark)' }}>In-Kind Donation Trend</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>Month-over-month percentage change in in-kind donations</p>
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-dark)' }}>Donor Retention Rate</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>Percentage of donors from previous period who donated again</p>
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-dark)' }}>Avg Volunteer Hours/Month</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>Average monthly volunteer hours contributed</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Refresh Section */}
      <div className="refresh-info">
        <p>Last updated: {formatDate(metrics.timestamp)}</p>
        <button onClick={loadDashboardMetrics} className="refresh-btn">Refresh Data</button>
      </div>
    </div>
  );
};

export default AdminDashboard;
