import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'dark'
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.style.setProperty('--background', '#eef1ff');        /* Lavender tint */
      root.style.setProperty('--foreground', '#13216b');         /* Deep indigo text */
      root.style.setProperty('--primary', '#1d4ed8');            /* Royal blue */
      root.style.setProperty('--primary-foreground', '#ffffff');
      root.style.setProperty('--secondary', '#4f46e5');          /* Indigo accent */
      root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.82)');
      root.style.setProperty('--glass-border', 'rgba(79, 70, 229, 0.22)');
      root.style.setProperty('--glass-shadow', 'rgba(37, 99, 235, 0.14)');
      root.style.setProperty('--glow', 'rgba(79, 70, 229, 0.12)');
    } else {
      root.style.setProperty('--background', '#0b0f1a');
      root.style.setProperty('--foreground', '#e7ebff');
      root.style.setProperty('--primary', '#4f46e5');
      root.style.setProperty('--primary-foreground', '#ffffff');
      root.style.setProperty('--secondary', '#343b5d');
      root.style.setProperty('--glass-bg', 'rgba(20, 26, 45, 0.78)');
      root.style.setProperty('--glass-border', 'rgba(115, 130, 201, 0.22)');
      root.style.setProperty('--glass-shadow', 'rgba(2, 6, 23, 0.72)');
      root.style.setProperty('--glow', 'rgba(79, 70, 229, 0.22)');
    }
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <motion.button
      onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 glass-card flex items-center justify-center transition-colors"
      style={{ borderRadius: '14px' }}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ duration: 0.2 }}
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4 text-white/50" strokeWidth={1.5} />
            : <Sun className="w-4 h-4" style={{ color: '#1d4ed8', opacity: 0.9 }} strokeWidth={1.5} />
          }
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}
