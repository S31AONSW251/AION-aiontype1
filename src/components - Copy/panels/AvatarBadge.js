import React from 'react';
import './ChatPanel.css';

const AvatarBadge = ({ initials = 'A', premium = false }) => {
  return (
    <div className={`avatar-badge ${premium ? 'premium' : ''}`} aria-hidden>
      <div className="avatar-circle">{initials}</div>
      {premium && <div className="premium-star">★</div>}
    </div>
  );
};

export default AvatarBadge;
