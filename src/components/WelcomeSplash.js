import React, { useState, useEffect, useCallback } from 'react';
import Lottie from 'lottie-react';
import chakraAnimation from '../assets/chakra.json';
import './WelcomeSplash.css';

export default function WelcomeSplash({ onEnter }) {
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem('aion_skip_splash');
      setDontShow(v === '1');
    } catch (e) {}
  }, []);

  const handleEnter = useCallback(() => {
    try {
      if (dontShow) localStorage.setItem('aion_skip_splash', '1');
    } catch (e) {}
    if (typeof onEnter === 'function') onEnter();
  }, [dontShow, onEnter]);

  // keyboard access: Enter or Space to enter; Esc to close splash (same as Enter)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleEnter();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleEnter();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleEnter]);

  return (
    <div className="welcome-splash" role="dialog" aria-modal="true" aria-label="Welcome to AION">
      <div className="splash-inner">
        <div className="splash-left">
          <div className="splash-badge">AION</div>
          <div className="splash-title">Welcome to AION</div>
          <div className="splash-sub">Living AI — your intelligent co‑pilot for expert workflows</div>

          <div className="splash-cta-row">
            <button className="splash-enter" onClick={handleEnter} aria-label="Enter AION">Enter AION</button>
            <button className="splash-about" onClick={() => window.location.hash = '#/about'}>About</button>
          </div>

          <div className="splash-options">
            <label className="dontshow">
              <input type="checkbox" checked={dontShow} onChange={(e)=>setDontShow(e.target.checked)} /> Don't show this again
            </label>
          </div>
        </div>

        <div className="splash-right" aria-hidden>
          <div className="splash-lottie">
            <Lottie animationData={chakraAnimation} loop={true} style={{ width: 320, height: 320 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
