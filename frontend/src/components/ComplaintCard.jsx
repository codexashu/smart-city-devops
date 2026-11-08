import React from 'react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { MapPin, Calendar, Building, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ComplaintCard({ complaint, onActionClick, actionLabel = "View Details" }) {
  const formattedDate = new Date(complaint.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const base = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://localhost:8000';
    return `${base}${url}`;
  };

  return (
    <div className="complaint-card">
      <div className="card-header">
        <span className="complaint-code">{complaint.complaint_code}</span>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <PriorityBadge priority={complaint.priority} />
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      <div className="card-body">
        {complaint.photo_url && (
          <img
            src={getFullImageUrl(complaint.photo_url)}
            alt={complaint.title}
            className="card-image-preview"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}

        <h3 className="card-title">{complaint.title}</h3>
        <p className="card-desc">{complaint.description}</p>

        <div className="card-meta">
          <div className="meta-row">
            <MapPin size={14} color="#64748b" />
            <span>{complaint.location_address}</span>
          </div>

          <div className="meta-row">
            <Building size={14} color="#64748b" />
            <span>
              {complaint.department ? complaint.department.name : 'Unassigned (Awaiting Review)'}
            </span>
          </div>

          <div className="meta-row">
            <Calendar size={14} color="#64748b" />
            <span>{formattedDate}</span>
          </div>

          {complaint.status === 'RESOLVED' && complaint.resolution_remarks && (
            <div className="meta-row" style={{ color: '#15803d', fontWeight: 600, marginTop: '0.3rem' }}>
              <CheckCircle2 size={14} />
              <span>Fix: {complaint.resolution_remarks}</span>
            </div>
          )}
        </div>
      </div>

      <div className="card-footer">
        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
          Category: {complaint.category.replace('_', ' ')}
        </span>
        <button
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          onClick={() => onActionClick(complaint)}
        >
          <span>{actionLabel}</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
