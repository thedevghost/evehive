import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CursorBubble() {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Watch for theme changes from localStorage
  useEffect(() => {
    const onStorage = () => setTheme(localStorage.getItem('theme') || 'dark');
    window.addEventListener('storage', onStorage);
    // Also poll every 500ms since same-tab changes don't trigger storage event
    const interval = setInterval(() => {
      const t = localStorage.getItem('theme') || 'dark';
      setTheme(t);
    }, 500);
    return () => { window.removeEventListener('storage', onStorage); clearInterval(interval); };
  }, []);

  // Snappy inner dot
  const dotX = useSpring(mouseX, { stiffness: 1200, damping: 40 });
  const dotY = useSpring(mouseY, { stiffness: 1200, damping: 40 });

  // Floaty trailing ring
  const ringX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const ringY = useSpring(mouseY, { stiffness: 100, damping: 20 });

  useEffect(() => {
    const move = (e) => { mouseX.set(e.clientX); mouseY.set(e.clientY); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [mouseX, mouseY]);

  const isLight = theme === 'light';
  const dotColor = isLight ? 'rgba(249, 115, 22, 0.9)' : 'rgba(255, 255, 255, 0.9)';
  const dotGlow = isLight ? '0 0 8px rgba(249, 115, 22, 0.5)' : '0 0 8px rgba(255, 255, 255, 0.5)';
  const ringBorder = isLight ? 'rgba(22, 163, 74, 0.5)' : 'rgba(255, 255, 255, 0.35)';
  const ringBg = isLight ? 'rgba(22, 163, 74, 0.06)' : 'rgba(255, 255, 255, 0.03)';

  return (
    <>
      {/* Trailing ring */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0, left: 0,
          x: ringX, y: ringY,
          translateX: '-50%', translateY: '-50%',
          width: 28, height: 28,
          borderRadius: '50%',
          border: `1px solid ${ringBorder}`,
          background: ringBg,
          backdropFilter: 'blur(2px)',
          pointerEvents: 'none',
          zIndex: 9998,
        }}
      />
      {/* Sharp dot */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0, left: 0,
          x: dotX, y: dotY,
          translateX: '-50%', translateY: '-50%',
          width: 5, height: 5,
          borderRadius: '50%',
          background: dotColor,
          boxShadow: dotGlow,
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      />
    </>
  );
}
