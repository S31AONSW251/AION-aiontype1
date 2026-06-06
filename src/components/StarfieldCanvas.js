import React, { useEffect, useRef } from 'react';

const StarfieldCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const starsCount = 250;
    const stars = [];

    // Initialize stars with random 3D coordinates (X, Y, Z)
    for (let i = 0; i < starsCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * width,
        size: Math.random() * 1.5 + 0.5,
      });
    }

    const speed = 1.2;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const animate = () => {
      // Deep space background with slight trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < starsCount; i++) {
        const star = stars[i];

        // Advance stars forward
        star.z -= speed;

        // Recycle stars that move past the screen boundary back into the distance
        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
          star.z = width;
        }

        // 3D perspective projection formula
        const scaleFactor = 160.0 / star.z;
        const px = star.x * scaleFactor + width / 2;
        const py = star.y * scaleFactor + height / 2;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const rawSize = star.size * (1 - star.z / width) * 2.5;
          const size = Math.max(0, rawSize);
          const alpha = Math.max(0, Math.min(1, 1 - star.z / width));

          if (size > 0 && alpha > 0) {
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fill();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="aion-starfield"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -2,
        pointerEvents: 'none',
        background: '#000000',
      }}
    />
  );
};

export default StarfieldCanvas;
