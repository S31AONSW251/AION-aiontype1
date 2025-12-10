import React from 'react';
import './styles/aion-ultra-theme.css';
import Header from './components/Header';
import RagPanel from './components/RagPanel';

// Lightweight full UI with RAG panel integrated. Uses the shared Header and
// theme so the app looks cohesive and attractive immediately.
export default function AppFull() {
  return (
    <div className="aion-app">
      <Header />
      <main style={{ padding: 20 }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ background: 'linear-gradient(180deg, rgba(4,6,12,0.5), rgba(6,9,18,0.6))', padding: 16, borderRadius: 12, boxShadow: '0 6px 18px rgba(2,8,20,0.6)' }}>
            <RagPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
