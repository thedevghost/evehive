import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, ArrowRight, Shield } from 'lucide-react';
import BackButton from '../components/BackButton';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const isAdmin = username.toLowerCase() === 'admin';

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    if (p.get('type') === 'admin') setUsername('admin');
  }, [location]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isAdmin) {
        const res = await api.post('/admin/login', { password });
        login(res.data.token, null, 'admin');
        navigate('/admin');
      } else {
        const res = await api.post('/auth/login', { username, password });
        login(res.data.token, res.data.team);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/[0.015] rounded-full blur-[120px] pointer-events-none" />

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <BackButton fallback="/" label="Back" />
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 glass-card mb-5" style={{ borderRadius: '18px' }}>
            {isAdmin ? <Shield className="w-6 h-6 text-white/70" strokeWidth={1.5} /> : <User className="w-6 h-6 text-white/70" strokeWidth={1.5} />}
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            {isAdmin ? 'Admin Access' : 'Welcome Back'}
          </h2>
        </div>

        {/* Form card */}
        <div className="glass-card p-8 shine">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-6 p-4 rounded-xl bg-white/[0.04] border border-white/10 text-white/60 text-sm text-center font-medium"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <input
                required type="text"
                className="w-full glass-card-sm px-4 py-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-medium"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div>
              <input
                required type="password"
                className="w-full glass-card-sm px-4 py-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-medium"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={loading}
              type="submit"
              className="w-full mt-2 py-4 bg-green-500 hover:bg-green-400 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-all shadow-[0_0_30px_rgba(34,197,94,0.25)] hover:shadow-[0_0_40px_rgba(34,197,94,0.4)]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  {isAdmin ? 'Access Command' : 'Enter Portal'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
            <p className="text-xs text-white/25 font-light">
              No account?{' '}
              <Link to="/register" className="text-white/50 hover:text-white/80 transition-colors font-medium underline underline-offset-4">
                Register a team
              </Link>
            </p>
            {!isAdmin && (
              <Link to="/?type=admin" className="block mt-3 text-[10px] text-white/15 hover:text-white/30 tracking-widest uppercase transition-colors">
                ← Back to home
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
