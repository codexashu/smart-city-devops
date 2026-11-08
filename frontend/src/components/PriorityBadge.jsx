import React from 'react';

export default function PriorityBadge({ priority }) {
  const getPriorityClass = () => {
    switch (priority) {
      case 'CRITICAL':
        return 'priority-critical';
      case 'HIGH':
        return 'priority-high';
      case 'MEDIUM':
        return 'priority-medium';
      case 'LOW':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  };

  return (
    <span className={`badge ${getPriorityClass()}`}>
      {priority}
    </span>
  );
}
