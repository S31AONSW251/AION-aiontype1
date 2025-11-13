import React, { useState } from 'react';

// LazyImage now uses global shared classes defined in src/App.css so the
// implementation is shared across panels. This avoids relying on module CSS
// that was previously duplicated.
const LazyImage = ({ src, alt, className = '', style = {}, onClick }) => {
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState(false);

  const wrapperClass = `aion-lazy-wrapper ${className || ''}`.trim();
  const imgClass = `aion-lazy-img ${loaded ? 'loaded' : ''}`.trim();

  if (!src) {
    return (
      <div className={wrapperClass} style={style} onClick={onClick}>
        <div className="aion-placeholder-svg" aria-hidden>
          <svg width="64" height="48" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="48" rx="6" fill="rgba(255,255,255,0.02)" />
            <path d="M8 34L22 20L34 30L46 18L56 30V38H8V34Z" fill="rgba(255,255,255,0.06)" />
            <circle cx="14" cy="14" r="4" fill="rgba(255,255,255,0.04)" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClass} style={style} onClick={onClick}>
      {!loaded && !err && <div className="aion-shimmer" aria-hidden />}

      {err && (
        <div className="aion-placeholder-svg" aria-hidden>
          <svg width="64" height="48" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="48" rx="6" fill="rgba(255,255,255,0.02)" />
            <path d="M8 34L22 20L34 30L46 18L56 30V38H8V34Z" fill="rgba(255,255,255,0.06)" />
            <circle cx="14" cy="14" r="4" fill="rgba(255,255,255,0.04)" />
          </svg>
        </div>
      )}

      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={imgClass}
        onLoad={() => setLoaded(true)}
        onError={() => setErr(true)}
        style={{ opacity: loaded && !err ? 1 : 0, transition: 'opacity .28s ease' }}
      />
    </div>
  );
};

export default LazyImage;
