import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Caseload.css';

interface Resident {
  id: number;
  caseControlNo: string;
  internalCode: string;
  safehouseId: number;
  sex: string;
  caseStatus: string;
  currentRiskLevel: string;
  dateOfAdmission: string;
  reintegrationStatus?: string;
}

export default function Caseload() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    riskLevel: 'all',
    safehouse: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchResidents();
  }, [isAuthenticated, navigate]);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      // In production, replace with actual API call
      // const response = await fetch('https://localhost:7230/api/residents', {
      //   headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      // });
      // const data = await response.json();
      // setResidents(data.data);

      // Mock data for development
      const mockResidents: Resident[] = [
        {
          id: 1,
          caseControlNo: 'CC-001',
          internalCode: 'RES-001',
          safehouseId: 1,
          sex: 'F',
          caseStatus: 'Active',
          currentRiskLevel: 'Medium',
          dateOfAdmission: '2024-01-15',
          reintegrationStatus: 'In Progress'
        },
        {
          id: 2,
          caseControlNo: 'CC-002',
          internalCode: 'RES-002',
          safehouseId: 1,
          sex: 'F',
          caseStatus: 'Active',
          currentRiskLevel: 'Low',
          dateOfAdmission: '2024-02-20',
          reintegrationStatus: 'Completed'
        },
        {
          id: 3,
          caseControlNo: 'CC-003',
          internalCode: 'RES-003',
          safehouseId: 2,
          sex: 'F',
          caseStatus: 'Closed',
          currentRiskLevel: 'Low',
          dateOfAdmission: '2023-06-10',
          reintegrationStatus: 'Completed'
        }
      ];
      setResidents(mockResidents);
      setFilteredResidents(mockResidents);
    } catch (error) {
      console.error('Failed to fetch residents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = residents;

    // Apply filters
    if (filters.status !== 'all') {
      result = result.filter(r => r.caseStatus === filters.status);
    }
    if (filters.riskLevel !== 'all') {
      result = result.filter(r => r.currentRiskLevel === filters.riskLevel);
    }
    if (filters.safehouse !== 'all') {
      result = result.filter(r => r.safehouseId.toString() === filters.safehouse);
    }

    // Apply search
    if (searchTerm) {
      result = result.filter(r =>
        r.caseControlNo.toLowerCase().includes(searchTerm) ||
        r.internalCode.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredResidents(result);
  }, [residents, filters, searchTerm]);

  const getRiskLevelClass = (level: string) => {
    switch (level) {
      case 'Critical': return 'risk-critical';
      case 'High': return 'risk-high';
      case 'Medium': return 'risk-medium';
      case 'Low': return 'risk-low';
      default: return '';
    }
  };

  return (
    <div className="caseload-container">
      <div className="caseload-header">
        <h1>Caseload Inventory</h1>
        <p>Manage and track all resident cases</p>
      </div>

      <div className="caseload-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by Case # or Internal Code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            className="search-input"
          />
        </div>

        <div className="filters">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={filters.riskLevel}
            onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value })}
            className="filter-select"
          >
            <option value="all">All Risk Levels</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={filters.safehouse}
            onChange={(e) => setFilters({ ...filters, safehouse: e.target.value })}
            className="filter-select"
          >
            <option value="all">All Safehouses</option>
            <option value="1">Safehouse 1</option>
            <option value="2">Safehouse 2</option>
            <option value="3">Safehouse 3</option>
          </select>
        </div>

        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add New Resident'}
        </button>
      </div>

      {showForm && (
        <div className="add-resident-form">
          <h3>Add New Resident</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            setShowForm(false);
          }}>
            <div className="form-row">
              <div className="form-group">
                <label>Case Control #</label>
                <input type="text" placeholder="CC-###" required />
              </div>
              <div className="form-group">
                <label>Internal Code</label>
                <input type="text" placeholder="RES-###" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date of Admission</label>
                <input type="date" required />
              </div>
              <div className="form-group">
                <label>Safehouse</label>
                <select required>
                  <option value="">Select Safehouse</option>
                  <option value="1">Safehouse 1</option>
                  <option value="2">Safehouse 2</option>
                  <option value="3">Safehouse 3</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary">Create Resident Record</button>
          </form>
        </div>
      )}

      <div className="caseload-stats">
        <div className="stat-card">
          <div className="stat-number">{residents.length}</div>
          <div className="stat-label">Total Cases</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{residents.filter(r => r.caseStatus === 'Active').length}</div>
          <div className="stat-label">Active Cases</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{residents.filter(r => r.currentRiskLevel === 'Critical' || r.currentRiskLevel === 'High').length}</div>
          <div className="stat-label">High Risk Cases</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{residents.filter(r => r.reintegrationStatus === 'Completed').length}</div>
          <div className="stat-label">Reintegrated</div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading residents...</div>
      ) : (
        <div className="residents-table">
          <table>
            <thead>
              <tr>
                <th>Case #</th>
                <th>Internal Code</th>
                <th>Status</th>
                <th>Risk Level</th>
                <th>Admitted</th>
                <th>Reintegration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResidents.length > 0 ? (
                filteredResidents.map(resident => (
                  <tr key={resident.id}>
                    <td className="case-number">{resident.caseControlNo}</td>
                    <td>{resident.internalCode}</td>
                    <td>
                      <span className={`status-badge status-${resident.caseStatus.toLowerCase()}`}>
                        {resident.caseStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`risk-badge ${getRiskLevelClass(resident.currentRiskLevel)}`}>
                        {resident.currentRiskLevel}
                      </span>
                    </td>
                    <td>{new Date(resident.dateOfAdmission).toLocaleDateString()}</td>
                    <td>{resident.reintegrationStatus || '—'}</td>
                    <td className="actions">
                      <button className="btn-small btn-view">View</button>
                      <button className="btn-small btn-edit">Edit</button>
                      <button className="btn-small btn-notes">Notes</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="no-results">No residents found matching filters</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
