import React, { useState, useEffect, useRef, useCallback } from 'react';
// No direct toTex import from mathjs
import * as math from 'mathjs';
import MathEngine from '../../core/math.js';
import Icon from '../../components/ui/Icon';

const MathPanel = ({ mathSolution, settings, mathCanvasRef, setActiveTab, onSolveCustomProblem, setParentMathSolution }) => {
  const [customProblem, setCustomProblem] = useState('');
  const [inputHistory, setInputHistory] = useState([]);
  const fileNamePrefix = 'aion-math-solution';
  const [errorMsg, setErrorMsg] = useState('');
  const [showSteps, setShowSteps] = useState(settings.showMathSteps);
  const [selectedTab, setSelectedTab] = useState('solution');
  const [graphSettings, setGraphSettings] = useState({
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 10,
    step: 0.1
  });
  const [plotExpression, setPlotExpression] = useState('');
  const [isPlotting, setIsPlotting] = useState(false);
  const [solveMode, setSolveMode] = useState('local'); // 'local' or 'remote'
  const engineRef = useRef(null);

  // local override for solutions produced by MathEngine (won't change parent props)
  const [localMathSolution, setLocalMathSolution] = useState(null);

  // Canvas pan/zoom state
  const panRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const isPanningRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    renderAdvancedDiagram();
  }, [mathSolution, localMathSolution, graphSettings, plotExpression]);

  // initialize MathEngine once
  useEffect(() => {
    try {
      engineRef.current = new MathEngine();
    } catch (e) {
      console.warn('MathEngine failed to initialize', e);
    }
  }, []);

  // Keyboard shortcut: Ctrl+Enter to solve
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (customProblem.trim()) handleSolveCustom();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [customProblem]);

  // Canvas pan/zoom handlers
  useEffect(() => {
    const canvas = mathCanvasRef?.current;
    if (!canvas) return;

    const onWheel = (e) => {
      e.preventDefault();
      const delta = -e.deltaY;
      const factor = delta > 0 ? 1.08 : 0.92;
      scaleRef.current = Math.max(0.2, Math.min(6, scaleRef.current * factor));
      renderAdvancedDiagram();
    };

    const onMouseDown = (e) => {
      isPanningRef.current = true;
      lastPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isPanningRef.current) return;
      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      panRef.current.x += dx;
      panRef.current.y += dy;
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      renderAdvancedDiagram();
    };

    const onMouseUp = () => { isPanningRef.current = false; };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [mathCanvasRef, mathSolution, graphSettings, plotExpression]);

  const resetView = () => {
    panRef.current = { x: 0, y: 0 };
    scaleRef.current = 1;
    renderAdvancedDiagram();
  };

  const applyCanvasTransform = (ctx, canvas) => {
    ctx.setTransform(scaleRef.current, 0, 0, scaleRef.current, panRef.current.x, panRef.current.y);
  };

  const renderMathSteps = () => {
    const sol = localMathSolution || mathSolution;
    if (!sol || !sol.steps || !showSteps) return null;
    
    return (
      <div className="math-steps-container">
        <h4>Step-by-Step Solution:</h4>
        <ol className="math-steps-list">
          {mathSolution.steps.map((step, index) => (
            <li key={index} className="math-step">
              <div className="step-number">{index + 1}</div>
              <div className="step-content">{step}</div>
            </li>
          ))}
        </ol>
      </div>
    );
  };

  const renderAdvancedDiagram = () => {
    const sol = localMathSolution || mathSolution;
    if (!sol || !mathCanvasRef.current) return;
    const canvas = mathCanvasRef.current;
    const ctx = canvas.getContext('2d');
    // clear full canvas and reset transform, then apply our layer transform
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    applyCanvasTransform(ctx, canvas);
    
    // Enhanced visualization for different problem types
    if (sol.type === 'geometry') {
      renderGeometry(canvas, ctx, sol);
    } else if (sol.type === 'algebra' && sol.graphable) {
      renderGraph(canvas, ctx, sol);
    } else if (sol.type === 'calculus') {
      renderCalculusVisualization(canvas, ctx, sol);
    } else if (plotExpression) {
      renderCustomPlot(canvas, ctx, plotExpression);
    }
  };

  const renderGeometry = (canvas, ctx, solution) => {
    if (solution.subtype === 'circle') {
      const radius = solution.radius || 50;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Draw circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#4a90e2';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw radius
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.strokeStyle = '#e91e63';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw labels
      ctx.font = '14px Arial';
      ctx.fillStyle = '#333';
      ctx.fillText('r', centerX + radius / 2 - 10, centerY - 5);
      ctx.fillText(`Area = πr² = ${mathSolution.solution}`, centerX - 40, centerY + radius + 20);
    } else if (solution.subtype === 'triangle') {
      const base = solution.base || 100;
      const height = solution.height || 80;
      const centerX = canvas.width / 2 - base / 2;
      const centerY = canvas.height / 2 + height / 2;
      
      // Draw triangle
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + base, centerY);
      ctx.lineTo(centerX + base / 2, centerY - height);
      ctx.closePath();
      ctx.strokeStyle = '#4a90e2';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw height
      ctx.beginPath();
      ctx.moveTo(centerX + base / 2, centerY);
      ctx.lineTo(centerX + base / 2, centerY - height);
      ctx.strokeStyle = '#e91e63';
      ctx.setLineDash([5, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw labels
      ctx.font = '14px Arial';
      ctx.fillStyle = '#333';
      ctx.fillText('b', centerX + base / 2 - 10, centerY + 15);
      ctx.fillText('h', centerX + base / 2 + 5, centerY - height / 2);
      ctx.fillText(`Area = ½bh = ${mathSolution.solution}`, centerX, centerY + height + 20);
    } else if (solution.subtype === 'rectangle') {
      const width = solution.width || 120;
      const height = solution.height || 80;
      const centerX = canvas.width / 2 - width / 2;
      const centerY = canvas.height / 2 - height / 2;
      
      // Draw rectangle
      ctx.beginPath();
      ctx.rect(centerX, centerY, width, height);
      ctx.strokeStyle = '#4a90e2';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw dimensions
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 10);
      ctx.lineTo(centerX + width, centerY - 10);
      ctx.strokeStyle = '#e91e63';
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(centerX + width + 10, centerY);
      ctx.lineTo(centerX + width + 10, centerY + height);
      ctx.stroke();
      
      // Draw labels
      ctx.font = '14px Arial';
      ctx.fillStyle = '#333';
      ctx.fillText('w', centerX + width / 2 - 10, centerY - 15);
      ctx.fillText('h', centerX + width + 15, centerY + height / 2);
      ctx.fillText(`Area = w×h = ${mathSolution.solution}`, centerX, centerY + height + 20);
    }
  };

  const renderGraph = (canvas, ctx, solution) => {
    const { xMin, xMax, yMin, yMax, step } = graphSettings;
    const width = canvas.width;
    const height = canvas.height;
    
    // Draw coordinate system
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    
    // Draw x-axis
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Draw y-axis
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    
    // Draw grid
    ctx.strokeStyle = '#eee';
    for (let x = 0; x <= width; x += width / 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += height / 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw graph of the function if applicable
    if (solution.expression) {
      try {
        const compiled = math.compile(solution.expression);
        ctx.strokeStyle = '#4a90e2';
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let i = 0; i < width; i++) {
          const x = xMin + (i / width) * (xMax - xMin);
          try {
            const y = compiled.evaluate({ x });
            if (typeof y !== 'number' || !isFinite(y)) continue;
            const pixelY = height / 2 - (y / (yMax - yMin)) * height;

            if (i === 0) ctx.moveTo(i, pixelY); else ctx.lineTo(i, pixelY);
          } catch (err) {
            // continue on evaluation errors
          }
        }

        ctx.stroke();
      } catch (err) {
        // fallback to safe evaluate loop
      }
    }
    
    // Draw labels
    ctx.font = '12px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText(`x: [${xMin}, ${xMax}]`, 10, 20);
    ctx.fillText(`y: [${yMin}, ${yMax}]`, 10, 35);
    
    if (solution.expression) {
      ctx.fillText(`f(x) = ${solution.expression}`, 10, 50);
    }
  };

  const renderCalculusVisualization = (canvas, ctx, solution) => {
    // Basic visualization for calculus problems
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.font = '14px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText('Calculus Visualization', width / 2 - 70, 30);
    
    if (solution.operation === 'derivative') {
      ctx.fillText(`Function: ${solution.expression}`, 20, 60);
      ctx.fillText(`Derivative: ${solution.derivative}`, 20, 80);
      
      // Simple slope field visualization
      ctx.strokeStyle = '#4a90e2';
      ctx.lineWidth = 1;
      
      for (let x = 20; x < width; x += 30) {
        for (let y = 100; y < height - 20; y += 30) {
          const slope = math.evaluate(solution.derivative, { 
            x: (x - width/2) / 20, 
            y: (height/2 - y) / 20 
          });
          
          const angle = Math.atan(slope);
          const dx = Math.cos(angle) * 10;
          const dy = Math.sin(angle) * 10;
          
          ctx.beginPath();
          ctx.moveTo(x - dx, y + dy);
          ctx.lineTo(x + dx, y - dy);
          ctx.stroke();
        }
      }
    } else if (solution.operation === 'integral') {
      ctx.fillText(`Function: ${solution.expression}`, 20, 60);
      ctx.fillText(`Integral: ${solution.integral}`, 20, 80);
      
      // Simple area under curve visualization
      ctx.strokeStyle = '#4a90e2';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      // Draw the curve
      for (let i = 50; i < width - 50; i++) {
        const x = (i - width/2) / 30;
        try {
          const y = math.evaluate(solution.expression, { x });
          const pixelY = height/2 - y * 30;
          
          if (i === 50) {
            ctx.moveTo(i, pixelY);
          } else {
            ctx.lineTo(i, pixelY);
          }
        } catch (e) {
          // Skip points that can't be evaluated
        }
      }
      ctx.stroke();
      
      // Fill area under the curve
      ctx.fillStyle = 'rgba(74, 144, 226, 0.3)';
      ctx.beginPath();
      ctx.moveTo(50, height/2);
      
      for (let i = 50; i < width - 50; i++) {
        const x = (i - width/2) / 30;
        try {
          const y = math.evaluate(solution.expression, { x });
          const pixelY = height/2 - y * 30;
          ctx.lineTo(i, pixelY);
        } catch (e) {
          // Skip points that can't be evaluated
        }
      }
      
      ctx.lineTo(width - 50, height/2);
      ctx.closePath();
      ctx.fill();
    }
  };

  const renderCustomPlot = (canvas, ctx, expression) => {
    const { xMin, xMax, yMin, yMax, step } = graphSettings;
    const width = canvas.width;
    const height = canvas.height;
    
    // Draw coordinate system
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    
    // Draw x-axis
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Draw y-axis
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    
    // Draw grid
    ctx.strokeStyle = '#eee';
    for (let x = 0; x <= width; x += width / 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += height / 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw graph of the custom function using a compiled expression for performance
    try {
      const compiled = math.compile(expression);
      ctx.strokeStyle = '#4a90e2';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i < width; i++) {
        const x = xMin + (i / width) * (xMax - xMin);
        try {
          const y = compiled.evaluate({ x });
          if (typeof y !== 'number' || !isFinite(y)) continue;
          const pixelY = height / 2 - (y / (yMax - yMin)) * height;
          if (i === 0) ctx.moveTo(i, pixelY); else ctx.lineTo(i, pixelY);
        } catch (e) {
          // Skip points that can't be evaluated
        }
      }

      ctx.stroke();
    } catch (err) {
      // fallback: simple evaluate loop
      ctx.strokeStyle = '#4a90e2';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < width; i++) {
        const x = xMin + (i / width) * (xMax - xMin);
        try {
          const y = math.evaluate(expression, { x });
          const pixelY = height / 2 - (y / (yMax - yMin)) * height;
          if (i === 0) ctx.moveTo(i, pixelY); else ctx.lineTo(i, pixelY);
        } catch (e) {}
      }
      ctx.stroke();
    }
    
    // Draw labels
    ctx.font = '12px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText(`x: [${xMin}, ${xMax}]`, 10, 20);
    ctx.fillText(`y: [${yMin}, ${yMax}]`, 10, 35);
    ctx.fillText(`f(x) = ${expression}`, 10, 50);
  };

  const handleSolveCustom = () => {
    if (customProblem.trim()) {
      try {
        if (solveMode === 'local' && engineRef.current) {
          const local = engineRef.current.solve(customProblem);
          if (!local.error) {
            setLocalMathSolution(local);
            try { if (typeof setParentMathSolution === 'function') setParentMathSolution(local); } catch(e){}
          } else {
            // fall back to remote if local cannot parse
            onSolveCustomProblem(customProblem);
          }
        } else {
          onSolveCustomProblem(customProblem);
        }
        setInputHistory([customProblem, ...inputHistory.slice(0, 9)]);
        setCustomProblem('');
        setErrorMsg('');
      } catch (err) {
        setErrorMsg('Error solving problem: ' + err.message);
      }
    }
  };

  // Export canvas as SVG wrapper (embed PNG as image inside SVG for higher fidelity)
  const exportCanvasAsSVG = () => {
    const canvas = mathCanvasRef.current;
    if (!canvas) return;
    const png = canvas.toDataURL('image/png');
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns='http://www.w3.org/2000/svg' width='${canvas.width}' height='${canvas.height}'>\n  <image href='${png}' width='${canvas.width}' height='${canvas.height}' />\n</svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    let url = null;
    try {
      if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
        url = URL.createObjectURL(blob);
      }
      const a = document.createElement('a');
      a.href = url || '';
      a.download = `${fileNamePrefix}-visual-${new Date().toISOString().slice(0,10)}.svg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error('Export SVG failed', e);
    } finally {
      try { if (url) URL.revokeObjectURL(url); } catch (e) {}
    }
  };

  const handleExampleClick = (example) => {
    setCustomProblem(example);
    // automatically solve when clicking an example
    setTimeout(() => handleSolveCustom(), 50);
  };

  const clearHistory = () => setInputHistory([]);

  const downloadJSON = (obj) => {
    try {
      const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
      let url = null;
      try {
        if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url || '';
        a.download = `${fileNamePrefix}-${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (e) {
        console.error('Download JSON failed', e);
      } finally {
        try { if (url) URL.revokeObjectURL(url); } catch (e) {}
      }
    } catch (e) {
      console.error('Download JSON failed', e);
    }
  };

  const downloadCanvasPNG = () => {
    try {
      const canvas = mathCanvasRef.current;
      if (!canvas) return;
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileNamePrefix}-visual-${new Date().toISOString().slice(0,10)}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error('Download PNG failed', e);
    }
  };

  const copyLatexToClipboard = async (expr) => {
    try {
      const tex = math.parse(expr).toTex();
      if (navigator.clipboard && window.katex) {
        await navigator.clipboard.writeText(tex);
        // small toast via existing notification system is not available here; use alert fallback
        console.debug('LaTeX copied to clipboard');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(expr);
      }
    } catch (e) {
      console.error('Copy LaTeX failed', e);
    }
  };

  const handlePlotExpression = () => {
    if (plotExpression.trim()) {
      setIsPlotting(true);
      // In a real implementation, you might want to validate the expression
      setTimeout(() => setIsPlotting(false), 100);
    }
  };

  const handleGraphSettingChange = (setting, value) => {
    setGraphSettings(prev => ({
      ...prev,
      [setting]: parseFloat(value) || 0
    }));
  };

  // Render LaTeX for math expressions
  const renderLatex = (expr) => {
    // Dynamically load KaTeX if present; MathPanel will request it when needed
    try {
      const tex = math.parse(expr).toTex();
      if (katexState.loading) return <span className="math-latex">Loading LaTeX...</span>;
      if (katexState.loaded && window.katex) {
        return <span className="math-latex" dangerouslySetInnerHTML={{__html: window.katex.renderToString(tex, {throwOnError: false})}} />;
      }
      return <span className="math-latex-error">(LaTeX not available)</span>;
    } catch {
      return <span className="math-latex-error">(Invalid expression)</span>;
    }
  };

  // KaTeX dynamic loader state
  const [katexState, setKatexState] = useState({ loading: false, loaded: false, error: null });

  // load KaTeX on demand when a latex render is requested; expose a method callers can use
  const ensureKatexLoaded = async () => {
    if (katexState.loaded || katexState.loading) return;
    setKatexState({ loading: true, loaded: false, error: null });
    try {
      // dynamic import will be handled by bundler; fallback to CDN if package absent
      try {
        const katex = await import('katex');
        window.katex = katex;
        setKatexState({ loading: false, loaded: true, error: null });
        return;
      } catch (pkgErr) {
        // try loading from CDN
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';
          s.onload = () => resolve();
          s.onerror = () => reject(new Error('CDN load failed'));
          document.head.appendChild(s);
        });
        // also add stylesheet
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
        document.head.appendChild(link);
        // wait a beat for global to be available
        await new Promise(r => setTimeout(r, 200));
        if (!window.katex) {
          setKatexState({ loading: false, loaded: false, error: 'katex-global-missing' });
        } else {
          setKatexState({ loading: false, loaded: true, error: null });
        }
      }
    } catch (err) {
      console.warn('KaTeX load failed', err);
      setKatexState({ loading: false, loaded: false, error: err?.message || String(err) });
    }
  };

  // Smart suggestions for input
  const smartSuggestions = [
    'solve 2x + 5 = 13',
    'integrate x^2',
    'differentiate sin(x)',
    'plot cos(x)',
    'area of triangle with base 5 and height 3',
    'simplify (x^2 + 2x + 1)',
    'factor x^2 - 4',
    'expand (x+1)^3',
    'limit x->0 sin(x)/x',
    'sum 1/n^2 from n=1 to 10'
  ];

  useEffect(() => {
    // proactively load KaTeX when the panel mounts to improve perceived speed
    ensureKatexLoaded();
  }, []);

  return (
    <div className="math-panel">
      <div className="math-header">
        <h3>Advanced Mathematical Problem Solver</h3>
        <button className="back-button" onClick={() => setActiveTab("chat")}>
          <Icon name="arrow-left" size={16} /> <span style={{ marginLeft: 8 }}>Back to Chat</span>
        </button>
      </div>

      <div className="math-top-controls" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div>
          <label style={{ marginRight: 8 }}>Solve Mode:</label>
          <select value={solveMode} onChange={(e) => setSolveMode(e.target.value)}>
            <option value="local">Local (MathJS)</option>
            <option value="remote">Remote (Server)</option>
          </select>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Canvas: drag to pan, scroll to zoom</div>
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={resetView}>Reset View</button>
        </div>
      </div>

      <div className="math-description">
        <p>AION's enhanced mathematical reasoning capabilities. Solve equations, derivatives, integrals, geometric problems, and visualize mathematical concepts.</p>
      </div>

      <div className="custom-math-section">
        <h4>Solve Custom Problem</h4>
        <div className="math-input-container">
          <textarea
            value={customProblem}
            onChange={(e) => setCustomProblem(e.target.value)}
            placeholder="Enter a math problem to solve (e.g., 'solve 2x + 5 = 13', 'integrate x^2', 'area of circle with radius 5', 'plot sin(x)')"
            rows="3"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSolveCustom();
              }
            }}
          />
          <button onClick={handleSolveCustom} disabled={!customProblem.trim()}>
            Solve
          </button>
        </div>
        {errorMsg && <div className="math-error">{errorMsg}</div>}
        <div className="input-history">
          <h5>Input History</h5>
          <ul>
            {inputHistory.map((item, idx) => (
              <li key={idx} onClick={() => setCustomProblem(item)}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="smart-suggestions">
          <h5>Smart Suggestions</h5>
          <ul>
            {smartSuggestions.map((s, idx) => (
              <li key={idx}>
                <button className="example-button" onClick={() => handleExampleClick(s)}>{s}</button>
              </li>
            ))}
          </ul>
          <div className="history-controls">
            <button onClick={() => setCustomProblem(inputHistory[0] || '')} disabled={inputHistory.length===0}>Use Last</button>
            <button onClick={clearHistory} disabled={inputHistory.length===0}>Clear History</button>
          </div>
        </div>
      </div>

      <div className="graph-controls-section">
        <h4>Function Plotter</h4>
        <div className="plot-controls">
          <input
            type="text"
            value={plotExpression}
            onChange={(e) => setPlotExpression(e.target.value)}
            placeholder="Enter function to plot (e.g., x^2, sin(x), log(x))"
          />
          <button onClick={handlePlotExpression} disabled={!plotExpression.trim()}>
            Plot
          </button>
        </div>
        <div className="graph-settings">
          <h5>Graph Settings:</h5>
          <div className="setting-row">
            <label>
              X Min:
              <input
                type="number"
                value={graphSettings.xMin}
                onChange={(e) => handleGraphSettingChange('xMin', e.target.value)}
              />
            </label>
            <label>
              X Max:
              <input
                type="number"
                value={graphSettings.xMax}
                onChange={(e) => handleGraphSettingChange('xMax', e.target.value)}
              />
            </label>
          </div>
          <div className="setting-row">
            <label>
              Y Min:
              <input
                type="number"
                value={graphSettings.yMin}
                onChange={(e) => handleGraphSettingChange('yMin', e.target.value)}
              />
            </label>
            <label>
              Y Max:
              <input
                type="number"
                value={graphSettings.yMax}
                onChange={(e) => handleGraphSettingChange('yMax', e.target.value)}
              />
            </label>
          </div>
        </div>
      </div>

      {mathSolution || isPlotting ? (
        <div className="math-solution-container">
          <div className="solution-tabs">
            <button 
              className={selectedTab === 'solution' ? 'active' : ''}
              onClick={() => setSelectedTab('solution')}
            >
              Solution
            </button>
            <button 
              className={selectedTab === 'steps' ? 'active' : ''}
              onClick={() => setSelectedTab('steps')}
              disabled={!mathSolution?.steps}
            >
              Steps
            </button>
            <button 
              className={selectedTab === 'visualization' ? 'active' : ''}
              onClick={() => setSelectedTab('visualization')}
            >
              Visualization
            </button>
            <button 
              className={selectedTab === 'calculator' ? 'active' : ''}
              onClick={() => setSelectedTab('calculator')}
            >
              Calculator
            </button>
          </div>

          <div className="solution-content">
            {selectedTab === 'solution' && (localMathSolution || mathSolution) && (
              <div className="math-solution">
                <div className="math-problem">
                  <h4>Problem:</h4>
                  <p>{(localMathSolution || mathSolution).problem || (localMathSolution || mathSolution).expression}</p>
                </div>
                
                {(localMathSolution || mathSolution).solution && (
                  <div className="math-answer">
                    <h4>Solution:</h4>
                    <p>{(localMathSolution || mathSolution).solution}</p>
                    <div className="latex-render">{renderLatex((localMathSolution || mathSolution).solution)}</div>
                  </div>
                )}
                
                {(localMathSolution || mathSolution).simplified && (
                  <div className="math-answer">
                    <h4>Simplified Expression:</h4>
                    <div className="solution-row">
                      <p>{(localMathSolution || mathSolution).simplified}</p>
                      <div className="action-buttons">
                        <button onClick={() => navigator.clipboard.writeText((localMathSolution || mathSolution).simplified)}>Copy</button>
                        <button onClick={() => copyLatexToClipboard((localMathSolution || mathSolution).simplified)}>Copy LaTeX</button>
                      </div>
                    </div>
                    <div className="latex-render">{renderLatex((localMathSolution || mathSolution).simplified)}</div>
                  </div>
                )}
                
                {(localMathSolution || mathSolution).derivative && (
                  <div className="math-answer">
                    <h4>Derivative:</h4>
                    <p>{(localMathSolution || mathSolution).derivative}</p>
                    <div className="latex-render">{renderLatex((localMathSolution || mathSolution).derivative)}</div>
                  </div>
                )}
                
                {(localMathSolution || mathSolution).integral && (
                  <div className="math-answer">
                    <h4>Integral:</h4>
                    <p>{(localMathSolution || mathSolution).integral}</p>
                    <div className="latex-render">{renderLatex((localMathSolution || mathSolution).integral)}</div>
                  </div>
                )}
                
                {(localMathSolution || mathSolution).formula && (
                  <div className="math-formula">
                    <h4>Formula Used:</h4>
                    <div className="solution-row">
                      <p>{(localMathSolution || mathSolution).formula}</p>
                      <div className="action-buttons">
                        <button onClick={() => navigator.clipboard.writeText((localMathSolution || mathSolution).formula)}>Copy</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'steps' && renderMathSteps()}

            {selectedTab === 'visualization' && (
              <div className="math-visualization">
                <h4>Visual Representation</h4>
                <canvas
                  ref={mathCanvasRef}
                  width="600"
                  height="400"
                  style={{ border: '1px solid #ccc', borderRadius: '5px', cursor: 'grab' }}
                />
                <div className="visualization-notes">
                  <p>Graphical representation of the mathematical problem and solution.</p>
                  {mathSolution?.type === 'algebra' && mathSolution.graphable && (
                    <p>Drag on the canvas to pan. Use mouse wheel to zoom.</p>
                  )}
                </div>
              </div>
            )}

            {selectedTab === 'calculator' && (
              <div className="math-calculator">
                <h4>Advanced Calculator</h4>
                <div className="calculator-grid">
                  <button onClick={() => setCustomProblem(prev => prev + 'sin(')}>sin</button>
                  <button onClick={() => setCustomProblem(prev => prev + 'cos(')}>cos</button>
                  <button onClick={() => setCustomProblem(prev => prev + 'tan(')}>tan</button>
                  <button onClick={() => setCustomProblem(prev => prev + 'log(')}>log</button>
                  <button onClick={() => setCustomProblem(prev => prev + 'π')}>π</button>
                  <button onClick={() => setCustomProblem(prev => prev + 'e')}>e</button>
                  <button onClick={() => setCustomProblem(prev => prev + '√(')}>√</button>
                  <button onClick={() => setCustomProblem(prev => prev + '^')}>^</button>
                  <button onClick={() => setCustomProblem(prev => prev + '(')}>(</button>
                  <button onClick={() => setCustomProblem(prev => prev + ')')}>)</button>
                </div>
              </div>
            )}
          </div>

                  {((localMathSolution && !localMathSolution.error) || mathSolution) && (
                    <div className="solution-actions">
                      <button onClick={() => navigator.clipboard.writeText(JSON.stringify(localMathSolution || mathSolution, null, 2))}>
                        Copy Solution (JSON)
                      </button>
                      <button onClick={() => downloadJSON(localMathSolution || mathSolution)}>Download JSON</button>
                      <button onClick={downloadCanvasPNG}>Download Visualization (PNG)</button>
                      <button onClick={exportCanvasAsSVG}>Export Visualization (SVG)</button>

                      <div className="view-controls">
                        <button onClick={() => { scaleRef.current = Math.min(6, scaleRef.current * 1.2); renderAdvancedDiagram(); }}>Zoom In</button>
                        <button onClick={() => { scaleRef.current = Math.max(0.2, scaleRef.current * 0.8); renderAdvancedDiagram(); }}>Zoom Out</button>
                        <button onClick={resetView}>Reset View</button>
                      </div>

                      <label className="toggle-steps">
                        <input
                          type="checkbox"
                          checked={showSteps}
                          onChange={() => setShowSteps(!showSteps)}
                        />
                        Show Steps
                      </label>

                      <div className="solve-mode">
                        <label>Mode:</label>
                        <select value={solveMode} onChange={(e) => setSolveMode(e.target.value)}>
                          <option value="local">Local (fast)</option>
                          <option value="remote">Remote (server)</option>
                        </select>
                      </div>
                    </div>
                  )}
        </div>
      ) : (
        <div className="no-math">
          <div className="empty-state">
            <h4>No Math Solutions Yet</h4>
            <p>Ask a math question, use the custom solver, or plot a function to get started.</p>
            <div className="example-problems">
              <h5>Example Problems:</h5>
              <ul>
                <li>Solve: 2x + 5 = 13</li>
                <li>Differentiate: x^2 + 3x + 5</li>
                <li>Integrate: ∫(2x dx)</li>
                <li>Area of circle with radius 7</li>
                <li>Volume of sphere with radius 5</li>
                <li>Plot: sin(x) * cos(x)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="math-capabilities">
        <h4>Advanced Mathematical Capabilities</h4>
        <div className="capabilities-list">
          <div className="capability">
            <span className="capability-icon">➗</span>
            <span className="capability-name">Algebra</span>
            <span className="capability-desc">Equations, polynomials, matrices</span>
          </div>
          <div className="capability">
            <span className="capability-icon">∫</span>
            <span className="capability-name">Calculus</span>
            <span className="capability-desc">Derivatives, integrals, limits</span>
          </div>
          <div className="capability">
            <span className="capability-icon">△</span>
            <span className="capability-name">Geometry</span>
            <span className="capability-desc">Shapes, areas, volumes, theorems</span>
          </div>
          <div className="capability">
            <span className="capability-icon">Σ</span>
            <span className="capability-name">Statistics</span>
            <span className="capability-desc">Probability, distributions, analysis</span>
          </div>
          <div className="capability">
            <span className="capability-icon">∞</span>
            <span className="capability-name">Advanced Math</span>
            <span className="capability-desc">Linear algebra, differential equations</span>
          </div>
          <div className="capability">
            <span className="capability-icon">📈</span>
            <span className="capability-name">Graphing</span>
            <span className="capability-desc">2D/3D plots, interactive visualization</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathPanel;