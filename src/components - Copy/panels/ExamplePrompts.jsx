// src/components/ExamplePrompts.jsx
import React, { useState } from 'react';
import './ExamplePrompts.css';

const SAMPLE_PROMPTS = [
  {
    text: "Research web3 governance models",
    category: "research",
    icon: "🔍"
  },
  {
    text: "Explain RLHF in simple terms",
    category: "explain",
    icon: "📚"
  },
  {
    text: "Write a short poem about curiosity",
    category: "creative",
    icon: "✍️"
  },
  {
    text: "Solve: integral of x^2 dx",
    category: "math",
    icon: "∫"
  },
  {
    text: "Generate a starter Next.js app structure",
    category: "code",
    icon: "💻"
  },
  {
    text: "What's the latest in AI safety research?",
    category: "research",
    icon: "🤖"
  },
  {
    text: "How does quantum computing work?",
    category: "explain",
    icon: "⚛️"
  },
  {
    text: "Create a short story about space exploration",
    category: "creative",
    icon: "🚀"
  }
];

const ExamplePrompts = ({ onExampleClick }) => {
  const [activeCategory, setActiveCategory] = useState("all");
  
  const categories = [
    { id: "all", name: "All Prompts", icon: "⭐" },
    { id: "research", name: "Research", icon: "🔍" },
    { id: "explain", name: "Explain", icon: "📚" },
    { id: "creative", name: "Creative", icon: "✍️" },
    { id: "math", name: "Math", icon: "∫" },
    { id: "code", name: "Code", icon: "💻" }
  ];

  const filteredPrompts = activeCategory === "all" 
    ? SAMPLE_PROMPTS 
    : SAMPLE_PROMPTS.filter(prompt => prompt.category === activeCategory);

  return (
    <div className="example-prompts-container">
      <h3>Try asking me something</h3>
      <p>Select a category or try one of these example prompts:</p>
      
      <div className="prompt-categories">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>
      
      <div className="example-prompts-grid">
        {filteredPrompts.map((prompt, index) => (
          <div
            key={index}
            className="example-prompt-card"
            onClick={() => onExampleClick ? onExampleClick(prompt.text) : null}
          >
            <div className="prompt-icon">{prompt.icon}</div>
            <div className="prompt-text">{prompt.text}</div>
            <div className="prompt-category">{prompt.category}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamplePrompts;