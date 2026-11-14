import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ComplaintCard from '../components/ComplaintCard';
import ComplaintModal from '../components/ComplaintModal';
import { SAMPLE_COMPLAINTS } from '../services/demoData';
import { PlusCircle, Search, AlertCircle, CheckCircle, Clock, ShieldAlert } from 'lucide-react';

export default function CitizenDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState('');
  const [trackedComplaint, setTrackedComplaint] = useState(null);
  const [trackError, setTrackError] = useState('');
  
  // New Complaint Form State
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('ROAD_DAMAGE');
  const [priority, setPriority] = useState('MEDIUM');
  const [locationAddress, setLocationAddress] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints/');
      setComplaints(res.data && res.data.length > 0 ? res.data : SAMPLE_COMPLAINTS);
    } catch (err) {
      console.warn('Backend offline, loading interactive demo incidents', err);
      setComplaints(SAMPLE_COMPLAINTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleTrackComplaint = async (e) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    setTrackError('');
    try {
      const res = await api.get(`/complaints/track/${searchCode.trim()}`);
      setTrackedComplaint(res.data);
      setSelectedComplaint(res.data);
    } catch (err) {
      const localFound = complaints.find(
        (c) => c.complaint_code.toLowerCase() === searchCode.trim().toLowerCase()
      );
      if (localFound) {
        setTrackedComplaint(localFound);
        setSelectedComplaint(localFound);
      } else {
        setTrackError(`No complaint found with ID "${searchCode}". Try searching "CMP-1001" or "CMP-1002".`);
      }
    }
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      let photoUrl = null;
      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        const uploadRes = await api.post('/complaints/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        photoUrl = uploadRes.data.photo_url;
      }

      await api.post('/complaints/', {
        title,
        description,
        category,
        priority,
        location_address: locationAddress,
      }, {
        params: photoUrl ? { photo_url: photoUrl } : {}
      });

      // Reset form
      setTitle('');
      setDescription('');
      setLocationAddress('');
      setPhotoFile(null);
      setShowNewModal(false);
      fetchComplaints();
    } catch (err) {
      // Local fallback creation for public preview
      const newMock = {
        id: Date.now(),
        complaint_code: `CMP-${1000 + complaints.length + 1}`,
        title,
        description,
        category,
        priority,
        status: 'SUBMITTED',
        location_address: locationAddress,
        created_at: new Date().toISOString(),
        history: [{ id: Date.now(), status: 'SUBMITTED', remarks: 'Issue registered by citizen via web portal.', created_at: new Date().toISOString() }]
      };
      setComplaints([newMock, ...complaints]);
      setTitle('');
      setDescription('');
      setLocationAddress('');
      setPhotoFile(null);
      setShowNewModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const totalSubmitted = complaints.length;
  const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length;
  const resolved = complaints.filter(c => c.status === 'RESOLVED').length;

  return (
    <div>
      {/* Header with Title and New Complaint Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Citizen Grievance & Tracking Portal</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Report urban infrastructure defects and monitor repair progress in real-time.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowNewModal(true)}
          style={{ padding: '0.75rem 1.4rem' }}
        >
          <PlusCircle size={18} />
          <span>Report New Issue</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h4>Total Registered</h4>
            <p>{totalSubmitted}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
            <AlertCircle size={24} />
          </div>
          <div className="stat-info">
            <h4>In Action / Assigned</h4>
            <p>{inProgress}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h4>Resolved Complaints</h4>
            <p>{resolved}</p>
          </div>
        </div>
      </div>

      {/* Public Complaint Tracking Search Bar */}
      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem', boxShadow: 'var(--shadow)' }}>
        <form onSubmit={handleTrackComplaint} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Track any complaint by Complaint ID (e.g. CMP-1001)..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.4rem' }}
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Track Status
          </button>
        </form>
        {trackError && (
          <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 500 }}>
            {trackError}
          </p>
        )}
      </div>

      {/* Complaint List */}
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Your Reported Complaints</h2>
        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Showing {complaints.length} records</span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading complaints...</div>
      ) : complaints.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <ShieldAlert size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3>No complaints filed yet</h3>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Click "Report New Issue" above to submit a municipal concern with photos.</p>
        </div>
      ) : (
        <div className="card-grid">
          {complaints.map((c) => (
            <ComplaintCard
              key={c.id}
              complaint={c}
              onActionClick={(item) => setSelectedComplaint(item)}
              actionLabel="View Progress"
            />
          ))}
        </div>
      )}

      {/* Detail / History Modal */}
      <ComplaintModal
        isOpen={!!selectedComplaint}
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        mode="view"
      />

      {/* New Complaint Filing Modal */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Register Public Infrastructure Complaint</h3>
              <button onClick={() => setShowNewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-body">
              {formError && (
                <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  {formError}
                </div>
              )}
              <form onSubmit={handleCreateComplaint}>
                <div className="form-group">
                  <label>Complaint Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Deep pothole causing traffic jam"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="ROAD_DAMAGE">Road Damage & Potholes</option>
                    <option value="WATER_SEWAGE">Water Pipeline Leak / Sewage Overflow</option>
                    <option value="ELECTRICITY">Electricity / Transformer Fault</option>
                    <option value="GARBAGE_WASTE">Garbage Dump & Waste Clearance</option>
                    <option value="STREET_LIGHT">Streetlight Non-functional</option>
                    <option value="TRAFFIC_INFRA">Traffic Signal / Road Signs</option>
                    <option value="OTHER">Other Urban Maintenance</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Detailed Description *</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Provide details about the issue..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Location / Landmark Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Near Metro Gate 3, Sector 62, Noida"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Upload Photo Evidence (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files[0])}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
                >
                  {submitting ? 'Submitting...' : 'Register Complaint'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
