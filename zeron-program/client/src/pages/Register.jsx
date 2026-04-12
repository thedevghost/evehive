import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Plus, Trash2, ArrowRight } from 'lucide-react';
import BackButton from '../components/BackButton';

export default function Register() {
  const [formData, setFormData] = useState({
    team_name: '', username: '', password: '', volunteer_name: '', volunteer_phone: '', access_code: ''
  });
  const [members, setMembers] = useState([{ name: '', phone_number: '' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleMemberChange = (index, field, value) => {
    const m = [...members];
    m[index][field] = value;
    setMembers(m);
  };

  const addMember = () => setMembers([...members, { name: '', phone_number: '' }]);
  const removeMember = (i) => setMembers(members.filter((_, idx) => idx !== i));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', { ...formData, members });
      login(res.data.token, res.data.team);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full glass-card-sm px-4 py-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-medium";
  const labelClass = "block text-[10px] tracking-[0.2em] text-white/30 uppercase mb-2 font-medium";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-10 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/[0.015] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-2xl"
      >
        <BackButton fallback="/login" label="Back" />
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 glass-card mb-5" style={{ borderRadius: '18px' }}>
            <UserPlus className="w-6 h-6 text-white/70" strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Register Team</h2>
        </div>

        <div className="glass-card p-8 shine">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-4 rounded-xl bg-white/[0.04] border border-white/10 text-white/60 text-sm text-center font-medium"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Access code — featured */}
            <div className="p-5 glass-card-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent" />
              <label className={labelClass + ' relative z-10'}>Staff Access Code</label>
              <input
                required type="text"
                className="w-full bg-transparent px-0 py-2 text-2xl font-mono font-black text-white tracking-[0.25em] focus:outline-none border-b border-white/10 focus:border-white/30 transition-all text-center placeholder:text-white/15 relative z-10"
                placeholder="· · · · · ·"
                value={formData.access_code}
                onChange={e => setFormData({ ...formData, access_code: e.target.value.toUpperCase() })}
              />
              <p className="text-[10px] text-white/20 mt-3 text-center font-light relative z-10">Provided by event staff</p>
            </div>

            {/* Team info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input required type="text" className={inputClass} placeholder="Team Name" value={formData.team_name} onChange={e => setFormData({ ...formData, team_name: e.target.value })} />
              </div>
              <div>
                <input required type="text" className={inputClass} placeholder="Username" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <input required type="password" className={inputClass} placeholder="Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
              </div>
            </div>

            {/* Volunteer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input required type="text" className={inputClass} placeholder="Volunteer Name" value={formData.volunteer_name} onChange={e => setFormData({ ...formData, volunteer_name: e.target.value })} />
              </div>
              <div>
                <input required type="text" className={inputClass} placeholder="Volunteer Phone" value={formData.volunteer_phone} onChange={e => setFormData({ ...formData, volunteer_phone: e.target.value })} />
              </div>
            </div>

            {/* Members */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] tracking-[0.2em] text-white/20 uppercase font-medium">Members</span>
                <button
                  type="button" onClick={addMember}
                  className="flex items-center gap-1.5 text-[10px] tracking-widest text-white/30 hover:text-white/60 uppercase transition-colors font-medium"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {members.map((m, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-3 items-center"
                    >
                      <div className="w-7 h-7 flex-shrink-0 rounded-full glass-card-sm flex items-center justify-center text-[10px] text-white/30 font-bold">
                        {idx + 1}
                      </div>
                      <input required type="text" placeholder="Member name" value={m.name} onChange={e => handleMemberChange(idx, 'name', e.target.value)}
                        className="flex-1 glass-card-sm px-3 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-medium" />
                      <input required type="text" placeholder="Phone" value={m.phone_number} onChange={e => handleMemberChange(idx, 'phone_number', e.target.value)}
                        className="flex-1 glass-card-sm px-3 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-medium" />
                      {members.length > 1 && (
                        <button type="button" onClick={() => removeMember(idx)}
                          className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors text-white/20 hover:text-white/50 flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={loading}
              type="submit"
              className="w-full mt-2 py-4 bg-green-500 hover:bg-green-400 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 shadow-[0_0_30px_rgba(34,197,94,0.25)] hover:shadow-[0_0_40px_rgba(34,197,94,0.4)] transition-all"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>Register Team <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>

            <p className="text-center text-xs text-white/20 font-light pt-2">
              Already registered?{' '}
              <Link to="/login" className="text-white/40 hover:text-white/70 transition-colors underline underline-offset-4">Sign in</Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
