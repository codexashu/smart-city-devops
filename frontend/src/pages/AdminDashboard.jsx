import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ComplaintCard from '../components/ComplaintCard';
import ComplaintModal from '../components/ComplaintModal';
import { SAMPLE_COMPLAINTS, SAMPLE_DEPARTMENTS, SAMPLE_STATS } from '../services/demoData';
import { ShieldCheck, Filter, AlertTriangle, Users, Building, Activity, CheckCircle2 } from 'lucide-react';

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterDept, setFilterDept] = useState('');

  // Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compRes, deptRes, statsRes] = await Promise.all([
        api.get('/admin/complaints', {
          params: {
            status: filterStatus || undefined,
            priority: filterPriority || undefined,
            department_id: filterDept || undefined
          }
        }),
        api.get('/admin/departments'),
        api.get('/admin/stats')
      ]);

      setComplaints(compRes.data && compRes.data.length > 0 ? compRes.data : SAMPLE_COMPLAINTS);
      setDepartments(deptRes.data && deptRes.data.length > 0 ? deptRes.data : SAMPLE_DEPARTMENTS);
      setStats(statsRes.data || SAMPLE_STATS);
    } catch (err) {
      console.warn('Backend offline, loading interactive admin demo data', err);
      let filtered = [...SAMPLE_COMPLAINTS];
      if (filterStatus) filtered = filtered.filter(c => c.status === filterStatus);
      if (filterPriority) filtered = filtered.filter(c => c.priority === filterPriority);
      if (filterDept) filtered = filtered.filter(c => c.department?.id === parseInt(filterDept));
      setComplaints(filtered);
      setDepartments(SAMPLE_DEPARTMENTS);
      setStats(SAMPLE_STATS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterPriority, filterDept]);

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontWeight: 700, fontSize: '0.85rem' }}>
            <ShieldCheck size={16} />
            <span>MUNICIPAL ADMINISTRATION CONSOLE</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>City Infrastructure Command Center</h1>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Activity size={24} />
            </div>
            <div className="stat-info">
              <h4>Total Incidents</h4>
              <p>{stats.summary.total_complaints}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <AlertTriangle size={24} />
            </div>
            <div className="stat-info">
              <h4>Unassigned / Submitted</h4>
              <p>{stats.summary.submitted}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
              <Building size={24} />
            </div>
            <div className="stat-info">
              <h4>Under Repair</h4>
              <p>{stats.summary.in_progress + stats.summary.assigned}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <CheckCircle2 size={24} />
            </div>
            <div className="stat-info">
              <h4>Resolution Rate</h4>
              <p>{stats.summary.resolution_rate}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Department Performance Overview Bar */}
      {stats?.department_performance && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', marginBottom: '2rem', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#334155' }}>
            Departmental Workload & Performance
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {stats.department_performance.map((dp) => (
              <div key={dp.department_id} style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>{dp.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                  <span>Assigned: {dp.total_assigned}</span>
                  <span style={{ color: '#16a34a', fontWeight: 600 }}>Resolved: {dp.resolved}</span>
                </div>
                <div style={{ marginTop: '0.4rem', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${dp.resolution_rate}%`, height: '100%', background: '#2563eb' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div style={{ background: 'white', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
          <Filter size={16} />
          <span>Filters:</span>
        </div>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="SUBMITTED">Submitted (New)</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>

        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        {(filterStatus || filterPriority || filterDept) && (
          <button
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            onClick={() => { setFilterStatus(''); setFilterPriority(''); setFilterDept(''); }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Complaints List */}
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Civic Complaints Master List</h2>
        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Showing {complaints.length} records</span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading records...</div>
      ) : complaints.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3>No complaints matching the selected filters</h3>
        </div>
      ) : (
        <div className="card-grid">
          {complaints.map((c) => (
            <ComplaintCard
              key={c.id}
              complaint={c}
              onActionClick={(item) => setSelectedComplaint(item)}
              actionLabel="Assign / Manage"
            />
          ))}
        </div>
      )}

      {/* Admin Assign Modal */}
      <ComplaintModal
        isOpen={!!selectedComplaint}
        complaint={selectedComplaint}
        departments={departments}
        mode="admin_assign"
        onClose={() => setSelectedComplaint(null)}
        onSuccess={fetchData}
      />
    </div>
  );
}
