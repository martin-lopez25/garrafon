import React, { useEffect, useRef, useState } from 'react';
import { CloudRain, Droplets } from 'lucide-react';

export const AmbientRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Subtle gentle rain droplets
    const dropsCount = 35;
    const drops = Array.from({ length: dropsCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 1.5 + Math.random() * 2.5,
      length: 12 + Math.random() * 16,
      opacity: 0.15 + Math.random() * 0.25,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      drops.forEach((drop) => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 1, drop.y + drop.length);
        ctx.strokeStyle = `rgba(56, 189, 248, ${drop.opacity})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        drop.y += drop.speed;
        drop.x -= 0.3; // subtle tilt

        if (drop.y > height) {
          drop.y = -drop.length;
          drop.x = Math.random() * width;
        }
        if (drop.x < 0) {
          drop.x = width;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled]);

  return (
    <>
      {enabled && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-0 opacity-70"
        />
      )}
      {/* Floating gentle rain toggle button at bottom right */}
      <button
        id="btn-toggle-ambient-rain"
        onClick={() => setEnabled(!enabled)}
        title={enabled ? 'Pausar lluvia ambiental' : 'Activar lluvia ambiental'}
        className={`fixed bottom-4 right-4 z-30 p-2.5 rounded-full backdrop-blur-md border shadow-lg transition-all cursor-pointer ${
          enabled
            ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900 shadow-cyan-950/50'
            : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200'
        }`}
      >
        <CloudRain className="w-4 h-4" />
      </button>
    </>
  );
};
