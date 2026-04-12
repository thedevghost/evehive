import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useGame } from '../hooks/useGame';
import { useNavigate } from 'react-router-dom';
import LeaderboardPanel from '../components/LeaderboardPanel';
import QRScanner from '../components/QRScanner';
import { Trophy, Users, Phone, Zap, LogOut, Signal, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

export default function Dashboard() {
  const { team, logout } = useAuth();
  const { roundState, leaderboard, gameOver } = useGame();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [teamScore, setTeamScore] = useState(0);
  const [teamRank, setTeamRank] = useState('-');
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => { if (gameOver) navigate('/results'); }, [gameOver, navigate]);

  useEffect(() => {
    if (roundState.active) {
      if (roundState.round_type === 'quiz') navigate('/game/quiz');
      if (roundState.round_type === 'treasure_hunt') navigate('/game/treasure');
    }
  }, [roundState, navigate]);

  useEffect(() => {
    api.get('/teams/me').then(res => {
      setMembers(res.data.members || []);
      setTeamScore(res.data.team.total_score);
    });
    api.get('/teams/leaderboard').then(res => {
      const myTeam = res.data.leaderboard.find(t => t.team_name === team.team_name);
      if (myTeam) setTeamRank(myTeam.rank);
    });
  }, [team]);

  useEffect(() => {
    const lg = leaderboard.find(t => t.team_name === team.team_name);
    if (lg) { setTeamScore(lg.total_score); setTeamRank(lg.rank); }
  }, [leaderboard, team]);

  if (!team) return null;

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-10 max-w-7xl mx-auto relative">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Header */}
      <header className="flex justify-between items-center mb-10 relative z-10">
        <div>
          <div className="text-[10px] tracking-[0.3em] text-white/25 uppercase mb-1 font-medium">Zeron Protocol</div>
          <h1 className="text-2xl font-black text-white tracking-tight">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScannerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 glass-card-sm rounded-xl text-xs text-white/40 hover:text-primary transition-colors font-medium uppercase tracking-wider hover:bg-white/[0.05]"
            title="Scan QR Code"
          >
            <QrCode className="w-3.5 h-3.5" /> Scan
          </button>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 px-4 py-2 glass-card-sm rounded-xl text-xs text-white/40 hover:text-white/70 transition-colors font-medium uppercase tracking-wider"
          >
            <LogOut className="w-3.5 h-3.5" /> Disconnect
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        <div className="lg:col-span-2 space-y-6">

          {/* Team card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 shine relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl" />
            <div className="text-[10px] tracking-[0.25em] text-white/25 uppercase mb-2 font-medium">Active Team</div>
            <h2 className="text-4xl font-black text-white mb-6 tracking-tight">{team.team_name}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card-sm p-5">
                <div className="text-[10px] tracking-widest text-white/25 uppercase mb-2 font-medium">Score</div>
                <motion.div
                  key={teamScore}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl font-black text-white font-mono"
                >
                  {teamScore}
                </motion.div>
              </div>
              <div className="glass-card-sm p-5">
                <div className="text-[10px] tracking-widest text-white/25 uppercase mb-2 font-medium">Rank</div>
                <div className="text-4xl font-black text-white font-mono">#{teamRank}</div>
              </div>
            </div>
          </motion.div>

          {/* Waiting state */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 relative overflow-hidden shine"
          >
            <div className="flex items-center gap-4">
              <div className="glass-card-sm p-3 rounded-xl">
                <Signal className="w-5 h-5 text-white/40" strokeWidth={1.5} />
              </div>
              <div>
                <div className="font-semibold text-white/80 mb-1">Standby Mode</div>
                <p className="text-sm text-white/30 font-light">Waiting for admin to launch next round. Stay alert.</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" />
                <span className="text-[10px] text-white/25 uppercase tracking-widest font-medium">Live</span>
              </div>
            </div>
          </motion.div>

          {/* Team roster */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 shine"
          >
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-4 h-4 text-white/30" strokeWidth={1.5} />
              <span className="text-[10px] tracking-[0.2em] text-white/30 uppercase font-medium">Team Roster</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {members.map((m, i) => (
                <div key={i} className="glass-card-sm p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full glass flex items-center justify-center text-white/60 font-bold text-sm shrink-0">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-white/80 truncate">{m.name}</div>
                    <div className="text-[11px] text-white/25 font-light truncate flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" /> {m.phone_number}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Leaderboard sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-1"
        >
          <LeaderboardPanel leaderboard={leaderboard} teamId={team.team_id} />
        </motion.div>
      </div>

      <QRScanner isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
    </div>
  );
}
