// src/components/ExamplePrompts.jsx
import React from 'react';

const SAMPLE_PROMPTS = [
  "research web3 governance",
  "Explain RLHF in simple terms",
  "Write a short poem about curiosity",
  "Solve: integral of x^2 dx",
  "Generate a starter Next.js app structure"
];

const ExamplePrompts = ({ onExampleClick }) => {
  return (
    <div className="example-prompts" role="list">
      <p>Try one of these:</p>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {SAMPLE_PROMPTS.map((p, i) => (
          <button
            key={i}
            className="example-prompt-btn"
            onClick={() => onExampleClick ? onExampleClick(p) : null}
            style={{padding:'8px 12px', borderRadius:8, border:'none', background:'rgba(255,255,255,0.04)', color:'inherit', textAlign:'left'}}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExamplePrompts;