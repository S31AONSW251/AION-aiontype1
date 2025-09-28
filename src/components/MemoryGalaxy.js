import React, { useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const GalaxyPoints = ({ memories }) => {
  const ref = useRef();

  const positions = useMemo(() => {
    const safeMemories = Array.isArray(memories) ? memories : [];
    const points = new Float32Array(safeMemories.length * 3);
    
    safeMemories.forEach((mem, i) => {
      // Safely extract vector components with fallbacks
      const vector = Array.isArray(mem?.vector) ? mem.vector : [];
      const x = ((vector[0] || 0) * 10) - 5;
      const y = ((vector[1] || 0) * 10) - 5;
      const z = ((vector[2] || 0) * 10) - 5;
      
      points.set([x, y, z], i * 3);
    });
    
    return points;
  }, [memories]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 15;
      ref.current.rotation.y -= delta / 20;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
};

const MemoryGalaxy = ({ memories }) => {
  const safeMemories = Array.isArray(memories) ? memories : [];
  
  return (
    <div className="memory-galaxy-container">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        {safeMemories.length > 0 && <GalaxyPoints memories={safeMemories} />}
      </Canvas>
      <div className="galaxy-overlay">
        <h3>AION's Mind</h3>
        <p>{safeMemories.length} memories visualized. Similar thoughts cluster together.</p>
        {safeMemories.length === 0 && (
          <p className="no-memories-message">No memories to display</p>
        )}
      </div>
    </div>
  );
};

MemoryGalaxy.propTypes = {
  memories: PropTypes.arrayOf(
    PropTypes.shape({
      vector: PropTypes.arrayOf(PropTypes.number),
    })
  ),
};

MemoryGalaxy.defaultProps = {
  memories: [],
};

export default MemoryGalaxy;