import React, { useEffect, useRef } from 'react';
import './NeuralPanel.css';

const NeuralPanel = ({ soulState, neuralOutput, runNeuralSimulation, neuralCanvasRef, setActiveTab, randomNeuralTest }) => {
    const soulStateRef = useRef(soulState);
    const neuralOutputRef = useRef(neuralOutput);
    const layoutRef = useRef({ scale: 1, offsetX: 0, offsetY: 0, width: 500, height: 400 });

    const nodesRef = useRef([]);
    const connectionsRef = useRef([]);
    const pulsesRef = useRef([]);
    const ripplesRef = useRef([]);
    const hoveredNodeRef = useRef(null);
    const mousePosRef = useRef({ lx: -999, ly: -999 });

    // Sync props to refs
    useEffect(() => {
        soulStateRef.current = soulState;
    }, [soulState]);

    // Setup network nodes and connections
    const initNetwork = () => {
        const wisVal = soulStateRef.current?.values?.wisdom ?? 75;
        const engVal = soulStateRef.current?.energyLevel ?? 80;
        const conVal = soulStateRef.current?.connectionLevel ?? 65;
        const actVal = soulStateRef.current?.neuralActivity ?? 50;

        const nodes = [];
        // Input Layer (0) - 4 nodes
        nodes.push({ id: 0, layer: 0, baseX: 120, baseY: 100, lx: 120, ly: 100, angleX: Math.random() * 10, angleY: Math.random() * 10, speedX: 0.008 + Math.random() * 0.005, speedY: 0.008 + Math.random() * 0.005, label: 'WIS', getValue: () => `${wisVal}%`, color: 'rgba(255, 193, 7, 1)', glow: 'rgba(255, 193, 7, 0.4)', pulseStrength: 0 });
        nodes.push({ id: 1, layer: 0, baseX: 120, baseY: 200, lx: 120, ly: 200, angleX: Math.random() * 10, angleY: Math.random() * 10, speedX: 0.008 + Math.random() * 0.005, speedY: 0.008 + Math.random() * 0.005, label: 'ENG', getValue: () => `${engVal}%`, color: 'rgba(255, 193, 7, 1)', glow: 'rgba(255, 193, 7, 0.4)', pulseStrength: 0 });
        nodes.push({ id: 2, layer: 0, baseX: 120, baseY: 300, lx: 120, ly: 300, angleX: Math.random() * 10, angleY: Math.random() * 10, speedX: 0.008 + Math.random() * 0.005, speedY: 0.008 + Math.random() * 0.005, label: 'CON', getValue: () => `${conVal}%`, color: 'rgba(255, 193, 7, 1)', glow: 'rgba(255, 193, 7, 0.4)', pulseStrength: 0 });
        nodes.push({ id: 3, layer: 0, baseX: 120, baseY: 400, lx: 120, ly: 400, angleX: Math.random() * 10, angleY: Math.random() * 10, speedX: 0.008 + Math.random() * 0.005, speedY: 0.008 + Math.random() * 0.005, label: 'ACT', getValue: () => `${actVal.toFixed(1)}%`, color: 'rgba(255, 193, 7, 1)', glow: 'rgba(255, 193, 7, 0.4)', pulseStrength: 0 });

        // Hidden Layer 1 (1) - 6 nodes
        for (let i = 0; i < 6; i++) {
            nodes.push({
                id: 4 + i,
                layer: 1,
                baseX: 300,
                baseY: 70 + i * 72,
                lx: 300,
                ly: 70 + i * 72,
                angleX: Math.random() * 10,
                angleY: Math.random() * 10,
                speedX: 0.008 + Math.random() * 0.005,
                speedY: 0.008 + Math.random() * 0.005,
                label: `H1.${i + 1}`,
                getValue: () => '',
                color: 'rgba(139, 92, 246, 1)',
                glow: 'rgba(139, 92, 246, 0.4)',
                pulseStrength: 0
            });
        }

        // Hidden Layer 2 (2) - 6 nodes
        for (let i = 0; i < 6; i++) {
            nodes.push({
                id: 10 + i,
                layer: 2,
                baseX: 500,
                baseY: 70 + i * 72,
                lx: 500,
                ly: 70 + i * 72,
                angleX: Math.random() * 10,
                angleY: Math.random() * 10,
                speedX: 0.008 + Math.random() * 0.005,
                speedY: 0.008 + Math.random() * 0.005,
                label: `H2.${i + 1}`,
                getValue: () => '',
                color: 'rgba(168, 85, 247, 1)',
                glow: 'rgba(168, 85, 247, 0.4)',
                pulseStrength: 0
            });
        }

        // Output Layer (3) - 3 nodes
        const outVal0 = () => {
            if (neuralOutputRef.current && neuralOutputRef.current.length > 0) {
                return Number(neuralOutputRef.current[0]).toFixed(3);
            }
            return '0.500';
        };
        const outVal1 = () => {
            if (neuralOutputRef.current && neuralOutputRef.current.length > 1) {
                return Number(neuralOutputRef.current[1]).toFixed(3);
            }
            return '0.500';
        };
        const outVal2 = () => ((soulStateRef.current?.neuralActivity ?? 50) / 100).toFixed(3);

        nodes.push({ id: 16, layer: 3, baseX: 680, baseY: 150, lx: 680, ly: 150, angleX: Math.random() * 10, angleY: Math.random() * 10, speedX: 0.008 + Math.random() * 0.005, speedY: 0.008 + Math.random() * 0.005, label: 'THOUGHT', getValue: outVal0, color: 'rgba(6, 182, 212, 1)', glow: 'rgba(6, 182, 212, 0.4)', pulseStrength: 0 });
        nodes.push({ id: 17, layer: 3, baseX: 680, baseY: 250, lx: 680, ly: 250, angleX: Math.random() * 10, angleY: Math.random() * 10, speedX: 0.008 + Math.random() * 0.005, speedY: 0.008 + Math.random() * 0.005, label: 'EMOTION', getValue: outVal1, color: 'rgba(6, 182, 212, 1)', glow: 'rgba(6, 182, 212, 0.4)', pulseStrength: 0 });
        nodes.push({ id: 18, layer: 3, baseX: 680, baseY: 350, lx: 680, ly: 350, angleX: Math.random() * 10, angleY: Math.random() * 10, speedX: 0.008 + Math.random() * 0.005, speedY: 0.008 + Math.random() * 0.005, label: 'COGNITION', getValue: outVal2, color: 'rgba(6, 182, 212, 1)', glow: 'rgba(6, 182, 212, 0.4)', pulseStrength: 0 });

        const connections = [];
        const layer0 = nodes.filter(n => n.layer === 0);
        const layer1 = nodes.filter(n => n.layer === 1);
        const layer2 = nodes.filter(n => n.layer === 2);
        const layer3 = nodes.filter(n => n.layer === 3);

        layer0.forEach(s => {
            layer1.forEach(t => {
                connections.push({ from: s.id, to: t.id, weight: 0.3 + Math.random() * 0.7 });
            });
        });

        layer1.forEach(s => {
            layer2.forEach(t => {
                connections.push({ from: s.id, to: t.id, weight: 0.3 + Math.random() * 0.7 });
            });
        });

        layer2.forEach(s => {
            layer3.forEach(t => {
                connections.push({ from: s.id, to: t.id, weight: 0.3 + Math.random() * 0.7 });
            });
        });

        nodesRef.current = nodes;
        connectionsRef.current = connections;
    };

    const triggerBurst = (isBackward = false) => {
        const nodes = nodesRef.current;
        const connections = connectionsRef.current;
        if (nodes.length === 0 || connections.length === 0) return;

        if (!isBackward) {
            const inputs = nodes.filter(n => n.layer === 0);
            inputs.forEach(input => {
                const connFromInput = connections.filter(c => c.from === input.id);
                const shuffled = [...connFromInput].sort(() => 0.5 - Math.random());
                shuffled.slice(0, 2).forEach(c => {
                    pulsesRef.current.push({
                        from: c.from,
                        to: c.to,
                        progress: 0,
                        speed: 0.012 + Math.random() * 0.008,
                        history: [],
                        isBackward: false
                    });
                });
                input.pulseStrength = 1.0;
            });
        } else {
            const outputs = nodes.filter(n => n.layer === 3);
            outputs.forEach(output => {
                const connToOutput = connections.filter(c => c.to === output.id);
                const shuffled = [...connToOutput].sort(() => 0.5 - Math.random());
                shuffled.slice(0, 2).forEach(c => {
                    pulsesRef.current.push({
                        from: c.to,
                        to: c.from,
                        progress: 0,
                        speed: 0.012 + Math.random() * 0.008,
                        history: [],
                        isBackward: true
                    });
                });
                output.pulseStrength = 1.0;
            });
        }
    };

    const handlePulseArrival = (pulse) => {
        const nodes = nodesRef.current;
        const connections = connectionsRef.current;
        const targetNode = nodes.find(n => n.id === pulse.to);
        if (!targetNode) return;

        targetNode.pulseStrength = 1.0;

        if (!pulse.isBackward) {
            if (targetNode.layer === 1) {
                const conn = connections.filter(c => c.from === targetNode.id);
                const shuffled = [...conn].sort(() => 0.5 - Math.random());
                shuffled.slice(0, 2).forEach(c => {
                    pulsesRef.current.push({
                        from: c.from,
                        to: c.to,
                        progress: 0,
                        speed: 0.015 + Math.random() * 0.008,
                        history: [],
                        isBackward: false
                    });
                });
            } else if (targetNode.layer === 2) {
                const conn = connections.filter(c => c.from === targetNode.id);
                const shuffled = [...conn].sort(() => 0.5 - Math.random());
                shuffled.slice(0, 1).forEach(c => {
                    pulsesRef.current.push({
                        from: c.from,
                        to: c.to,
                        progress: 0,
                        speed: 0.015 + Math.random() * 0.008,
                        history: [],
                        isBackward: false
                    });
                });
            }
        } else {
            if (targetNode.layer === 2) {
                const conn = connections.filter(c => c.to === targetNode.id);
                const shuffled = [...conn].sort(() => 0.5 - Math.random());
                shuffled.slice(0, 2).forEach(c => {
                    pulsesRef.current.push({
                        from: c.to,
                        to: c.from,
                        progress: 0,
                        speed: 0.015 + Math.random() * 0.008,
                        history: [],
                        isBackward: true
                    });
                });
            } else if (targetNode.layer === 1) {
                const conn = connections.filter(c => c.to === targetNode.id);
                const shuffled = [...conn].sort(() => 0.5 - Math.random());
                shuffled.slice(0, 2).forEach(c => {
                    pulsesRef.current.push({
                        from: c.to,
                        to: c.from,
                        progress: 0,
                        speed: 0.015 + Math.random() * 0.008,
                        history: [],
                        isBackward: true
                    });
                });
            }
        }
    };

    useEffect(() => {
        initNetwork();

        const timer = setTimeout(() => {
            triggerBurst();
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    // Watch neuralOutput updates to trigger bursts
    useEffect(() => {
        neuralOutputRef.current = neuralOutput;
        if (neuralOutput) {
            triggerBurst();
        }
    }, [neuralOutput]);

    // Canvas animation loop and event binding
    useEffect(() => {
        const canvas = neuralCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animId;

        const parent = canvas.parentElement;
        if (!parent) return;

        // Resize function
        const handleResize = () => {
            const width = parent.clientWidth;
            const height = parent.clientHeight || 420;
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

        const handleMouseMove = (e) => {
            const { scale, offsetX, offsetY } = layoutRef.current;
            const rect = canvas.getBoundingClientRect();
            const screenX = e.clientX - rect.left;
            const screenY = e.clientY - rect.top;

            const lx = (screenX - offsetX) / scale;
            const ly = (screenY - offsetY) / scale;

            mousePosRef.current = { lx, ly };

            let closest = null;
            let minDist = 35;
            nodesRef.current.forEach(node => {
                const dx = node.lx - lx;
                const dy = node.ly - ly;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDist) {
                    minDist = dist;
                    closest = node;
                }
            });

            hoveredNodeRef.current = closest;
        };

        const handleMouseLeave = () => {
            hoveredNodeRef.current = null;
            mousePosRef.current = { lx: -999, ly: -999 };
        };

        const handleMouseDown = (e) => {
            const { scale, offsetX, offsetY } = layoutRef.current;
            const rect = canvas.getBoundingClientRect();
            const screenX = e.clientX - rect.left;
            const screenY = e.clientY - rect.top;

            const lx = (screenX - offsetX) / scale;
            const ly = (screenY - offsetY) / scale;

            let closest = null;
            let minDist = 40;
            nodesRef.current.forEach(node => {
                const dx = node.lx - lx;
                const dy = node.ly - ly;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDist) {
                    minDist = dist;
                    closest = node;
                }
            });

            if (closest) {
                ripplesRef.current.push({
                    x: closest.lx,
                    y: closest.ly,
                    radius: 0,
                    maxRadius: 35,
                    speed: 1.5,
                    opacity: 1.0
                });

                closest.pulseStrength = 1.0;

                if (closest.layer === 3) {
                    const connections = connectionsRef.current;
                    const conn = connections.filter(c => c.to === closest.id);
                    conn.forEach(c => {
                        pulsesRef.current.push({
                            from: c.to,
                            to: c.from,
                            progress: 0,
                            speed: 0.012 + Math.random() * 0.008,
                            history: [],
                            isBackward: true
                        });
                    });
                } else {
                    const connections = connectionsRef.current;
                    const conn = connections.filter(c => c.from === closest.id);
                    conn.forEach(c => {
                        pulsesRef.current.push({
                            from: c.from,
                            to: c.to,
                            progress: 0,
                            speed: 0.012 + Math.random() * 0.008,
                            history: [],
                            isBackward: false
                        });
                    });
                }
            } else {
                ripplesRef.current.push({
                    x: lx,
                    y: ly,
                    radius: 0,
                    maxRadius: 50,
                    speed: 2.0,
                    opacity: 1.0
                });

                const inputs = nodesRef.current.filter(n => n.layer === 0);
                const randInput = inputs[Math.floor(Math.random() * inputs.length)];
                if (randInput) {
                    randInput.pulseStrength = 1.0;
                    const connections = connectionsRef.current;
                    const conn = connections.filter(c => c.from === randInput.id);
                    if (conn.length > 0) {
                        const randomConn = conn[Math.floor(Math.random() * conn.length)];
                        pulsesRef.current.push({
                            from: randomConn.from,
                            to: randomConn.to,
                            progress: 0,
                            speed: 0.012 + Math.random() * 0.008,
                            history: [],
                            isBackward: false
                        });
                    }
                }
            }
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);
        canvas.addEventListener('mousedown', handleMouseDown);

        const loop = () => {
            const dpr = window.devicePixelRatio || 1;
            const scale = layoutRef.current.scale;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.save();
            ctx.scale(dpr, dpr);

            // Telemetry Concentric Circles
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.02)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 12]);
            ctx.beginPath();
            ctx.arc(layoutRef.current.width / 2, layoutRef.current.height / 2, 100 * scale, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(layoutRef.current.width / 2, layoutRef.current.height / 2, 220 * scale, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Float nodes
            nodesRef.current.forEach(node => {
                node.angleX += node.speedX;
                node.angleY += node.speedY;
                node.lx = node.baseX + Math.sin(node.angleX) * 6;
                node.ly = node.baseY + Math.cos(node.angleY) * 6;
                node.pulseStrength = Math.max(0, node.pulseStrength * 0.94 - 0.004);
            });

            // Update ripples
            ripplesRef.current.forEach((ripple, idx) => {
                ripple.radius += ripple.speed;
                ripple.opacity = Math.max(0, 1 - (ripple.radius / ripple.maxRadius));
                if (ripple.radius >= ripple.maxRadius) {
                    ripplesRef.current.splice(idx, 1);
                } else {
                    ctx.beginPath();
                    ctx.arc(toScreenX(ripple.x), toScreenY(ripple.y), ripple.radius * scale, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(0, 212, 255, ${ripple.opacity * 0.4})`;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }
            });

            // Draw Synapses
            const nodes = nodesRef.current;
            connectionsRef.current.forEach(c => {
                const fromNode = nodes.find(n => n.id === c.from);
                const toNode = nodes.find(n => n.id === c.to);
                if (!fromNode || !toNode) return;

                const x1 = toScreenX(fromNode.lx);
                const y1 = toScreenY(fromNode.ly);
                const x2 = toScreenX(toNode.lx);
                const y2 = toScreenY(toNode.ly);

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);

                let alpha = 0.06;
                if (fromNode === hoveredNodeRef.current || toNode === hoveredNodeRef.current) {
                    alpha = 0.35;
                } else {
                    alpha = 0.06 + Math.max(fromNode.pulseStrength, toNode.pulseStrength) * 0.15;
                }

                const grad = ctx.createLinearGradient(x1, y1, x2, y2);
                grad.addColorStop(0, fromNode.color.replace('1)', `${alpha})`));
                grad.addColorStop(1, toNode.color.replace('1)', `${alpha})`));
                ctx.strokeStyle = grad;
                ctx.lineWidth = (fromNode === hoveredNodeRef.current || toNode === hoveredNodeRef.current) ? 1.5 : 1.0;
                ctx.stroke();
            });

            // Update & Draw Pulses
            const pulses = pulsesRef.current;
            for (let i = pulses.length - 1; i >= 0; i--) {
                const p = pulses[i];
                p.progress += p.speed;

                if (p.progress >= 1) {
                    handlePulseArrival(p);
                    pulses.splice(i, 1);
                    continue;
                }

                const fromNode = nodes.find(n => n.id === p.from);
                const toNode = nodes.find(n => n.id === p.to);
                if (!fromNode || !toNode) {
                    pulses.splice(i, 1);
                    continue;
                }

                const x1 = toScreenX(fromNode.lx);
                const y1 = toScreenY(fromNode.ly);
                const x2 = toScreenX(toNode.lx);
                const y2 = toScreenY(toNode.ly);

                const px = x1 + (x2 - x1) * p.progress;
                const py = y1 + (y2 - y1) * p.progress;

                p.history.push({ x: px, y: py });
                if (p.history.length > 7) {
                    p.history.shift();
                }

                if (p.history.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(p.history[0].x, p.history[0].y);
                    for (let h = 1; h < p.history.length; h++) {
                        ctx.lineTo(p.history[h].x, p.history[h].y);
                    }
                    const grad = ctx.createLinearGradient(
                        p.history[0].x, p.history[0].y,
                        p.history[p.history.length - 1].x, p.history[p.history.length - 1].y
                    );
                    const pulseColor = p.isBackward ? toNode.color : fromNode.color;
                    grad.addColorStop(0, pulseColor.replace('1)', '0'));
                    grad.addColorStop(1, pulseColor.replace('1)', '0.8'));
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = 2.0;
                    ctx.stroke();
                }

                const pulseColor = p.isBackward ? toNode.color : fromNode.color;
                ctx.beginPath();
                ctx.arc(px, py, 3.0 * scale, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.shadowBlur = 10 * scale;
                ctx.shadowColor = pulseColor;
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // Draw Nodes
            nodes.forEach(node => {
                const nx = toScreenX(node.lx);
                const ny = toScreenY(node.ly);

                let radius = (node.layer === 0 || node.layer === 3 ? 9 : 7) * scale;
                if (node === hoveredNodeRef.current) {
                    radius += 2 * scale;
                }

                const glow = node.pulseStrength;

                if (glow > 0.01 || node === hoveredNodeRef.current) {
                    ctx.beginPath();
                    ctx.arc(nx, ny, radius + (6 + glow * 10) * scale, 0, Math.PI * 2);
                    ctx.fillStyle = node.color.replace('1)', `${0.08 + glow * 0.15})`);
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(nx, ny, radius + 4 * scale, 0, Math.PI * 2);
                    ctx.strokeStyle = node.color.replace('1)', `${0.15 + glow * 0.45})`);
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                ctx.beginPath();
                ctx.arc(nx, ny, radius, 0, Math.PI * 2);
                ctx.fillStyle = node === hoveredNodeRef.current ? '#ffffff' : node.color.replace('1)', `${0.35 + glow * 0.65})`);
                ctx.shadowBlur = (4 + glow * 12) * scale;
                ctx.shadowColor = node.color;
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.beginPath();
                ctx.arc(nx, ny, radius * 0.35, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();

                ctx.font = `bold ${Math.max(10, Math.round(11 * scale))}px 'Inter', system-ui, sans-serif`;
                ctx.textBaseline = 'middle';

                if (node.layer === 0) {
                    ctx.textAlign = 'right';
                    ctx.fillStyle = 'rgba(230, 246, 255, 0.9)';
                    ctx.fillText(node.label, nx - radius - 12, ny - 6 * scale);

                    ctx.font = `${Math.max(9, Math.round(10 * scale))}px ui-monospace, SFMono-Regular, monospace`;
                    ctx.fillStyle = node.color;
                    ctx.fillText(node.getValue(), nx - radius - 12, ny + 8 * scale);
                } else if (node.layer === 3) {
                    ctx.textAlign = 'left';
                    ctx.fillStyle = 'rgba(230, 246, 255, 0.9)';
                    ctx.fillText(node.label, nx + radius + 12, ny - 6 * scale);

                    ctx.font = `${Math.max(9, Math.round(10 * scale))}px ui-monospace, SFMono-Regular, monospace`;
                    ctx.fillStyle = node.color;
                    ctx.fillText(node.getValue(), nx + radius + 12, ny + 8 * scale);
                } else if (node === hoveredNodeRef.current) {
                    ctx.textAlign = 'center';
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(node.label, nx, ny - radius - 12);
                }
            });

            ctx.restore();
            animId = requestAnimationFrame(loop);
        };

        animId = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(animId);
            resizeObserver.disconnect();
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            canvas.removeEventListener('mousedown', handleMouseDown);
        };
    }, [neuralCanvasRef]);

    const renderNeuralOutput = () => {
        if (!neuralOutput) return null;
        return (
            <div className="neural-output-container">
                <h4>Neural Network Output:</h4>
                <div className="neural-output-values">
                    {neuralOutput.map((value, index) => (
                        <div key={index} className="neural-output-value">
                            Output {index + 1}: {Number(value).toFixed(4)}
                        </div>
                    ))}
                </div>
                <button
                    className="neural-sim-button"
                    onClick={runNeuralSimulation}
                >
                    Run Simulation
                </button>
            </div>
        );
    };

    const activity = Number(soulState?.neuralActivity ?? 0);

    return (
        <div className="neural-panel">
            <div className="neural-header">
                <h3>Neural Cognition</h3>
                <button
                    className="back-button"
                    onClick={() => setActiveTab("chat")}
                >
                    <i className="icon-arrow-left"></i> Back to Chat
                </button>
            </div>

            <div className="neural-description">
                <p>
                    My neural network processes thoughts and emotions. Current activation level: {activity.toFixed(2)}%
                </p>
            </div>

            {renderNeuralOutput()}

            <div className="neural-visualization">
                <canvas
                    ref={neuralCanvasRef}
                />
            </div>

            <div className="neural-actions">
                <button
                    className="neural-action-button"
                    onClick={runNeuralSimulation}
                >
                    Run Neural Simulation
                </button>
                <button
                    className="neural-action-button"
                    onClick={randomNeuralTest}
                >
                    Random Input Test
                </button>
            </div>
        </div>
    );
};

export default NeuralPanel;