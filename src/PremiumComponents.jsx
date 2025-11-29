// ════════════════════════════════════════════════════════════════════════════════
// AION PREMIUM COMPONENT TEMPLATES
// Ready-to-use component examples for premium design implementation
// ════════════════════════════════════════════════════════════════════════════════

import React from 'react';

// ════════════════════════════════════════════════════════════════════════════════
// PREMIUM HEADER/NAVIGATION COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

export const PremiumHeader = () => {
  return (
    <nav className="nav-premium">
      <div className="nav-premium-inner">
        <div className="nav-premium-logo">AION</div>
        <ul className="nav-premium-menu">
          <li><a href="#home" className="nav-premium-link">Home</a></li>
          <li><a href="#features" className="nav-premium-link">Features</a></li>
          <li><a href="#services" className="nav-premium-link">Services</a></li>
          <li><a href="#about" className="nav-premium-link">About</a></li>
        </ul>
        <button className="btn-premium btn-premium-primary">Get Started</button>
      </div>
    </nav>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// PREMIUM CARD COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

export const PremiumCard = ({ title, description, icon, children }) => {
  return (
    <div className="card-premium">
      <div className="card-premium-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {icon && <span style={{ fontSize: '1.5rem' }}>{icon}</span>}
          <h3 style={{ margin: 0 }}>{title}</h3>
        </div>
      </div>
      {description && (
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '12px' }}>
          {description}
        </p>
      )}
      <div className="card-premium-body">
        {children}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// PREMIUM BUTTON COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

export const PremiumButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  onClick,
  disabled = false,
  ...props 
}) => {
  const sizeClass = {
    sm: { padding: '8px 16px', fontSize: '0.85rem' },
    md: { padding: '12px 24px', fontSize: '0.95rem' },
    lg: { padding: '14px 32px', fontSize: '1rem' },
  };

  return (
    <button
      className={`btn-premium btn-premium-${variant}`}
      onClick={onClick}
      disabled={disabled}
      style={sizeClass[size]}
      {...props}
    >
      {children}
    </button>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// PREMIUM INPUT COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

export const PremiumInput = ({ 
  label, 
  placeholder, 
  value, 
  onChange,
  type = 'text',
  error = false,
  ...props 
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {label && (
        <label style={{
          fontSize: '0.9rem',
          fontWeight: '500',
          color: 'rgba(255, 255, 255, 0.8)',
        }}>
          {label}
        </label>
      )}
      <input
        type={type}
        className="input-premium"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={error ? { borderColor: '#ff6b6b' } : {}}
        {...props}
      />
      {error && (
        <span style={{ fontSize: '0.85rem', color: '#ff6b6b' }}>
          {error}
        </span>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// PREMIUM PANEL/SECTION COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

export const PremiumPanel = ({ title, subtitle, children, actions }) => {
  return (
    <div className="panel-premium">
      <div className="panel-premium-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions && <div style={{ display: 'flex', gap: '12px' }}>{actions}</div>}
        </div>
      </div>
      <div style={{ marginTop: '20px' }}>
        {children}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// PREMIUM BADGE COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

export const PremiumBadge = ({ children, variant = 'default' }) => {
  const variantClass = {
    default: 'badge-premium',
    primary: 'badge-premium-primary',
    success: 'badge-premium-success',
  };

  return (
    <span className={variantClass[variant]}>
      {children}
    </span>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// PREMIUM DIVIDER COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

export const PremiumDivider = ({ style }) => {
  return <div className="divider-premium" style={style} />;
};

// ════════════════════════════════════════════════════════════════════════════════
// PREMIUM TEXT COMPONENTS
// ════════════════════════════════════════════════════════════════════════════════

export const PremiumHeading = ({ level = 1, children, gradient = false }) => {
  const Tag = `h${level}`;
  return (
    <Tag className={gradient ? 'text-premium-gradient' : ''}>
      {children}
    </Tag>
  );
};

export const PremiumText = ({ children, muted = false, light = false }) => {
  let className = '';
  if (muted) className = 'text-premium-muted';
  if (light) className = 'text-premium-light';
  
  return <p className={className}>{children}</p>;
};

// ════════════════════════════════════════════════════════════════════════════════
// PREMIUM FEATURE GRID COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

export const PremiumFeatureGrid = ({ features }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
      marginTop: '24px',
    }}>
      {features.map((feature, idx) => (
        <PremiumCard
          key={idx}
          title={feature.title}
          description={feature.description}
          icon={feature.icon}
        >
          {feature.content}
        </PremiumCard>
      ))}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// PREMIUM LOADING ANIMATION COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

export const PremiumLoader = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '20px',
    }}>
      <div
        className="element-premium-pulse"
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: 'var(--premium-gradient-primary)',
        }}
      />
      <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Loading...</p>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// PREMIUM MODAL COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

export const PremiumModal = ({ isOpen, title, children, onClose, actions }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(8px)',
    }}>
      <div className="card-premium" style={{
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '20px',
          borderBottom: 'var(--premium-border-thin)',
        }}>
          <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#e8f0ff',
              cursor: 'pointer',
              fontSize: '1.5rem',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          {children}
        </div>

        {actions && (
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: 'var(--premium-border-thin)',
          }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// PREMIUM STATS CARD COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

export const PremiumStatsCard = ({ label, value, icon, trend }) => {
  return (
    <div className="card-premium" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{icon}</div>
      <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: '0 0 8px 0' }}>
        {label}
      </p>
      <h3 style={{
        margin: 0,
        fontSize: '2rem',
        fontWeight: 'bold',
        background: 'var(--premium-gradient-primary)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        {value}
      </h3>
      {trend && (
        <p style={{
          margin: '8px 0 0 0',
          fontSize: '0.85rem',
          color: trend > 0 ? '#4cff8a' : '#ff6b6b',
        }}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last period
        </p>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// PREMIUM TOOLTIP COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

export const PremiumTooltip = ({ text, children, position = 'top' }) => {
  const [show, setShow] = React.useState(false);

  const positionStyles = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%) translateY(-8px)' },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%) translateY(8px)' },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%) translateX(-8px)' },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%) translateX(8px)' },
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div style={{
          position: 'absolute',
          ...positionStyles[position],
          background: 'rgba(0, 0, 0, 0.9)',
          color: '#e8f0ff',
          padding: '8px 12px',
          borderRadius: 'var(--premium-radius-md)',
          fontSize: '0.85rem',
          whiteSpace: 'nowrap',
          zIndex: 1000,
          border: 'var(--premium-border-thin)',
        }}>
          {text}
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// EXPORT ALL COMPONENTS
// ════════════════════════════════════════════════════════════════════════════════

export default {
  PremiumHeader,
  PremiumCard,
  PremiumButton,
  PremiumInput,
  PremiumPanel,
  PremiumBadge,
  PremiumDivider,
  PremiumHeading,
  PremiumText,
  PremiumFeatureGrid,
  PremiumLoader,
  PremiumModal,
  PremiumStatsCard,
  PremiumTooltip,
};
