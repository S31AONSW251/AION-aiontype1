/* ========================================
   ENHANCED MATH PANEL WITH AION CONSCIOUSNESS
   Advanced Features & Soul System Integration
   ======================================== */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import math from 'mathjs';
import MathEngine from '../../core/math.js';
import Icon from '../Icon.js';
import './MathPanelEnhanced.css';

const MathPanelEnhanced = ({
  mathSolution,
  settings,
  mathCanvasRef,
  setActiveTab,
  onSolveCustomProblem,
  setParentMathSolution,
  // AION Soul Integration Props
  soulState,
  onLearningEvent,
  onMoodUpdate,
  biometricFeedback
}) => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================

  const [customProblem, setCustomProblem] = useState('');
  const [inputHistory, setInputHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('mathInputHistory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showSteps, setShowSteps] = useState(settings?.showMathSteps ?? true);
  const [selectedTab, setSelectedTab] = useState('solution');
  const [graphSettings, setGraphSettings] = useState({
    xMin: -10, xMax: 10, yMin: -10, yMax: 10,
    resolution: 200, showGrid: true, showAxes: true
  });
  const [showLatex, setShowLatex] = useState(true);
  const [plotExpression, setPlotExpression] = useState('');
  const [isPlotting, setIsPlotting] = useState(false);
  const [evaluateAt, setEvaluateAt] = useState('');
  const [evalResult, setEvalResult] = useState(null);
  const [stepsExpanded, setStepsExpanded] = useState(false);
  const [replInput, setReplInput] = useState('');
  const [replHistory, setReplHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('mathReplHistory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [solveMode, setSolveMode] = useState('local');
  const [themeClass, setThemeClass] = useState('');
  const [localMathSolution, setLocalMathSolution] = useState(null);
  const [isSolving, setIsSolving] = useState(false);
  const [complexity, setComplexity] = useState(0);
  const [hints, setHints] = useState([]);
  const [showHints, setShowHints] = useState(false);

  // Canvas refs for visualization
  const engineRef = useRef(null);
  const scaleRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  // ========================================
  // INITIALIZATION & EFFECTS
  // ========================================

  useEffect(() => {
    // Initialize math engine
    if (!engineRef.current) {
      engineRef.current = new MathEngine();
    }

    // Theme detection
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('dark-theme') ||
        document.body.classList.contains('dark-theme');
      setThemeClass(isDark ? 'dark-theme' : '');
    };

    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  // Persist history to localStorage
  useEffect(() => {
    localStorage.setItem('mathInputHistory', JSON.stringify(inputHistory.slice(0, 20)));
  }, [inputHistory]);

  useEffect(() => {
    localStorage.setItem('mathReplHistory', JSON.stringify(replHistory.slice(0, 30)));
  }, [replHistory]);

  // ========================================
  // CONSCIOUSNESS & LEARNING INTEGRATION
  // ========================================

  const calculateComplexity = useCallback((problem) => {
    // Analyze problem complexity for mood/consciousness impact
    const operators = (problem.match(/[\+\-\*\/\^]/g) || []).length;
    const functions = (problem.match(/(sin|cos|tan|log|sqrt|exp|integrate|differentiate)/gi) || []).length;
    return Math.min(10, Math.ceil((operators + functions * 2) / 2));
  }, []);

  const generateHints = useCallback((problem, solution) => {
    // AI-powered hints based on problem type and soul state
    const hintsList = [];

    if (problem.includes('=')) {
      hintsList.push('💡 Isolate the variable on one side');
      hintsList.push('💡 Use inverse operations to solve');
    }

    if (problem.match(/(sin|cos|tan)/i)) {
      hintsList.push('🔄 Consider the unit circle');
      hintsList.push('📐 Remember periodic properties');
    }

    if (problem.includes('^') || problem.includes('sqrt')) {
      hintsList.push('🔢 Factor to simplify');
      hintsList.push('📊 Look for patterns in exponents');
    }

    // Add consciousness-aware hints
    if (soulState?.mood) {
      if (soulState.mood < 0.4) {
        hintsList.push('🌟 Start with the simplest approach');
        hintsList.push('✨ Break it into smaller steps');
      } else if (soulState.mood > 0.8) {
        hintsList.push('🚀 Try a challenging approach');
        hintsList.push('🎯 Explore alternative methods');
      }
    }

    return hintsList.slice(0, 3);
  }, [soulState]);

  const logLearningEvent = useCallback((problem, solution, timeTaken) => {
    if (typeof onLearningEvent === 'function') {
      onLearningEvent({
        type: 'MATH_SOLVED',
        problem,
        solution: solution?.solution || '',
        complexity,
        category: problem.includes('=') ? 'algebra' : 'other',
        timeTaken,
        timestamp: new Date().toISOString()
      });
    }
  }, [complexity, onLearningEvent]);

  // ========================================
  // PROBLEM SOLVING
  // ========================================

  const handleSolveCustom = useCallback(async () => {
    if (!customProblem.trim()) return;

    try {
      setIsSolving(true);
      const startTime = Date.now();
      const comp = calculateComplexity(customProblem);
      setComplexity(comp);

      if (solveMode === 'local' && engineRef.current) {
        const local = engineRef.current.solve(customProblem);
        if (!local.error) {
          setLocalMathSolution(local);
          setHints(generateHints(customProblem, local));
          setSuccessMsg('✓ Problem solved locally!');
          
          if (typeof setParentMathSolution === 'function') {
            setParentMathSolution(local);
          }

          // Log learning event
          const timeTaken = Date.now() - startTime;
          logLearningEvent(customProblem, local, timeTaken);

          // Update mood based on complexity
          if (typeof onMoodUpdate === 'function' && soulState) {
            const moodDelta = (comp / 10) * 0.1;
            onMoodUpdate(Math.min(1, soulState.mood + moodDelta));
          }

          setTimeout(() => setSuccessMsg(''), 3000);
        } else {
          // Fall back to remote
          onSolveCustomProblem(customProblem);
        }
      } else {
        onSolveCustomProblem(customProblem);
      }

      setInputHistory(prev => [customProblem, ...prev.slice(0, 19)]);
      setCustomProblem('');
      setErrorMsg('');
    } catch (err) {
      setErrorMsg('⚠ Error solving problem: ' + err.message);
      setIsSolving(false);
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setIsSolving(false);
    }
  }, [customProblem, solveMode, onSolveCustomProblem, setParentMathSolution, 
      calculateComplexity, generateHints, onMoodUpdate, logLearningEvent, soulState]);

  // Keyboard shortcut: Ctrl+Enter
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (customProblem.trim()) handleSolveCustom();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [customProblem, handleSolveCustom]);

  // ========================================
  // GRAPHING & VISUALIZATION
  // ========================================

  const handlePlotExpression = useCallback(() => {
    if (!plotExpression.trim()) return;
    setIsPlotting(true);
    setTimeout(() => {
      renderAdvancedDiagram();
      setIsPlotting(false);
    }, 100);
  }, [plotExpression]);

  const handleGraphSettingChange = (key, value) => {
    setGraphSettings(prev => ({
      ...prev,
      [key]: isNaN(value) ? value : parseFloat(value)
    }));
  };

  // Canvas visualization
  const applyCanvasTransform = (ctx, canvas) => {
    ctx.setTransform(scaleRef.current, 0, 0, scaleRef.current, panRef.current.x, panRef.current.y);
  };

  const renderAdvancedDiagram = () => {
    const sol = localMathSolution || mathSolution;
    if (!sol || !mathCanvasRef?.current) return;

    const canvas = mathCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    applyCanvasTransform(ctx, canvas);

    if (sol.type === 'geometry') {
      renderGeometry(canvas, ctx, sol);
    } else if (sol.type === 'algebra' && sol.graphable) {
      renderGraph(canvas, ctx, sol);
    } else if (plotExpression) {
      renderCustomPlot(canvas, ctx, plotExpression);
    }
  };

  const renderGeometry = (canvas, ctx, solution) => {
    // Geometry visualization with premium styling
    ctx.fillStyle = 'rgba(11, 99, 214, 0.1)';
    ctx.strokeStyle = '#0b63d6';
    ctx.lineWidth = 2;

    if (solution.subtype === 'circle' && solution.radius) {
      const r = solution.radius;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    }
  };

  const renderGraph = (canvas, ctx, solution) => {
    // Graph rendering for algebra problems
    const { xMin, xMax, yMin, yMax, resolution } = graphSettings;
    const width = canvas.width;
    const height = canvas.height;

    // Draw grid
    if (graphSettings.showGrid) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 0.5;
      for (let i = xMin; i <= xMax; i += (xMax - xMin) / 10) {
        const x = ((i - xMin) / (xMax - xMin)) * width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    }

    // Draw axes
    if (graphSettings.showAxes) {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      const xAxis = ((0 - yMin) / (yMax - yMin)) * height;
      const yAxis = ((0 - xMin) / (xMax - xMin)) * width;
      ctx.beginPath();
      ctx.moveTo(yAxis, 0);
      ctx.lineTo(yAxis, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, xAxis);
      ctx.lineTo(width, xAxis);
      ctx.stroke();
    }
  };

  const renderCustomPlot = (canvas, ctx, expr) => {
    // Custom expression plotting
    try {
      const { xMin, xMax, resolution } = graphSettings;
      const width = canvas.width;
      const height = canvas.height;

      ctx.strokeStyle = '#0b63d6';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i < resolution; i++) {
        const x = xMin + ((xMax - xMin) * i) / resolution;
        try {
          const y = math.evaluate(expr, { x });
          const px = (i / resolution) * width;
          const py = height * 0.5 - (y * height) / 20;

          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        } catch {
          // Skip invalid points
        }
      }
      ctx.stroke();
    } catch {
      // Silently fail for invalid expressions
    }
  };

  const resetView = () => {
    panRef.current = { x: 0, y: 0 };
    scaleRef.current = 1;
    renderAdvancedDiagram();
  };

  // Canvas pan/zoom
  useEffect(() => {
    const canvas = mathCanvasRef?.current;
    if (!canvas) return;

    const onWheel = (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.92 : 1.08;
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

    const onMouseUp = () => {
      isPanningRef.current = false;
    };

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
  }, [mathCanvasRef]);

  // ========================================
  // REPL & CALCULATOR
  // ========================================

  const handleEvaluate = useCallback(() => {
    try {
      const result = math.evaluate(replInput || '0');
      setReplHistory(prev => [{
        expr: replInput,
        result: String(result),
        timestamp: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 30));
      setReplInput('');
    } catch (e) {
      setReplHistory(prev => [{
        expr: replInput,
        result: '❌ Error: ' + e.message,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 30));
    }
  }, [replInput]);

  // ========================================
  // RENDERING FUNCTIONS
  // ========================================

  const renderLatex = (expression) => {
    // Simple LaTeX rendering preview
    return expression;
  };

  const downloadJSON = () => {
    const sol = localMathSolution || mathSolution;
    if (!sol) return;
    const json = JSON.stringify(sol, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'math-solution.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCanvasPNG = () => {
    const canvas = mathCanvasRef?.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'math-visualization.png';
    a.click();
  };

  const exportCanvasAsSVG = () => {
    const canvas = mathCanvasRef?.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/svg+xml');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'math-visualization.svg';
    a.click();
  };

  const copyLatexToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
  };

  // ========================================
  // RENDER COMPONENTS
  // ========================================

  const renderMathSteps = () => {
    const sol = localMathSolution || mathSolution;
    if (!sol?.steps || !showSteps) return null;

    return (
      <div className="math-steps-container">
        <div className="steps-controls">
          <div></div>
          <div className="steps-controls-right">
            <button className="btn-compact" onClick={() => setStepsExpanded(!stepsExpanded)}>
              {stepsExpanded ? '▼ Collapse' : '▶ Expand'}
            </button>
          </div>
        </div>
        <ol className="math-steps-list">
          {sol.steps.map((step, i) => (
            <li key={i} className="math-step">
              <div className="step-number">{i + 1}</div>
              <div className="step-content">
                <div className="step-row">
                  <div className="step-text">
                    {stepsExpanded ? step : (String(step).length > 150 ? String(step).slice(0, 150) + '…' : step)}
                  </div>
                  <div className="step-actions">
                    <button className="icon-btn" onClick={() => navigator.clipboard?.writeText(step)} title="Copy">
                      📋
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  };

  const renderHints = () => {
    if (!showHints || !hints.length) return null;

    return (
      <div className="hints-container" style={{
        background: 'var(--math-accent)',
        padding: '12px 14px',
        borderRadius: 'var(--math-radius-md)',
        marginBottom: '12px',
        border: '1px solid var(--math-border)'
      }}>
        <strong style={{ display: 'block', marginBottom: '8px' }}>💡 Helpful Hints:</strong>
        {hints.map((hint, i) => (
          <div key={i} style={{ fontSize: '13px', marginBottom: i < hints.length - 1 ? '6px' : 0 }}>
            {hint}
          </div>
        ))}
      </div>
    );
  };

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <div className={`math-panel ${themeClass}`}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 20px 0' }}>
        🔢 Advanced Math Panel {complexity > 0 && <span style={{ fontSize: '12px', background: 'var(--math-accent)', padding: '4px 8px', borderRadius: 'var(--math-radius-md)' }}>Complexity: {complexity}/10</span>}
      </h2>

      {/* Input Section */}
      <div className="input-wrapper">
        <label>Enter a mathematical problem:</label>
        <div className="math-input-row">
          <input
            type="text"
            value={customProblem}
            onChange={(e) => setCustomProblem(e.target.value)}
            placeholder="e.g., solve: 2x + 5 = 13, differentiate: x^2 + 3x"
            onKeyDown={(e) => e.key === 'Enter' && handleSolveCustom()}
          />
          <button onClick={handleSolveCustom} disabled={isSolving || !customProblem.trim()}>
            {isSolving ? '⏳ Solving...' : '✓ Solve'}
          </button>
        </div>

        {errorMsg && <div className="error-msg">{errorMsg}</div>}
        {successMsg && <div className="success-msg">{successMsg}</div>}

        {inputHistory.length > 0 && (
          <div className="input-history-wrapper">
            <label>Recent Problems:</label>
            <div className="input-history">
              {inputHistory.slice(0, 5).map((item, i) => (
                <button key={i} className="history-item" onClick={() => setCustomProblem(item)} title={item}>
                  {item.substring(0, 30)}...
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Graph Settings */}
      <div className="graph-settings">
        <h5>Graph Settings</h5>
        <div className="setting-row">
          <label>X Min: <input type="number" value={graphSettings.xMin} onChange={(e) => handleGraphSettingChange('xMin', e.target.value)} /></label>
          <label>X Max: <input type="number" value={graphSettings.xMax} onChange={(e) => handleGraphSettingChange('xMax', e.target.value)} /></label>
        </div>
        <div className="setting-row">
          <label>Y Min: <input type="number" value={graphSettings.yMin} onChange={(e) => handleGraphSettingChange('yMin', e.target.value)} /></label>
          <label>Y Max: <input type="number" value={graphSettings.yMax} onChange={(e) => handleGraphSettingChange('yMax', e.target.value)} /></label>
        </div>
      </div>

      {/* Solution Display */}
      {(mathSolution || localMathSolution) ? (
        <>
          <div className="solution-tabs">
            {['solution', 'steps', 'visualization', 'calculator'].map(tab => (
              <button
                key={tab}
                className={selectedTab === tab ? 'active' : ''}
                onClick={() => setSelectedTab(tab)}
                disabled={tab === 'steps' && !mathSolution?.steps}
              >
                {tab === 'solution' && '📄 Solution'}
                {tab === 'steps' && '📝 Steps'}
                {tab === 'visualization' && '📊 Graph'}
                {tab === 'calculator' && '🧮 REPL'}
              </button>
            ))}
          </div>

          <div className="solution-content">
            {selectedTab === 'solution' && (
              <div className="math-solution">
                {renderHints()}
                <div className="math-problem">
                  <h4>Problem:</h4>
                  <p>{(localMathSolution || mathSolution).problem}</p>
                </div>
                {(localMathSolution || mathSolution).solution && (
                  <div className="math-answer">
                    <h4>Solution:</h4>
                    <p>{(localMathSolution || mathSolution).solution}</p>
                    {showLatex && <div className="latex-render">{renderLatex((localMathSolution || mathSolution).solution)}</div>}
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'steps' && renderMathSteps()}

            {selectedTab === 'visualization' && (
              <div className="math-visualization">
                <h4>Visual Representation</h4>
                <canvas ref={mathCanvasRef} width="600" height="400" className="math-canvas" />
                <div className="visualization-notes">
                  <p>Interactive visualization: Drag to pan, scroll to zoom.</p>
                </div>
              </div>
            )}

            {selectedTab === 'calculator' && (
              <div className="math-calculator">
                <h4>Advanced Calculator</h4>
                <div className="repl-row">
                  <input className="repl-input" value={replInput} onChange={(e) => setReplInput(e.target.value)} placeholder="sin(pi/4), sqrt(16), etc." onKeyDown={(e) => e.key === 'Enter' && handleEvaluate()} />
                  <button className="icon-btn" onClick={handleEvaluate}>📐</button>
                </div>
                {replHistory.length > 0 && (
                  <div className="repl-history-wrap">
                    <strong>History</strong>
                    <ul className="repl-history">
                      {replHistory.slice(0, 10).map((r, i) => (
                        <li key={i}><code>{r.expr}</code> = <strong>{r.result}</strong></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="solution-actions">
            <button onClick={downloadJSON}>💾 Download JSON</button>
            <button onClick={downloadCanvasPNG}>🖼️ PNG</button>
            <button onClick={exportCanvasAsSVG}>📈 SVG</button>
            <div className="view-controls">
              <button onClick={() => { scaleRef.current = Math.min(6, scaleRef.current * 1.2); renderAdvancedDiagram(); }}>🔍 Zoom +</button>
              <button onClick={() => { scaleRef.current = Math.max(0.2, scaleRef.current * 0.8); renderAdvancedDiagram(); }}>🔍 Zoom -</button>
              <button onClick={resetView}>↺ Reset</button>
            </div>
            <label className="toggle-steps">
              <input type="checkbox" checked={showSteps} onChange={() => setShowSteps(!showSteps)} />
              Show Steps
            </label>
            <label className="toggle-steps">
              <input type="checkbox" checked={showHints} onChange={() => setShowHints(!showHints)} />
              AI Hints
            </label>
            <div className="solve-mode">
              <label>Mode:</label>
              <select value={solveMode} onChange={(e) => setSolveMode(e.target.value)}>
                <option value="local">Local (fast)</option>
                <option value="remote">Remote (server)</option>
              </select>
            </div>
          </div>
        </>
      ) : (
        <div className="no-math">
          <div className="empty-state">
            <h4>Ready to solve math problems!</h4>
            <p>Enter an equation, expression, or use the calculator below.</p>
            <div className="example-problems">
              <h5>Try These:</h5>
              <ul>
                <li onClick={() => setCustomProblem('solve: 2x + 5 = 13')}>Solve: 2x + 5 = 13</li>
                <li onClick={() => setCustomProblem('differentiate: x^2 + 3x + 5')}>Differentiate: x^2 + 3x + 5</li>
                <li onClick={() => setCustomProblem('area of circle with radius 7')}>Area of circle (r=7)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Capabilities */}
      <div className="math-capabilities">
        <h4>🚀 Capabilities</h4>
        <div className="capabilities-list">
          <div className="capability">
            <span className="capability-icon">➗</span>
            <span className="capability-name">Algebra</span>
            <span className="capability-desc">Equations, polynomials</span>
          </div>
          <div className="capability">
            <span className="capability-icon">∫</span>
            <span className="capability-name">Calculus</span>
            <span className="capability-desc">Derivatives, integrals</span>
          </div>
          <div className="capability">
            <span className="capability-icon">△</span>
            <span className="capability-name">Geometry</span>
            <span className="capability-desc">Shapes, areas, volumes</span>
          </div>
          <div className="capability">
            <span className="capability-icon">📊</span>
            <span className="capability-name">Graphing</span>
            <span className="capability-desc">2D interactive plots</span>
          </div>
          <div className="capability">
            <span className="capability-icon">🧠</span>
            <span className="capability-name">AION Integrated</span>
            <span className="capability-desc">Consciousness aware</span>
          </div>
          <div className="capability">
            <span className="capability-icon">⚡</span>
            <span className="capability-name">Premium Design</span>
            <span className="capability-desc">Modern UI/UX</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathPanelEnhanced;
