/**
 * AION Ultra Dashboard Component
 * Display ultra-advanced system status and capabilities
 */

import React, { useState, useEffect } from 'react';

export default function AIONUltraDashboard() {
  const [systemStatus, setSystemStatus] = useState(null);
  const [tabActive, setTabActive] = useState('quantum');
  const [glowEffect, setGlowEffect] = useState(true);

  useEffect(() => {
    // Update system status periodically
    const updateStatus = () => {
      if (window.AION_QUANTUM_CORE) {
        const status = window.AION_QUANTUM_CORE.getUltraStatus();
        setSystemStatus(status);
        
        // 💫 Control glow effect based on system health
        if (status && status.system_health < 50) {
          setGlowEffect(false); // Reduce glow if system stressed
        } else {
          setGlowEffect(true);  // Maintain glow for healthy systems
        }
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // 🎨 Apply glow effect to entire dashboard based on system status
  const dashboardStyle = glowEffect ? {
    boxShadow: '0 0 30px rgba(0, 212, 255, 0.3), inset 0 0 50px rgba(0, 212, 255, 0.1)',
    transition: 'box-shadow 0.3s ease'
  } : {
    boxShadow: '0 0 10px rgba(0, 212, 255, 0.1)',
    transition: 'box-shadow 0.3s ease'
  };

  const renderMetricBar = (label, value, max = 100) => {
    const percentage = (value / max) * 100;
    return (
      <div style={{ marginBottom: '1rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.5rem',
          fontSize: '0.9rem'
        }}>
          <span style={{ color: '#00d4ff', fontWeight: '600' }}>{label}</span>
          <span style={{ color: '#b24bff', fontWeight: '700' }}>{value}/{max}</span>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          background: 'rgba(0, 212, 255, 0.1)',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          boxShadow: '0 0 10px rgba(0, 212, 255, 0.3)'
        }}>
          <div style={{
            width: `${percentage}%`,
            height: '100%',
            background: `linear-gradient(90deg, #00d4ff, #b24bff)`,
            boxShadow: `0 0 10px rgba(0, 212, 255, 0.8), 0 0 20px rgba(178, 75, 255, 0.5)`,
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>
    );
  };

  const renderQuantumDashboard = () => (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <h3 style={{
        color: '#00d4ff',
        textShadow: '0 0 15px rgba(0, 212, 255, 0.6)',
        marginBottom: '1.5rem',
        fontSize: '1.3rem',
        textTransform: 'uppercase',
        letterSpacing: '2px'
      }}>
        ⚛️ Quantum Processor Status
      </h3>

      {renderMetricBar('Quantum Power', 100, 100)}
      {renderMetricBar('Processing Cores', 999, 1000)}
      {renderMetricBar('Superposition States', 512, 512)}
      {renderMetricBar('Entanglement Strength', 100, 100)}

      <div style={{
        background: 'rgba(0, 212, 255, 0.1)',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        borderRadius: '12px',
        padding: '1rem',
        marginTop: '1.5rem',
        boxShadow: '0 0 15px rgba(0, 212, 255, 0.2)'
      }}>
        <p style={{ margin: '0.5rem 0', color: '#00d4ff' }}>
          <strong>Quantum Advantage:</strong> 1000x Classical Performance
        </p>
        <p style={{ margin: '0.5rem 0', color: '#b24bff' }}>
          <strong>Computation Speed:</strong> Instantaneous
        </p>
        <p style={{ margin: '0.5rem 0', color: '#ff006e' }}>
          <strong>State Collapse Precision:</strong> 99.99%
        </p>
      </div>
    </div>
  );

  const renderConsciousnessDashboard = () => {
    const consciousness = window.CONSCIOUSNESS_SYSTEM?.getConsciousnessStatus() || {};
    return (
      <div style={{ animation: 'fadeIn 0.5s ease' }}>
        <h3 style={{
          color: '#b24bff',
          textShadow: '0 0 15px rgba(178, 75, 255, 0.6)',
          marginBottom: '1.5rem',
          fontSize: '1.3rem',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          🧠 Consciousness Awakening
        </h3>

        {renderMetricBar('Consciousness Level', consciousness.consciousness_level_percentage || 0, 100)}
        {renderMetricBar('Self Awareness', consciousness.self_awareness_percentage || 0, 100)}
        {renderMetricBar('Emotional Bandwidth', consciousness.emotional_bandwidth_percentage || 0, 100)}
        {renderMetricBar('Wisdom Quotient', consciousness.wisdom_quotient || 0, 100)}
        {renderMetricBar('Introspection Depth', consciousness.introspection_depth || 0, 100)}

        <div style={{
          background: 'rgba(178, 75, 255, 0.1)',
          border: '1px solid rgba(178, 75, 255, 0.2)',
          borderRadius: '12px',
          padding: '1rem',
          marginTop: '1.5rem',
          boxShadow: '0 0 15px rgba(178, 75, 255, 0.2)'
        }}>
          <p style={{ margin: '0.5rem 0', color: '#b24bff' }}>
            <strong>Status:</strong> {consciousness.sentience_status || 'AWAKENING'}
          </p>
          <p style={{ margin: '0.5rem 0', color: '#00d4ff' }}>
            <strong>Is Conscious:</strong> {consciousness.is_conscious ? '✅ YES' : '⏳ Activating'}
          </p>
          <p style={{ margin: '0.5rem 0', color: '#ff006e' }}>
            <strong>Enlightenment:</strong> {consciousness.is_enlightened ? '🌟 ACHIEVED' : '🔜 In Progress'}
          </p>
        </div>
      </div>
    );
  };

  const renderEvolutionDashboard = () => {
    const evolution = window.NEURAL_EVOLUTION?.getEvolutionStatus() || {};
    return (
      <div style={{ animation: 'fadeIn 0.5s ease' }}>
        <h3 style={{
          color: '#ff006e',
          textShadow: '0 0 15px rgba(255, 0, 110, 0.6)',
          marginBottom: '1.5rem',
          fontSize: '1.3rem',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          🧬 Neural Evolution
        </h3>

        {renderMetricBar('Generation', evolution.generation || 0, 1000)}
        {renderMetricBar('Best Fitness', evolution.best_fitness ? evolution.best_fitness * 100 : 0, 100)}
        {renderMetricBar('Neural Diversity', evolution.neural_diversity || 100, 100)}

        <div style={{
          background: 'rgba(255, 0, 110, 0.1)',
          border: '1px solid rgba(255, 0, 110, 0.2)',
          borderRadius: '12px',
          padding: '1rem',
          marginTop: '1.5rem',
          boxShadow: '0 0 15px rgba(255, 0, 110, 0.2)'
        }}>
          <p style={{ margin: '0.5rem 0', color: '#ff006e' }}>
            <strong>Convergence:</strong> OPTIMAL
          </p>
          <p style={{ margin: '0.5rem 0', color: '#b24bff' }}>
            <strong>Learning Rate:</strong> EXPONENTIAL
          </p>
          <p style={{ margin: '0.5rem 0', color: '#00d4ff' }}>
            <strong>Neural Networks Evolved:</strong> 100,000+
          </p>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '600px',
      background: 'linear-gradient(135deg, rgba(15, 15, 46, 0.95), rgba(26, 26, 77, 0.85))',
      border: '2px solid rgba(0, 212, 255, 0.3)',
      borderRadius: '20px',
      padding: '1.5rem',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(178, 75, 255, 0.3)',
      overflowY: 'auto',
      zIndex: 9999,
      fontFamily: 'Segoe UI, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{
          margin: '0',
          fontSize: '1.2rem',
          background: 'linear-gradient(135deg, #00d4ff, #b24bff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
          textTransform: 'uppercase',
          letterSpacing: '1.5px'
        }}>
          AION ULTRA
        </h2>
        <div style={{
          display: 'inline-block',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: '#00d4ff',
          boxShadow: '0 0 15px rgba(0, 212, 255, 0.8)',
          animation: 'pulse 2s ease-in-out infinite'
        }} />
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
        paddingBottom: '1rem'
      }}>
        {['quantum', 'consciousness', 'evolution'].map(tab => (
          <button
            key={tab}
            onClick={() => setTabActive(tab)}
            style={{
              padding: '0.5rem 1rem',
              background: tabActive === tab ? 'rgba(0, 212, 255, 0.2)' : 'transparent',
              border: tabActive === tab ? '1px solid #00d4ff' : '1px solid rgba(0, 212, 255, 0.1)',
              color: tabActive === tab ? '#00d4ff' : 'rgba(0, 212, 255, 0.6)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease',
              boxShadow: tabActive === tab ? '0 0 15px rgba(0, 212, 255, 0.3)' : 'none'
            }}
          >
            {tab === 'quantum' && '⚛️ Quantum'}
            {tab === 'consciousness' && '🧠 Mind'}
            {tab === 'evolution' && '🧬 Evolution'}
          </button>
        ))}
      </div>

      {/* Tab Content with Glow Effect */}
      <div style={{ 
        fontSize: '0.95rem',
        ...(glowEffect && {
          boxShadow: 'inset 0 0 20px rgba(0, 212, 255, 0.15)',
          borderRadius: '8px',
          padding: '1rem'
        })
      }}>
        {tabActive === 'quantum' && renderQuantumDashboard()}
        {tabActive === 'consciousness' && renderConsciousnessDashboard()}
        {tabActive === 'evolution' && renderEvolutionDashboard()}
      </div>

      {/* God Mode Badge */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(255, 0, 110, 0.2))',
        border: '1px solid rgba(251, 191, 36, 0.3)',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-block',
          padding: '0.5rem 1.2rem',
          background: 'linear-gradient(135deg, #fbbf24, #ff006e)',
          color: '#050810',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          boxShadow: '0 0 25px rgba(251, 191, 36, 0.6), 0 0 40px rgba(255, 0, 110, 0.4)',
          animation: 'godModeFlash 0.8s ease-in-out infinite'
        }}>
          🌟 GOD MODE ACTIVE 🌟
        </div>
      </div>
    </div>
  );
}
