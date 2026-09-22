'use client';

import { useEffect, useRef } from 'react';

class Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  life: number;
  color: string;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 3.5 + 1.2;
    this.speedX = (Math.random() - 0.5) * 1.8;
    this.speedY = (Math.random() - 0.5) * 1.8;
    this.life = 1.0;
    this.color = color;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    // Upward drift for ember physics
    this.speedY -= 0.08;
    // Horizontal sway
    this.speedX += (Math.random() - 0.5) * 0.08;
    this.life -= 0.02;
    this.size *= 0.96;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.size < 0.1 || this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life * 0.85);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function MoltenCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    // Only enable on desktop with fine pointer / hover support
    const mediaQuery = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
    if (!mediaQuery.matches) return;

    // Respect user's reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    
    let particles: Particle[] = [];
    let animationFrameId: number | null = null;
    let isRunning = false;
    let mouseX = -100;
    let mouseY = -100;

    // Cache theme accent once — avoid expensive getComputedStyle on every mousemove
    let cachedAccent = '#2DD4BF';
    const updateAccent = () => {
      try {
        const rootStyle = getComputedStyle(document.documentElement);
        const accent = rootStyle.getPropertyValue('--accent').trim();
        if (accent) cachedAccent = accent;
      } catch {
        // Fallback to default
      }
    };
    updateAccent();

    // Re-read accent only when theme switches
    const themeObserver = new MutationObserver(() => updateAccent());
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize, { passive: true });
    resize();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(ctx);
      }
      
      particles = particles.filter((p) => p.life > 0 && p.size > 0.1);
      
      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        isRunning = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    const startLoop = () => {
      if (!isRunning) {
        isRunning = true;
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - mouseX;
      const dy = e.clientY - mouseY;
      // Skip sub-pixel noise to reduce spawn rate
      if (dx * dx + dy * dy < 16) return;

      mouseX = e.clientX;
      mouseY = e.clientY;
      
      if (particles.length < 30) {
        particles.push(new Particle(mouseX, mouseY, cachedAccent));
      }
      startLoop();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      themeObserver.disconnect();
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999] hidden lg:block"
      aria-hidden="true"
    />
  );
}
