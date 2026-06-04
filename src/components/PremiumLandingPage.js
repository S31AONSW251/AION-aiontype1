import React from 'react';
import '../styles/premium-landing.css';

const PremiumLandingPage = ({ onEnter }) => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTryAion = () => {
    if (onEnter) {
      onEnter();
    }
  };

  return (
    <div className="premium-landing">
      {/* ===== NAVBAR ===== */}
      <nav className="landing-navbar">
        <div className="landing-navbar-left">
          <div className="landing-logo">
            AION <span className="landing-logo-accent">TYPE 1</span>
          </div>
          <ul className="landing-nav-menu">
            <li><button onClick={() => scrollToSection('hero')} style={{background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit'}}>Platform</button></li>
            <li><button onClick={() => scrollToSection('capabilities')} style={{background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit'}}>Capabilities</button></li>
            <li><button onClick={() => scrollToSection('architecture')} style={{background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit'}}>Technology</button></li>
            <li><button onClick={() => scrollToSection('investor')} style={{background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit'}}>Business</button></li>
            <li><button onClick={() => scrollToSection('launch')} style={{background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit'}}>Launch</button></li>
            <li><button onClick={() => scrollToSection('contact')} style={{background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit'}}>Contact</button></li>
          </ul>
        </div>
        <div className="landing-navbar-right">
          <button className="landing-btn landing-btn-secondary" onClick={handleTryAion}>
            Get Access
          </button>
          <button 
            className="landing-btn landing-btn-primary"
            onClick={() => scrollToSection('investor')}
          >
            For Investors
          </button>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section id="hero" className="landing-hero">
        <div className="landing-hero-left">
          <div className="landing-hero-label">The Next Generation of Intelligence</div>
          <h1 className="landing-hero-title">
            <strong>Private Intelligence</strong><br />Operating System
          </h1>
          <h2 className="landing-hero-subtitle">
            Enterprise-grade AI built for memory, reasoning, automation, and execution. 
            Your intelligence. Your control.
          </h2>
          <p className="landing-hero-subtext">
            AION Type 1 is a sophisticated intelligence operating system designed for builders, creators, and enterprises 
            that demand persistent memory, deep reasoning, autonomous automation, and seamless product execution—all 
            under complete privacy and ownership.
          </p>
          <div className="landing-hero-buttons">
            <button 
              className="landing-hero-btn landing-hero-btn-primary"
              onClick={handleTryAion}
            >
              Try AION Now
            </button>
            <button 
              className="landing-hero-btn landing-hero-btn-secondary"
              onClick={() => scrollToSection('capabilities')}
            >
              Explore Features
            </button>
            <button 
              className="landing-hero-btn landing-hero-btn-secondary"
              onClick={() => scrollToSection('investor')}
            >
              For Investors
            </button>
          </div>
        </div>

        <div className="landing-hero-right">
          <div className="landing-hero-cards">
            <div className="landing-hero-card">
              <div className="landing-hero-card-icon">🧠</div>
              <h3 className="landing-hero-card-title">Persistent Memory</h3>
            </div>
            <div className="landing-hero-card">
              <div className="landing-hero-card-icon">⚡</div>
              <h3 className="landing-hero-card-title">Deep Reasoning</h3>
            </div>
            <div className="landing-hero-card">
              <div className="landing-hero-card-icon">🔄</div>
              <h3 className="landing-hero-card-title">Smart Automation</h3>
            </div>
            <div className="landing-hero-card">
              <div className="landing-hero-card-icon">🎨</div>
              <h3 className="landing-hero-card-title">Creative Generation</h3>
            </div>
            <div className="landing-hero-card">
              <div className="landing-hero-card-icon">🔒</div>
              <h3 className="landing-hero-card-title">Private by Design</h3>
            </div>
            <div className="landing-hero-card">
              <div className="landing-hero-card-icon">⚙️</div>
              <h3 className="landing-hero-card-title">Full Control</h3>
            </div>
          </div>
        </div>
      </section>

      <div className="landing-divider"></div>

      {/* ===== CAPABILITIES SECTION ===== */}
      <section id="capabilities" className="landing-section">
        <div className="landing-section-header">
          <div className="landing-section-eyebrow">Core Capabilities</div>
          <h2 className="landing-section-title">Beyond Conversation</h2>
          <p className="landing-section-subtitle">
            Engineered for sophisticated problem-solving, creative execution, and long-term autonomous intelligence.
          </p>
        </div>

        <div className="landing-cards-grid">
          <div className="landing-feature-card">
            <div className="landing-feature-icon">📚</div>
            <h3 className="landing-feature-title">Episodic Memory System</h3>
            <p className="landing-feature-description">
              Maintains persistent context across infinite conversations. 
              Learn from projects, preferences, and patterns. Intelligence that evolves with time.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon">🧩</div>
            <h3 className="landing-feature-title">Structured Reasoning</h3>
            <p className="landing-feature-description">
              Decompose complex problems systematically. 
              Generate actionable plans. Execute with precision and measurable outcomes.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon">⚙️</div>
            <h3 className="landing-feature-title">Intelligent Automation</h3>
            <p className="landing-feature-description">
              Orchestrate workflows, manage documents, organize knowledge. 
              Automate repetitive work. Focus on strategy and creativity.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon">🎨</div>
            <h3 className="landing-feature-title">Creative Execution</h3>
            <p className="landing-feature-description">
              Generate content, images, documents, and product materials. 
              Transform vision into execution-ready outputs with consistent quality.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon">🏠</div>
            <h3 className="landing-feature-title">Local Intelligence</h3>
            <p className="landing-feature-description">
              Runs on your infrastructure with zero data exfiltration. 
              Complete privacy, complete ownership, complete control over your intelligence.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon">👨‍💼</div>
            <h3 className="landing-feature-title">Execution Environment</h3>
            <p className="landing-feature-description">
              Designed for founders, engineers, researchers, and creators. 
              The operating system for ambitious work and ambitious teams.
            </p>
          </div>
        </div>
      </section>

      <div className="landing-divider"></div>

      {/* ===== ARCHITECTURE SECTION ===== */}
      <section id="architecture" className="landing-section">
        <div className="landing-section-header">
          <div className="landing-section-eyebrow">Technical Foundation</div>
          <h2 className="landing-section-title">Eight-Layer Intelligence Stack</h2>
          <p className="landing-section-subtitle">
            Sophisticated architecture designed for reasoning, memory, autonomy, and long-term execution.
          </p>
        </div>

        <div className="landing-architecture">
          <div className="landing-architecture-grid">
            <div className="landing-architecture-layer">
              <h4 className="landing-architecture-layer-name">Interface & Interaction</h4>
              <p className="landing-architecture-layer-desc">Multi-modal user experience and advanced UX</p>
            </div>
            <div className="landing-architecture-layer">
              <h4 className="landing-architecture-layer-name">Episodic Memory</h4>
              <p className="landing-architecture-layer-desc">Long-term persistent knowledge management</p>
            </div>
            <div className="landing-architecture-layer">
              <h4 className="landing-architecture-layer-name">Reasoning Engine</h4>
              <p className="landing-architecture-layer-desc">Logical decomposition and synthesis</p>
            </div>
            <div className="landing-architecture-layer">
              <h4 className="landing-architecture-layer-name">Automation Framework</h4>
              <p className="landing-architecture-layer-desc">Workflow orchestration and execution</p>
            </div>
            <div className="landing-architecture-layer">
              <h4 className="landing-architecture-layer-name">Creative Generation</h4>
              <p className="landing-architecture-layer-desc">Content, media, and product synthesis</p>
            </div>
            <div className="landing-architecture-layer">
              <h4 className="landing-architecture-layer-name">Knowledge Integration</h4>
              <p className="landing-architecture-layer-desc">Semantic understanding and context</p>
            </div>
            <div className="landing-architecture-layer">
              <h4 className="landing-architecture-layer-name">Private Inference</h4>
              <p className="landing-architecture-layer-desc">On-device models and local execution</p>
            </div>
            <div className="landing-architecture-layer">
              <h4 className="landing-architecture-layer-name">Security & Encryption</h4>
              <p className="landing-architecture-layer-desc">End-to-end privacy and access control</p>
            </div>
          </div>
        </div>
      </section>

      <div className="landing-divider"></div>

      {/* ===== COMMAND CENTER SECTION ===== */}
      <section className="landing-section">
        <div className="landing-section-header">
          <div className="landing-section-eyebrow">System Overview</div>
          <h2 className="landing-section-title">Intelligence Dashboard</h2>
          <p className="landing-section-subtitle">
            Real-time monitoring of system health, knowledge, and execution metrics.
          </p>
        </div>

        <div className="landing-dashboard">
          <div className="landing-dashboard-header">
            <div className="landing-dashboard-indicator"></div>
            <h3 className="landing-dashboard-title">AION Type 1 — System Status</h3>
          </div>

          <div className="landing-dashboard-grid">
            <div className="landing-dashboard-stat">
              <h4 className="landing-dashboard-value">99.8%</h4>
              <p className="landing-dashboard-label">System Health</p>
            </div>
            <div className="landing-dashboard-stat">
              <h4 className="landing-dashboard-value">2.4M</h4>
              <p className="landing-dashboard-label">Memory Items</p>
            </div>
            <div className="landing-dashboard-stat">
              <h4 className="landing-dashboard-value">847B</h4>
              <p className="landing-dashboard-label">Knowledge Tokens</p>
            </div>
            <div className="landing-dashboard-stat">
              <h4 className="landing-dashboard-value">1.2K</h4>
              <p className="landing-dashboard-label">Active Reasoning Chains</p>
            </div>
            <div className="landing-dashboard-stat">
              <h4 className="landing-dashboard-value">99.99%</h4>
              <p className="landing-dashboard-label">Uptime</p>
            </div>
            <div className="landing-dashboard-stat">
              <h4 className="landing-dashboard-value">34ms</h4>
              <p className="landing-dashboard-label">Avg Inference Time</p>
            </div>
          </div>
        </div>
      </section>

      <div className="landing-divider"></div>

      {/* ===== INVESTOR SECTION ===== */}
      <section id="investor" className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-section-title">
            The future belongs to private,<br />
            <span className="landing-cta-title-accent">intelligent</span> platforms.
          </h2>
          <p className="landing-section-subtitle">
            AION Type 1 is the operating system for the next generation of autonomous intelligence.
          </p>
        </div>

        <div className="landing-investor-grid">
          <div className="landing-investor-card">
            <h4 className="landing-investor-card-label">Market Position</h4>
            <h3 className="landing-investor-card-title">$203B Opportunity</h3>
            <div className="landing-investor-items">
              <div className="landing-investor-item">$47B in personal productivity AI</div>
              <div className="landing-investor-item">$156B in enterprise automation</div>
              <div className="landing-investor-item">Shift from assistant to OS model</div>
              <div className="landing-investor-item">Privacy-first demand accelerating</div>
            </div>
          </div>

          <div className="landing-investor-card">
            <h4 className="landing-investor-card-label">Key Advantages</h4>
            <h3 className="landing-investor-card-title">Competitive Moat</h3>
            <div className="landing-investor-items">
              <div className="landing-investor-item">Memory-first architecture</div>
              <div className="landing-investor-item">Private-by-design infrastructure</div>
              <div className="landing-investor-item">Sophisticated reasoning layer</div>
              <div className="landing-investor-item">Ownership and data control</div>
            </div>
          </div>

          <div className="landing-investor-card">
            <h4 className="landing-investor-card-label">Target Markets</h4>
            <h3 className="landing-investor-card-title">Addressable Segments</h3>
            <div className="landing-investor-items">
              <div className="landing-investor-item">Founders & product executives</div>
              <div className="landing-investor-item">Enterprise R&D and research</div>
              <div className="landing-investor-item">Creative professionals & studios</div>
              <div className="landing-investor-item">Mission-critical automation</div>
            </div>
          </div>

          <div className="landing-investor-card">
            <h4 className="landing-investor-card-label">Revenue Strategy</h4>
            <h3 className="landing-investor-card-title">Business Model</h3>
            <div className="landing-investor-items">
              <div className="landing-investor-item">Freemium personal tier</div>
              <div className="landing-investor-item">Pro tier: $49-99/month</div>
              <div className="landing-investor-item">Enterprise licensing & support</div>
              <div className="landing-investor-item">API marketplace & partners</div>
            </div>
          </div>
        </div>

        <div className="landing-section-header" style={{ marginTop: '80px', marginBottom: '40px' }}>
          <div className="landing-section-eyebrow">Development Timeline</div>
          <h3 className="landing-section-title" style={{ fontSize: '40px' }}>Roadmap to Impact</h3>
        </div>

        <div className="landing-roadmap">
          <div className="landing-roadmap-item">
            <h4 className="landing-roadmap-phase">Alpha Release</h4>
            <p className="landing-roadmap-desc">Core intelligence with private memory. Foundation layer complete.</p>
          </div>
          <div className="landing-roadmap-item">
            <h4 className="landing-roadmap-phase">Private Access</h4>
            <p className="landing-roadmap-desc">Founder & investor early access. Core feedback and partnerships.</p>
          </div>
          <div className="landing-roadmap-item">
            <h4 className="landing-roadmap-phase">Public Beta</h4>
            <p className="landing-roadmap-desc">General availability. Enterprise feature set launch.</p>
          </div>
          <div className="landing-roadmap-item">
            <h4 className="landing-roadmap-phase">Ecosystem</h4>
            <p className="landing-roadmap-desc">Partner integrations, extensions, and marketplace launch.</p>
          </div>
        </div>
      </section>

      <div className="landing-divider"></div>

      {/* ===== LAUNCH SECTION ===== */}
      <section id="launch" className="landing-section">
        <div className="landing-launch">
          <h2 className="landing-launch-title">Available Now</h2>
          <p className="landing-launch-subtitle">
            Get early access to AION Type 1. Investors and founders receive priority beta access and dedicated support.
          </p>
          <h3 className="landing-launch-date">June 2026</h3>
          <p className="landing-launch-detail">
            Join the private beta program or schedule a founders call to explore partnership opportunities and technical implementation.
          </p>
        </div>
      </section>

      <div className="landing-divider"></div>

      {/* ===== FINAL CTA SECTION ===== */}
      <section className="landing-final-cta">
        <h2 className="landing-cta-title">
          Intelligence that <strong>remembers.</strong><br />
          Systems that <strong>execute.</strong>
        </h2>
        <p className="landing-cta-subtitle">
          Join founders, researchers, and enterprises building the future with AION Type 1.
        </p>

        <div className="landing-cta-buttons">
          <button 
            className="landing-cta-btn landing-cta-btn-primary"
            onClick={handleTryAion}
          >
            Get Early Access
          </button>
          <button 
            className="landing-cta-btn landing-cta-btn-secondary"
            onClick={() => scrollToSection('investor')}
          >
            Schedule Investor Call
          </button>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer" id="contact">
        <p>
          © 2026 RIA Intelligence Labs. AION Type 1 — Private Intelligence OS.
          <br />
          <button onClick={() => {}} style={{ marginLeft: '0px', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit' }}>hello@aion.ai</button> | 
          <button onClick={() => {}} style={{ marginLeft: '12px', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</button> | 
          <button onClick={() => {}} style={{ marginLeft: '12px', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}>Terms of Service</button>
        </p>
      </footer>
    </div>
  );
};

export default PremiumLandingPage;
