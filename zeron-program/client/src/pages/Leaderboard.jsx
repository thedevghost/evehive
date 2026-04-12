import React, { useEffect, useState } from 'react';
import { useGame } from '../hooks/useGame';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown } from 'lucide-react';
import BackButton from '../components/BackButton';

export default function Leaderboard() {
  const { leaderboard } = useGame();
  const [board, setBoard] = useState([]);

  useEffect(() => {
    api.get('/teams/leaderboard').then(res => setBoard(res.data.leaderboard)).catch(console.error);
  }, []);

  useEffect(() => {
    if (leaderboard?.length > 0) setBoard(leaderboard);
  }, [leaderboard]);

  return (
    <div className="min-h-screen p-6 sm:p-10 relative">
      {/* Grid overlay */}
      <div className="fixed inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <BackButton fallback="/dashboard" label="Back" />
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.4 }}
            className="inline-flex items-center justify-center w-16 h-16 glass-card mb-6 shine"
            style={{ borderRadius: '20px' }}
          >
            <Trophy className="w-7 h-7 text-white/60" strokeWidth={1.5} />
          </motion.div>
          <div className="text-[10px] tracking-[0.35em] text-white/25 uppercase font-medium mb-3">Zeron Protocol</div>
          <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tighter">Leaderboard</h1>
        </div>

        {/* Board */}
        <div className="space-y-3">
          <AnimatePresence>
            {board.map((team, index) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;
              const rankClass = isFirst ? 'leaderboard-rank-1' : isSecond ? 'leaderboard-rank-2' : isThird ? 'leaderboard-rank-3' : '';
              
              let badgeBG = 'bg-white/[0.03] border-white/10';
              let medalColor = 'text-white/25';
              let containerBG = 'hover:bg-white/[0.03]';
              let textSize = 'text-base';
              let nameColor = 'text-white/50';
              let scoreColor = 'text-white/35';
              let scoreSize = 'text-xl';
              
              if (isFirst) {
                  badgeBG = 'bg-gradient-to-r from-green-400/20 to-emerald-600/20 border-green-300/60 shadow-lg shadow-green-500/20';
                  containerBG = 'shadow-[0_0_40px_rgba(34,197,94,0.22)]';
                textSize = 'text-2xl';
                nameColor = 'text-white';
                  scoreColor = 'text-green-300';
                scoreSize = 'text-4xl';
              } else if (isSecond) {
                  badgeBG = 'bg-gradient-to-r from-blue-400/20 to-indigo-600/20 border-blue-300/60 shadow-lg shadow-blue-500/20';
                  containerBG = 'shadow-[0_0_30px_rgba(59,130,246,0.2)]';
                textSize = 'text-xl';
                nameColor = 'text-white/90';
                  scoreColor = 'text-blue-300';
                scoreSize = 'text-3xl';
              } else if (isThird) {
                  badgeBG = 'bg-gradient-to-r from-red-400/20 to-rose-600/20 border-red-300/60 shadow-lg shadow-red-500/20';
                  containerBG = 'shadow-[0_0_30px_rgba(239,68,68,0.18)]';
                textSize = 'text-lg';
                nameColor = 'text-white/80';
                  scoreColor = 'text-red-300';
                scoreSize = 'text-2xl';
              }
              
              return (
              <motion.div
                key={team.team_name}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30, delay: index * 0.04 }}
                className={`leaderboard-rank-card ${rankClass} flex items-center gap-4 p-5 md:p-6 rounded-2xl transition-all border ${
                  (isFirst || isSecond || isThird) ? badgeBG : 'bg-white/[0.02] border-white/5'
                } ${containerBG}`}
              >
                {/* Crown Badge */}
                {(isFirst || isSecond || isThird) ? (
                  <div className={`relative shrink-0`}>
                    <div className={`leaderboard-rank-badge ${rankClass} w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center font-black text-xl md:text-2xl ${
                        isFirst ? 'bg-gradient-to-b from-green-400 to-emerald-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.55)]' :
                        isSecond ? 'bg-gradient-to-b from-blue-400 to-indigo-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]' :
                        'bg-gradient-to-b from-red-400 to-rose-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                    } border-2 border-white/30`}>
                      <Crown className="w-7 h-7 md:w-8 md:h-8" />
                    </div>
                      <div className={`leaderboard-rank-dot ${rankClass} absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                        isFirst ? 'bg-green-500 text-white' :
                        isSecond ? 'bg-blue-500 text-white' :
                        'bg-red-500 text-white'
                    } border-2 border-white/40 shadow-lg`}>
                      {index + 1}
                    </div>
                  </div>
                ) : (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg text-white/30 bg-white/[0.05] border border-white/10`}>
                    #{team.rank}
                  </div>
                )}

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <h2 className={`font-bold tracking-tight truncate ${textSize} ${nameColor}`}>
                    {team.team_name}
                  </h2>
                </div>

                {/* Score */}
                <motion.div
                  key={team.total_score}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-right shrink-0"
                >
                  <span className={`leaderboard-rank-score ${rankClass} font-black font-mono ${scoreSize} ${scoreColor}`}>
                    {team.total_score}
                  </span>
                  <span className="text-[10px] text-white/20 ml-1.5 uppercase tracking-wider font-medium block">pts</span>
                </motion.div>
              </motion.div>
              );
            })}
          </AnimatePresence>

          {board.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white/20 text-sm font-light">No results yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
