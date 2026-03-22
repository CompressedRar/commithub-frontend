import React from 'react';

const StatCard = ({ icon, label, count, color = "primary", isSubtle = false }) => {
  // Styles for Department stats (bg-subtle, no border)
  const subtleClasses = `bg-${color}-subtle border-0 shadow-sm`;
  
  // Styles for Summary stats (white bg, thin border)
  const standardClasses = `bg-white border shadow-sm`;

  return (
    <div className={`card text-center rounded-4 h-100 ${isSubtle ? subtleClasses : standardClasses}`}>
      <div className="card-body d-flex flex-column align-items-center justify-content-center">
        <span className={`material-symbols-outlined text-${color} fs-1 mb-2`}>
          {icon}
        </span>
        <h4 className="fw-bold mb-0">
          {count?.toLocaleString() ?? 0}
        </h4>
        <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
          {label}
        </small>
      </div>
    </div>
  );
};

export default StatCard;