import React, { useState, useEffect, useCallback } from 'react';
import Lottie from 'lottie-react';
import chakraAnimation from '../assets/chakra.json';
import './WelcomeSplash.css';
import './WelcomeSplash.override.css';

export default function WelcomeSplash({ onEnter }) {
  const [dontShow, setDontShow] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

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

  const openContactModal = useCallback((source) => {
    try { console.log('Contact modal opened from:', source); } catch (e) {}
    setShowContactModal(true);
  }, []);

  const submitContactForm = useCallback((e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      name: form.name.value || '',
      email: form.email.value || '',
      phone: form.phone.value || '',
      message: form.message.value || '',
      source: 'welcome_clean'
    };

    fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(async (res) => {
        if (!res.ok) throw new Error('network');
        const data = await res.json();
        try { console.log('contact saved', data); } catch (e) {}
        setShowContactModal(false);
        const subject = encodeURIComponent('AION Investor Inquiry from ' + (form.name.value || 'Interested Party'));
        const body = encodeURIComponent(`Name: ${form.name.value}\nEmail: ${form.email.value}\nPhone: ${form.phone.value || ''}\n\nMessage:\n${form.message.value}`);
        window.location.href = `mailto:balasudeep22@gmail.com?subject=${subject}&body=${body}`;
      })
      .catch((err) => {
        try { console.warn('contact POST failed, falling back to mailto', err); } catch (e) {}
        const subject = encodeURIComponent('AION Investor Inquiry from ' + (form.name.value || 'Interested Party'));
        const body = encodeURIComponent(`Name: ${form.name.value}\nEmail: ${form.email.value}\nPhone: ${form.phone.value || ''}\n\nMessage:\n${form.message.value}`);
        window.location.href = `mailto:balasudeep22@gmail.com?subject=${subject}&body=${body}`;
        setShowContactModal(false);
      });
  }, []);

  return (
    <div className="welcome-splash" role="dialog" aria-modal="true" aria-label="Welcome to AION">
      <div className="splash-card" role="document">
        <div className="splash-inner">
          <div className="splash-left">
            <div className="splash-badge">AION</div>
            <div className="splash-title">Welcome to AION</div>
            <div className="splash-sub">Building the world's most advanced AI — from software to robotics. Join us on the next frontier.</div>

            <div className="splash-cta-row">
              <button className="splash-enter" onClick={handleEnter} aria-label="Enter AION">Enter AION</button>
              <button className="splash-about" onClick={() => window.location.hash = '#/about'}>About</button>
            </div>

            <div className="splash-sections">
              <section className="section vision">
                <h3>Our Vision</h3>
                <p>To create the world's most advanced artificial intelligence systems — empowering humanity with safe, useful, and groundbreaking capabilities across research, industry, and robotics.</p>
              </section>

              <section className="section investors">
                <h3>Invest</h3>
                <p>We're building a multi-disciplinary organization: AI research, applied systems, and embodied intelligence (robotics). If you're an investor or partner seeking high-impact opportunities, we'd love to talk.</p>
                <div className="investor-cta">
                  <button className="btn-outline" onClick={() => openContactModal('investor_section')}>Contact Investors</button>
                </div>
              </section>

              <section className="section news">
                <h3>Latest AI News</h3>
                <div className="news-grid">
                  <article className="news-card">
                    <time>2025-11-01</time>
                    <h4>AION releases advanced reasoning prototype</h4>
                    <p>Our latest prototype demonstrates multi-step planning across perception and control — a big step toward embodied autonomy.</p>
                  </article>
                  <article className="news-card">
                    <time>2025-10-12</time>
                    <h4>Robotics lab partners with industry leaders</h4>
                    <p>New partnerships accelerate real-world testing environments for safe robot learning.</p>
                  </article>
                  <article className="news-card">
                    <time>2025-09-28</time>
                    <h4>Seed round announced</h4>
                    <p>We closed an initial funding round to expand research and product development.</p>
                  </article>
                </div>
              </section>
            </div>
          </div>

          <div className="splash-right" aria-hidden>
            <div className="splash-lottie" role="img" aria-label="AION animated logo">
              <Lottie animationData={chakraAnimation} loop={true} style={{ width: 360, height: 360 }} />
            </div>
            <div className="contact-cta">
              <button className="contact-btn" onClick={() => openContactModal('top_cta')}>Partner / Investor Enquiries</button>
            </div>
          </div>
        </div>
        {showContactModal && (
          <div className="contact-modal" role="dialog" aria-modal="true" aria-label="Contact Sudeep Bala">
            <div className="contact-modal-card">
              <button className="modal-close" onClick={() => setShowContactModal(false)} aria-label="Close contact form">×</button>
              <h3>Contact Sudeep Bala</h3>
              <form className="contact-form" onSubmit={submitContactForm}>
                <label>Name <input name="name" required /></label>
                <label>Email <input name="email" type="email" required /></label>
                <label>Phone <input name="phone" /></label>
                <label>Message <textarea name="message" rows={5} required /></label>
                <div className="modal-actions">
                  <button type="submit" className="splash-enter">Send via Email</button>
                  <button type="button" className="splash-about" onClick={() => setShowContactModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
