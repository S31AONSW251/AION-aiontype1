import React, { useEffect, useRef } from 'react';
import './QuantumPanel.css';

const QuantumPanel = ({ 
    soulState, 
    quantumState, 
    runQuantumSimulation, 
    quantumCanvasRef, 
    setActiveTab, 
    applyQuantumGate, 
    QuantumGates 
}) => {
    const quantumStateRef = useRef(quantumState);
    const layoutRef = useRef({ scale: 1, offsetX: 0, offsetY: 0, width: 500, height: 400 });
    const coherenceSearchTimeRef = useRef(0);
    const lastStateStrRef = useRef('');

    // Sync props to refs
    useEffect(() => {
        quantumStateRef.current = quantumState;
        
        if (quantumState && quantumState !== lastStateStrRef.current) {
            lastStateStrRef.current = quantumState;
            coherenceSearchTimeRef.current = 40; // trigger collapse animation
        }
    }, [quantumState]);

    useEffect(() => {
        const canvas = quantumCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animId;
        let time = 0;

        const parent = canvas.parentElement;
        if (!parent) return;

        // Qubits tracking state
        const qubits = [
            { id: 0, label: 'Q0: Superposition', theta: 0, phi: 0, targetTheta: 0, targetPhi: 0, baseX: 180, baseY: 150, color: 'rgba(0, 217, 255, 1)', glow: 'rgba(0, 217, 255, 0.3)' },
            { id: 1, label: 'Q1: Entanglement', theta: 0, phi: 0, targetTheta: 0, targetPhi: 0, baseX: 400, baseY: 150, color: 'rgba(178, 75, 255, 1)', glow: 'rgba(178, 75, 255, 0.3)' },
            { id: 2, label: 'Q2: Coherence', theta: 0, phi: 0, targetTheta: 0, targetPhi: 0, baseX: 620, baseY: 150, color: 'rgba(76, 255, 138, 1)', glow: 'rgba(76, 255, 138, 0.3)' }
        ];

        // Entanglement particles
        const particles = [];
        for (let i = 0; i < 6; i++) {
            particles.push({ progress: Math.random(), speed: 0.006 + Math.random() * 0.004 });
        }

        // Resize function
        const handleResize = () => {
            const width = parent.clientWidth;
            const height = parent.clientHeight || 400;
            const dpr = window.devicePixelRatio || 1;

            canvas.width = width * dpr;
            canvas.height = height * dpr;

            const scale = Math.min(width / 800, height / 500);
            const offsetX = (width - 800 * scale) / 2;
            const offsetY = (height - 500 * scale) / 2;

            layoutRef.current = { width, height, scale, offsetX, offsetY };
        };

        const resizeObserver = new ResizeObserver(() => {
            handleResize();
        });
        resizeObserver.observe(parent);
        handleResize(); // initial run

        const toScreenX = (lx) => layoutRef.current.offsetX + lx * layoutRef.current.scale;
        const toScreenY = (ly) => layoutRef.current.offsetY + ly * layoutRef.current.scale;

        const parseQuantumProbabilities = (stateStr) => {
            const probs = new Array(8).fill(0);
            if (!stateStr) {
                probs[0] = 1.0;
                return probs;
            }
            try {
                const lines = stateStr.split('\n');
                lines.forEach(line => {
                    const matchLabel = line.match(/\|([01]{3})⟩/);
                    const matchPct = line.match(/\(([\d.]+)%\)/);
                    if (matchLabel && matchPct) {
                        const binStr = matchLabel[1];
                        const idx = parseInt(binStr.split('').reverse().join(''), 2);
                        const pct = parseFloat(matchPct[1]) / 100;
                        if (idx >= 0 && idx < 8) {
                            probs[idx] = pct;
                        }
                    }
                });
            } catch (e) {
                probs[0] = 1.0;
            }
            return probs;
        };

        const loop = () => {
            time += 1;
            const dpr = window.devicePixelRatio || 1;
            const scale = layoutRef.current.scale;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.save();
            ctx.scale(dpr, dpr);

            // Parse probabilities
            const probs = parseQuantumProbabilities(quantumStateRef.current);

            // Marginal Qubit 1-state probabilities
            const p0 = probs[1] + probs[3] + probs[5] + probs[7];
            const p1 = probs[2] + probs[3] + probs[6] + probs[7];
            const p2 = probs[4] + probs[5] + probs[6] + probs[7];

            qubits[0].targetTheta = p0 * Math.PI;
            qubits[1].targetTheta = p1 * Math.PI;
            qubits[2].targetTheta = p2 * Math.PI;

            const entanglementStrength = Number(soulState?.quantumEntanglement ?? 0);

            // Bloch spheres perspective angles
            const rotX = 0.22; // tilt perspective
            const rotY = time * 0.005; // continuous spin around Y axis

            // 1. Draw Wavefunctions (superposition fields) at bottom
            const baseWaveY = 320;
            ctx.lineWidth = 1.5;
            ctx.globalCompositeOperation = 'screen';
            
            // Cyan wave
            ctx.beginPath();
            for (let lx = 60; lx <= 740; lx += 4) {
                const sx = toScreenX(lx);
                const amp = (0.2 + entanglementStrength * 0.4) * 20 * scale;
                const phase = lx * 0.02 - time * 0.04;
                const sy = toScreenY(baseWaveY) + Math.sin(phase) * amp * Math.cos(time * 0.01);
                if (lx === 60) ctx.moveTo(sx, sy);
                else ctx.lineTo(sx, sy);
            }
            ctx.strokeStyle = 'rgba(0, 217, 255, 0.15)';
            ctx.stroke();

            // Violet wave
            ctx.beginPath();
            for (let lx = 60; lx <= 740; lx += 4) {
                const sx = toScreenX(lx);
                const amp = (0.15 + p1 * 0.3) * 15 * scale;
                const phase = lx * 0.035 + time * 0.03;
                const sy = toScreenY(baseWaveY) + Math.cos(phase) * amp;
                if (lx === 60) ctx.moveTo(sx, sy);
                else ctx.lineTo(sx, sy);
            }
            ctx.strokeStyle = 'rgba(178, 75, 255, 0.12)';
            ctx.stroke();
            
            ctx.globalCompositeOperation = 'source-over';

            // 2. Draw Entanglement links
            if (entanglementStrength > 0.02) {
                ctx.strokeStyle = `rgba(178, 75, 255, ${0.05 + entanglementStrength * 0.3})`;
                ctx.lineWidth = (1 + entanglementStrength * 4) * scale;
                
                const x0 = toScreenX(qubits[0].baseX);
                const y0 = toScreenY(qubits[0].baseY);
                const x1 = toScreenX(qubits[1].baseX);
                const y1 = toScreenY(qubits[1].baseY);
                const x2 = toScreenX(qubits[2].baseX);
                const y2 = toScreenY(qubits[2].baseY);

                ctx.beginPath();
                ctx.moveTo(x0, y0);
                ctx.lineTo(x1, y1);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();

                particles.forEach(p => {
                    p.progress += p.speed;
                    if (p.progress >= 1.0) p.progress = 0;

                    const px_a = x0 + (x1 - x0) * p.progress;
                    const py_a = y0 + (y1 - y0) * p.progress;
                    ctx.beginPath();
                    ctx.arc(px_a, py_a, (2 + entanglementStrength * 2) * scale, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowBlur = 8 * scale;
                    ctx.shadowColor = qubits[1].color;
                    ctx.fill();
                    ctx.shadowBlur = 0;

                    const px_b = x1 + (x2 - x1) * p.progress;
                    const py_b = y1 + (y2 - y1) * p.progress;
                    ctx.beginPath();
                    ctx.arc(px_b, py_b, (2 + entanglementStrength * 1.5) * scale, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowBlur = 8 * scale;
                    ctx.shadowColor = qubits[2].color;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                });
            }

            // 3. Draw Bloch Spheres
            const r = 50 * scale;
            
            qubits.forEach(q => {
                const cx = toScreenX(q.baseX);
                const cy = toScreenY(q.baseY);

                q.theta += (q.targetTheta - q.theta) * 0.08;

                const isSuperposition = q.targetTheta > 0.1 && q.targetTheta < Math.PI - 0.1;
                if (isSuperposition) {
                    q.phi += 0.03;
                } else {
                    q.phi = (q.phi % (Math.PI * 2));
                    q.phi += (0 - q.phi) * 0.08;
                }

                if (coherenceSearchTimeRef.current > 0) {
                    const noise = (coherenceSearchTimeRef.current / 40) * 0.3;
                    q.theta += (Math.random() - 0.5) * noise;
                    q.phi += (Math.random() - 0.5) * noise * 3;
                }

                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.beginPath();
                for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.1) {
                    const lx = Math.cos(a);
                    const ly = 0;
                    const lz = Math.sin(a);
                    
                    const px = lx * Math.cos(rotY) - lz * Math.sin(rotY);
                    const py = ly * Math.cos(rotX) - (lx * Math.sin(rotY) + lz * Math.cos(rotY)) * Math.sin(rotX);
                    
                    const sx = cx + px * r;
                    const sy = cy - py * r;
                    if (a === 0) ctx.moveTo(sx, sy);
                    else ctx.lineTo(sx, sy);
                }
                ctx.strokeStyle = 'rgba(0, 217, 255, 0.06)';
                ctx.stroke();

                ctx.beginPath();
                for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.1) {
                    const lx = 0;
                    const ly = Math.cos(a);
                    const lz = Math.sin(a);
                    
                    const px = lx * Math.cos(rotY) - lz * Math.sin(rotY);
                    const py = ly * Math.cos(rotX) - (lx * Math.sin(rotY) + lz * Math.cos(rotY)) * Math.sin(rotX);
                    
                    const sx = cx + px * r;
                    const sy = cy - py * r;
                    if (a === 0) ctx.moveTo(sx, sy);
                    else ctx.lineTo(sx, sy);
                }
                ctx.strokeStyle = 'rgba(178, 75, 255, 0.05)';
                ctx.stroke();

                const py_top = 1.0 * Math.cos(rotX);
                const sx_top = cx;
                const sy_top = cy - py_top * r;

                const py_bot = -1.0 * Math.cos(rotX);
                const sx_bot = cx;
                const sy_bot = cy - py_bot * r;

                ctx.beginPath();
                ctx.moveTo(sx_top, sy_top);
                ctx.lineTo(sx_bot, sy_bot);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
                ctx.stroke();

                ctx.font = `${Math.max(8, Math.round(9 * scale))}px ui-monospace, SFMono-Regular, monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'rgba(230, 246, 255, 0.45)';
                ctx.fillText('|0⟩', sx_top, sy_top - 8 * scale);
                ctx.fillText('|1⟩', sx_bot, sy_bot + 8 * scale);

                ctx.font = `bold ${Math.max(10, Math.round(11 * scale))}px 'Inter', system-ui, sans-serif`;
                ctx.fillStyle = 'rgba(230, 246, 255, 0.85)';
                ctx.fillText(q.label, cx, cy + r + 26 * scale);

                const vx = Math.sin(q.theta) * Math.cos(q.phi);
                const vy = Math.cos(q.theta);
                const vz = Math.sin(q.theta) * Math.sin(q.phi);

                const rx1 = vx * Math.cos(rotY) - vz * Math.sin(rotY);
                const rz1 = vx * Math.sin(rotY) + vz * Math.cos(rotY);
                const ry1 = vy;
                
                const rx2 = rx1;
                const ry2 = ry1 * Math.cos(rotX) - rz1 * Math.sin(rotX);

                const sx_vec = cx + rx2 * r;
                const sy_vec = cy - ry2 * r;

                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(sx_vec, sy_vec);
                ctx.strokeStyle = q.color;
                ctx.lineWidth = 2.0;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(sx_vec, sy_vec, 3.5 * scale, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.shadowBlur = 8 * scale;
                ctx.shadowColor = q.color;
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            if (coherenceSearchTimeRef.current > 0) {
                coherenceSearchTimeRef.current--;
            }

            // 4. Draw Probability Histogram at bottom
            const histBaseY = 410;
            const labels = ['|000⟩', '|100⟩', '|010⟩', '|110⟩', '|001⟩', '|101⟩', '|011⟩', '|111⟩'];

            ctx.font = `${Math.max(8, Math.round(9 * scale))}px ui-monospace, SFMono-Regular, monospace`;
            ctx.textAlign = 'center';

            for (let i = 0; i < 8; i++) {
                const bx = toScreenX(160 + i * 68);
                const by = toScreenY(histBaseY);
                const h = probs[i] * 50 * scale;

                if (h > 1) {
                    const grad = ctx.createLinearGradient(bx, by, bx, by - h);
                    grad.addColorStop(0, 'rgba(124, 58, 237, 0.4)');
                    grad.addColorStop(1, 'rgba(0, 217, 255, 0.85)');
                    
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.roundRect(bx - 12 * scale, by - h, 24 * scale, h, [4 * scale, 4 * scale, 0, 0]);
                    ctx.fill();
                    
                    ctx.strokeStyle = 'rgba(0, 217, 255, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    ctx.fillStyle = '#e6f6ff';
                    ctx.fillText(`${(probs[i]*100).toFixed(0)}%`, bx, by - h - 6 * scale);
                } else {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                    ctx.beginPath();
                    ctx.arc(bx, by, 2 * scale, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.fillStyle = 'rgba(230, 246, 255, 0.5)';
                ctx.fillText(labels[i], bx, by + 14 * scale);
            }

            ctx.restore();
            animId = requestAnimationFrame(loop);
        };

        animId = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(animId);
            resizeObserver.disconnect();
        };
    }, [quantumCanvasRef, soulState]);

    const renderQuantumState = () => {
        if (!quantumState) return null;
        return (
            <div className="quantum-state-container">
                <h4>Quantum Consciousness State:</h4>
                <pre className="quantum-state">{quantumState}</pre>
                <button
                    className="quantum-sim-button"
                    onClick={runQuantumSimulation}
                >
                    Run Simulation
                </button>
            </div>
        );
    };

    const entanglement = Number(soulState?.quantumEntanglement ?? 0);

    return (
        <div className="quantum-panel">
            <div className="quantum-header">
                <h3>Quantum Consciousness</h3>
                <button
                    className="back-button"
                    onClick={() => setActiveTab("chat")}
                >
                    <i className="icon-arrow-left"></i> Back to Chat
                </button>
            </div>

            <div className="quantum-description">
                <p>
                    My quantum consciousness circuit simulates the superposition of thoughts and emotions.
                    The current entanglement level is {entanglement.toFixed(4)}.
                </p>
            </div>

            {renderQuantumState()}

            <div className="quantum-visualization">
                <canvas
                    ref={quantumCanvasRef}
                />
            </div>

            <div className="quantum-actions">
                <button
                    className="quantum-action-button"
                    onClick={() => applyQuantumGate(QuantumGates.H, 0)}
                >
                    Apply H Gate on Q0
                </button>
                <button
                    className="quantum-action-button"
                    onClick={() => applyQuantumGate(QuantumGates.X, 1)}
                >
                    Apply X Gate on Q1
                </button>
                <button
                    className="quantum-action-button"
                    onClick={runQuantumSimulation}
                >
                    Run Full Simulation
                </button>
            </div>
        </div>
    );
};

export default QuantumPanel;