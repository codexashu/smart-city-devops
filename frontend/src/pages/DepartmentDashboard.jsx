import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ComplaintCard from '../components/ComplaintCard';
import ComplaintModal from '../components/ComplaintModal';
import { SAMPLE_COMPLAINTS } from '../services/demoData';
import { HardHat, CheckCircle2, Clock, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DepartmentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/department/complaints', {
        params: { status: selectedStatus || undefined }
      });
      setComplaints(res.data && res.data.length > 0 ? res.data : SAMPLE_COMPLAINTS.filter(c => c.department?.id === 1));
    } catch (err) {
      console.warn('Backend offline, loading department demo work orders', err);
      let deptWork = SAMPLE_COMPLAINTS.filter(c => c.department?.id === 1 || !c.department);
      if (selectedStatus) {
        deptWork = deptWork.filter(c => c.status === selectedStatus);
      }
      setComplaints(deptWork);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, [selectedStatus]);

  const assignedCount = complaints.filter(c => c.status === 'ASSIGNED').length;
  const inProgressCount = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;

  return (
    <div>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#7c3aed', fontWeight: 700, fontSize: '0.85rem' }}>
            <HardHat size={16} />
            <span>MUNICIPAL FIELD CREW & OPERATIONS</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Department Work Orders</h1>
          <p style={{ color: '#64748b' }}>Update work status, upload field repair proof, and mark resolved.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#1e40af' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h4>Assigned (Pending Action)</h4>
            <p>{assignedCount}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
            <Wrench size={24} />
          </div>
          <div className="stat-info">
            <h4>Work In Progress</h4>
            <p>{inProgressCount}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <h4>Work Completed</h4>
            <p>{resolvedCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
        <button
          className={`btn ${selectedStatus === '' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSelectedStatus('')}
        >
          All Assigned ({complaints.length})
        </button>
        <button
          className={`btn ${selectedStatus === 'ASSIGNED' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSelectedStatus('ASSIGNED')}
        >
          Awaiting Action
        </button>
        <button
          className={`btn ${selectedStatus === 'IN_PROGRESS' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSelectedStatus('IN_PROGRESS')}
        >
          In Progress
        </button>
        <button
          className={`btn ${selectedStatus === 'RESOLVED' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSelectedStatus('RESOLVED')}
        >
          Resolved
        </button>
      </div>

      {/* Complaint List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading field work orders...</div>
      ) : complaints.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3>No work orders assigned under this status</h3>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>New complaints assigned by Admin will appear here automatically.</p>
        </div>
      ) : (
        <div className="card-grid">
          {complaints.map((c) => (
            <ComplaintCard
              key={c.id}
              complaint={c}
              onActionClick={(item) => setSelectedComplaint(item)}
              actionLabel="Update Work / Resolve"
            />
          ))}
        </div>
      )}

      {/* Resolve / Update Progress Modal */}
      <ComplaintModal
        isOpen={!!selectedComplaint}
        complaint={selectedComplaint}
        mode="dept_resolve"
        onClose={() => setSelectedComplaint(null)}
        onSuccess={fetchWorkOrders}
      />
    </div>
  );
}
