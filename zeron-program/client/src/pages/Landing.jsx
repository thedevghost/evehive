import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LogIn, ArrowRight, Shield, Cpu } from 'lucide-react';
import eventHiveLogo from '../assets/eventhive-logo.svg';
import eventHiveLogoLight from '../assets/eventhive-logo-light.svg';

const Orb = ({ className }) => (
  <div className={`absolute rounded-full blur-[100px] pointer-events-none ${className}`} />
);

export default function Landing() {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'dark');

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setTheme(root.getAttribute('data-theme') || 'dark');
    });
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <Orb className="w-[600px] h-[600px] bg-white/[0.03] -top-60 -left-60" />
      <Orb className="w-[500px] h-[500px] bg-white/[0.02] -bottom-40 -right-40" />

      {/* Subtle grid overlay */}
      <div
        className={`absolute inset-0 pointer-events-none ${theme === 'light' ? 'opacity-[0.22]' : 'opacity-[0.03]'}`}
        style={{
          backgroundImage: theme === 'light'
            ? 'linear-gradient(rgba(79,70,229,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(79,70,229,0.55) 1px, transparent 1px)'
            : 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Logo mark */}
        <div className="flex justify-center mb-10">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="w-20 h-20 glass-card flex items-center justify-center relative shine"
            style={{ borderRadius: '28px' }}
          >
            <div className="absolute inset-0 rounded-[28px] bg-gradient-to-b from-white/10 to-transparent" />
            <Cpu className="w-9 h-9 text-white/80" strokeWidth={1.5} />
          </motion.div>
        </div>

        {/* Heading */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-4"
          >
            <img
              src={theme === 'light' ? eventHiveLogoLight : eventHiveLogo}
              alt="EventHive"
              className="h-14 sm:h-16 md:h-20 w-auto object-contain"
            />
          </motion.div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-white leading-[0.9] mb-6">
            ENTER THE<br />
            <span className="text-white/30">PROGRAM</span>
          </h1>
          <p className="text-base text-white/40 max-w-sm mx-auto leading-relaxed font-light">
            Form your squad, unlock each stage, and race to the top of the live leaderboard.
          </p>
        </div>

        {/* Cards */}
        <div className="glass-card p-2 shine">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Link to="/register" className="group block">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="glass-card-sm p-6 cursor-pointer hover:bg-white/[0.06] transition-all duration-200 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.03] rounded-full blur-2xl" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-white/70" />
                  </div>
                  <span className="text-[10px] tracking-[0.2em] text-white/30 uppercase font-medium">New Team</span>
                </div>
                <div className="font-bold text-white text-lg mb-1">Register</div>
                <p className="text-xs text-white/30 font-light">Initialize your team for the event</p>
                <div className="mt-6 flex items-center gap-2 text-white/50 group-hover:text-white/80 transition-colors">
                  <span className="text-xs font-medium uppercase tracking-wider">Begin</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </Link>

            <Link to="/login" className="group block">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="glass-card-sm p-6 cursor-pointer hover:bg-white/[0.06] transition-all duration-200 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.03] rounded-full blur-2xl" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                    <LogIn className="w-4 h-4 text-white/70" />
                  </div>
                  <span className="text-[10px] tracking-[0.2em] text-white/30 uppercase font-medium">Existing Team</span>
                </div>
                <div className="font-bold text-white text-lg mb-1">Login</div>
                <p className="text-xs text-white/30 font-light">Access your team's dashboard</p>
                <div className="mt-6 flex items-center gap-2 text-white/50 group-hover:text-white/80 transition-colors">
                  <span className="text-xs font-medium uppercase tracking-wider">Enter</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </Link>
          </div>

          {/* Admin link inside the card  */}
          <div className="mt-2 px-4 pb-3 pt-1">
            <Link
              to="/login?type=admin"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl hover:bg-white/[0.04] transition-colors group"
            >
              <Shield className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 transition-colors" />
              <span className="text-[10px] tracking-[0.25em] text-white/20 group-hover:text-white/40 uppercase transition-colors font-medium">
                Admin Terminal
              </span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
