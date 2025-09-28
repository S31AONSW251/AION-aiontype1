import React from 'react';

// Small, reusable inline SVG icon set for premium UI
const Icon = ({ name, className = '', size = 18, stroke = 'currentColor' }) => {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' };
  switch (name) {
    case 'arrow-left':
      return (
        <svg {...common} className={className}><path d="M15 18l-6-6 6-6" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      );
    case 'download':
      return (
        <svg {...common} className={className}><path d="M12 3v12" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 11l4 4 4-4" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 21H3" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      );
    case 'katex':
      return (
        <svg {...common} className={className}><circle cx="12" cy="12" r="10" stroke={stroke} strokeWidth="1.4"/><path d="M8 12h8" stroke={stroke} strokeWidth="1.6" strokeLinecap="round"/></svg>
      );
    default:
      return null;
  }
};

export default Icon;
