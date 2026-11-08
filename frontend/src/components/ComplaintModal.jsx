import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import api from '../services/api';
import { X, CheckCircle, Clock, MapPin, Building, Upload, Shield, HardHat } from 'lucide-react';

export default function ComplaintModal({
  isOpen,
  onClose,
  complaint,
  mode = "view", // "view", "admin_assign", "dept_resolve"
  departments = [],
  onSuccess
}) {
  const [selectedDept, setSelectedDept] = useState(complaint?.department_id || '');
  const [priority, setPriority] = useState(complaint?.priority || 'MEDIUM');
  const [remarks, setRemarks] = useState('');
  const [status, setStatus] = useState(complaint?.status || 'IN_PROGRESS');
  const [resolutionPhoto, setResolutionPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !complaint) return null;

  const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const base = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://localhost:8000';
    return `${base}${url}`;
  };

  const handleAdminAssign = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.put(`/admin/complaints/${complaint.id}/assign`, {
        department_id: parseInt(selectedDept),
        priority: priority,
        remarks: remarks || `Assigned to department with ${priority} priority`
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to assign complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleDeptUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let resolutionUrl = complaint.resolution_photo_url;

      // Handle photo upload if provided
      if (resolutionPhoto) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', resolutionPhoto);
        const uploadRes = await api.post('/complaints/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        resolutionUrl = uploadRes.data.photo_url;
      }

      await api.put(`/department/complaints/${complaint.id}/status`, {
        status: status,
        remarks: remarks,
        resolution_photo_url: resolutionUrl
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update complaint status');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="complaint-code">{complaint.complaint_code}</span>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{complaint.title}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="#64748b" />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {/* Quick status & badges */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <PriorityBadge priority={complaint.priority} />
              <StatusBadge status={complaint.status} />
            </div>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Filed: {new Date(complaint.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Description & Location */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '0.95rem', color: '#334155', marginBottom: '0.75rem' }}>{complaint.description}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#64748b' }}>
              <MapPin size={15} />
              <span>{complaint.location_address}</span>
            </div>
          </div>

          {/* Before & After Images side-by-side comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: complaint.resolution_photo_url ? '1fr 1fr' : '1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            {complaint.photo_url && (
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#dc2626', display: 'block', marginBottom: '0.3rem' }}>
                  📷 Citizen Report Photo (Issue):
                </span>
                <img
                  src={getFullImageUrl(complaint.photo_url)}
                  alt="Citizen report"
                  style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
            )}
            {complaint.resolution_photo_url && (
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a', display: 'block', marginBottom: '0.3rem' }}>
                  ✅ Resolution Proof (Fixed):
                </span>
                <img
                  src={getFullImageUrl(complaint.resolution_photo_url)}
                  alt="Resolution proof"
                  style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
            )}
          </div>

          {/* Mode: Admin Assignment Form */}
          {mode === 'admin_assign' && (
            <form onSubmit={handleAdminAssign} style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#1e40af', fontWeight: 700 }}>
                <Shield size={18} />
                <span>Admin Department Assignment</span>
              </div>

              <div className="form-group">
                <label>Select Municipal Department</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  required
                >
                  <option value="">-- Choose Department --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Assign Priority Level</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div className="form-group">
                <label>Assignment Instructions / Remarks</label>
                <textarea
                  rows="2"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Instructions for the maintenance crew..."
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                {loading ? 'Assigning...' : 'Assign to Department'}
              </button>
            </form>
          )}

          {/* Mode: Department Work Progress & Resolution Form */}
          {mode === 'dept_resolve' && (
            <form onSubmit={handleDeptUpdate} style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#7c3aed', fontWeight: 700 }}>
                <HardHat size={18} />
                <span>Department Work Order Progress</span>
              </div>

              <div className="form-group">
                <label>Update Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="IN_PROGRESS">IN_PROGRESS (Team Dispatched / Working)</option>
                  <option value="RESOLVED">RESOLVED (Work Completed & Verified)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Work Remarks / Field Notes</label>
                <textarea
                  rows="3"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter details of action taken (e.g. pothole asphalt filled, light replaced)..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Upload Resolution Proof Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setResolutionPhoto(e.target.files[0])}
                />
              </div>

              <button
                type="submit"
                disabled={loading || uploading}
                className={`btn ${status === 'RESOLVED' ? 'btn-success' : 'btn-primary'}`}
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                {loading ? 'Updating...' : status === 'RESOLVED' ? 'Mark Resolved & Complete' : 'Update Work Progress'}
              </button>
            </form>
          )}

          {/* Status Timeline History */}
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.75rem' }}>Status & Audit History</h4>
            {complaint.history && complaint.history.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {complaint.history.map((hist, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <div style={{ minWidth: '110px' }}>
                      <StatusBadge status={hist.status} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 500, color: '#1e293b' }}>{hist.remarks || 'Status changed'}</p>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {new Date(hist.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No status transitions recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
