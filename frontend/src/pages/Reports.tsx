import { useState } from 'react';
import '../styles/Reports.css';

interface ReportData {
  label: string;
  value: number;
  percentage?: number;
}

export default function Reports() {
  const [selectedMetric, setSelectedMetric] = useState<string>('outcomes');
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-04-30' });

  const outcomeMetrics: ReportData[] = [
    { label: 'Reintegrated', value: 28, percentage: 19.3 },
    { label: 'In Progress', value: 85, percentage: 58.6 },
    { label: 'Active in Care', value: 32, percentage: 22.1 }
  ];

  const donationMetrics: ReportData[] = [
    { label: 'Monetary Contributions', value: 450000, percentage: 65 },
    { label: 'In-Kind Donations', value: 180000, percentage: 26 },
    { label: 'Volunteer Hours', value: 85000, percentage: 9 }
  ];

  const caseloadTrends = [
    { month: 'Jan', active: 120, closed: 5 },
    { month: 'Feb', active: 132, closed: 8 },
    { month: 'Mar', active: 145, closed: 12 },
    { month: 'Apr', active: 145, closed: 15 }
  ];

  const riskDistribution = [
    { level: 'Critical', count: 2, percentage: 1.4 },
    { level: 'High', count: 18, percentage: 12.4 },
    { level: 'Medium', count: 65, percentage: 44.8 },
    { level: 'Low', count: 60, percentage: 41.4 }
  ];

  const donorSegments = [
    { segment: 'New Donors (This Quarter)', count: 24, avgDonation: 5200 },
    { segment: 'Repeat Donors', count: 156, avgDonation: 8900 },
    { segment: 'Major Donors (>50k)', count: 8, avgDonation: 75000 }
  ];

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Reports & Analytics</h1>
        <p>Key performance metrics and organizational insights</p>
      </div>

      <div className="date-filter">
        <label>Report Date Range:</label>
        <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
        <span>to</span>
        <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
        <button className="btn-filter">Generate Report</button>
      </div>

      <div className="metrics-selector">
        <button
          className={`metric-btn ${selectedMetric === 'outcomes' ? 'active' : ''}`}
          onClick={() => setSelectedMetric('outcomes')}
        >
          Outcomes
        </button>
        <button
          className={`metric-btn ${selectedMetric === 'donations' ? 'active' : ''}`}
          onClick={() => setSelectedMetric('donations')}
        >
          Donations
        </button>
        <button
          className={`metric-btn ${selectedMetric === 'risk' ? 'active' : ''}`}
          onClick={() => setSelectedMetric('risk')}
        >
          Risk Distribution
        </button>
        <button
          className={`metric-btn ${selectedMetric === 'donors' ? 'active' : ''}`}
          onClick={() => setSelectedMetric('donors')}
        >
          Donor Segments
        </button>
      </div>

      <div className="reports-grid">
        {selectedMetric === 'outcomes' && (
          <>
            <div className="metrics-card">
              <h3>Reintegration Outcomes</h3>
              <div className="metrics-list">
                {outcomeMetrics.map((metric, idx) => (
                  <div key={idx} className={`metric-item outcome-${idx}`}>
                    <div className="metric-label">{metric.label}</div>
                    <div className="metric-bar">
                      <div className="metric-fill" style={{ width: `${metric.percentage}%` }}></div>
                    </div>
                    <div className="metric-value">{metric.value} ({metric.percentage}%)</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="metrics-card">
              <h3>Caseload Trend (Jan-Apr 2024)</h3>
              <div className="trend-table">
                <div className="trend-header">
                  <div className="trend-col">Month</div>
                  <div className="trend-col">Active Cases</div>
                  <div className="trend-col">Closed Cases</div>
                </div>
                {caseloadTrends.map((trend, idx) => (
                  <div key={idx} className="trend-row">
                    <div className="trend-col">{trend.month}</div>
                    <div className="trend-col trend-active">{trend.active}</div>
                    <div className="trend-col trend-closed">{trend.closed}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {selectedMetric === 'donations' && (
          <>
            <div className="metrics-card">
              <h3>Donation Channel Distribution</h3>
              <div className="pie-chart">
                {donationMetrics.map((metric, idx) => (
                  <div key={idx} className={`pie-segment segment-${idx}`}>
                    <div className="pie-value">{metric.percentage}%</div>
                    <div className="pie-label">{metric.label}</div>
                  </div>
                ))}
              </div>
              <div className="metrics-list mt-20">
                {donationMetrics.map((metric, idx) => (
                  <div key={idx} className="metric-item">
                    <div className="metric-label">{metric.label}</div>
                    <div className="metric-value">₱{(metric.value).toLocaleString()} ({metric.percentage}%)</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="metrics-card">
              <h3>Financial Impact</h3>
              <div className="impact-stats">
                <div className="impact-item">
                  <div className="impact-number">₱715,000</div>
                  <div className="impact-label">Total Donations</div>
                </div>
                <div className="impact-item">
                  <div className="impact-number">₱4,930</div>
                  <div className="impact-label">Average Per Donor</div>
                </div>
                <div className="impact-item">
                  <div className="impact-number">188</div>
                  <div className="impact-label">Active Donors</div>
                </div>
                <div className="impact-item">
                  <div className="impact-number">8.2%</div>
                  <div className="impact-label">Avg Monthly Growth</div>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedMetric === 'risk' && (
          <>
            <div className="metrics-card">
              <h3>User Risk Level Distribution</h3>
              <div className="risk-bars">
                {riskDistribution.map((risk, idx) => (
                  <div key={idx} className={`risk-item risk-${risk.level.toLowerCase()}`}>
                    <div className="risk-level">{risk.level}</div>
                    <div className="risk-bar">
                      <div className="risk-fill" style={{ width: `${risk.percentage * 3}%` }}></div>
                    </div>
                    <div className="risk-count">{risk.count} cases ({risk.percentage}%)</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="metrics-card">
              <h3>Risk Alert Summary</h3>
              <div className="alert-boxes">
                <div className="alert-box alert-critical">
                  <div className="alert-number">2</div>
                  <div className="alert-text">Critical cases requiring immediate intervention</div>
                </div>
                <div className="alert-box alert-high">
                  <div className="alert-number">18</div>
                  <div className="alert-text">High-risk cases needing close monitoring</div>
                </div>
                <div className="alert-box alert-medium">
                  <div className="alert-number">65</div>
                  <div className="alert-text">Medium-risk cases with ongoing support</div>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedMetric === 'donors' && (
          <>
            <div className="metrics-card full-width">
              <h3>Donor Segmentation Analysis</h3>
              <div className="donor-table">
                <div className="table-header">
                  <div className="table-col">Donor Segment</div>
                  <div className="table-col">Count</div>
                  <div className="table-col">Avg Donation (₱)</div>
                  <div className="table-col">Total Value (₱)</div>
                </div>
                {donorSegments.map((segment, idx) => (
                  <div key={idx} className="table-row">
                    <div className="table-col">{segment.segment}</div>
                    <div className="table-col">{segment.count}</div>
                    <div className="table-col">{segment.avgDonation.toLocaleString()}</div>
                    <div className="table-col value-highlight">{(segment.count * segment.avgDonation).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="metrics-card full-width">
              <h3>Donor Retention & Growth Metrics</h3>
              <div className="retention-metrics">
                <div className="metric-box">
                  <div className="metric-title">Donor Retention Rate</div>
                  <div className="metric-large">82.5%</div>
                  <div className="metric-desc">Repeat donors from previous quarter</div>
                </div>
                <div className="metric-box">
                  <div className="metric-title">New Donor Acquisition</div>
                  <div className="metric-large">24</div>
                  <div className="metric-desc">New donors this quarter</div>
                </div>
                <div className="metric-box">
                  <div className="metric-title">Lapse Risk (12+ months)</div>
                  <div className="metric-large">12</div>
                  <div className="metric-desc">Donors at risk of lapsing</div>
                </div>
                <div className="metric-box">
                  <div className="metric-title">Upgrade Opportunity</div>
                  <div className="metric-large">34</div>
                  <div className="metric-desc">Donors with upgrade potential</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="export-section">
        <h3>Export Reports</h3>
        <div className="export-buttons">
          <button className="btn-export">📊 Export as PDF</button>
          <button className="btn-export">📋 Export as Excel</button>
          <button className="btn-export">📧 Email Report</button>
        </div>
      </div>
    </div>
  );
}
