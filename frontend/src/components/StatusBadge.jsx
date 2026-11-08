import React from 'react';
import { Clock, CheckCircle, AlertCircle, PlayCircle, XCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const getBadgeConfig = () => {
    switch (status) {
      case 'SUBMITTED':
        return { label: 'Submitted', class: 'badge-submitted', icon: Clock };
      case 'ASSIGNED':
        return { label: 'Assigned', class: 'badge-assigned', icon: AlertCircle };
      case 'IN_PROGRESS':
        return { label: 'In Progress', class: 'badge-in_progress', icon: PlayCircle };
      case 'RESOLVED':
        return { label: 'Resolved', class: 'badge-resolved', icon: CheckCircle };
      case 'REJECTED':
        return { label: 'Rejected', class: 'badge-rejected', icon: XCircle };
      default:
        return { label: status, class: 'badge-submitted', icon: Clock };
    }
  };

  const { label, class: className, icon: Icon } = getBadgeConfig();

  return (
    <span className={`badge ${className}`}>
      <Icon size={12} />
      {label}
    </span>
  );
}
