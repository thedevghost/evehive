import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Signal, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

const getMedalColor = (rank) => {
  if (rank === 1) return 'from-green-400 to-emerald-600';
  if (rank === 2) return 'from-blue-400 to-indigo-600';
  if (rank === 3) return 'from-orange-400 to-amber-600';
  return 'from-white/20 to-white/10';
};

const getMedalBgColor = (rank) => {
  if (rank === 1) return 'bg-green-500/20 border-green-300/60';
  if (rank === 2) return 'bg-blue-500/20 border-blue-300/60';
  if (rank === 3) return 'bg-orange-500/20 border-orange-300/60';
  return 'bg-white/[0.03] border-white/10';
};

export default function LeaderboardPanel({ leaderboard, teamId }) {
  const topTeams = leaderboard.slice(0, 10);

  return (
    <div className="glass-card p-6 shine h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-[0.25em] text-white/30 uppercase font-medium">Leaderboard</span>
        </div>
        <Link 
          to="/leaderboard" 
          className="text-[10px] px-3 py-1.5 glass-card-sm rounded-lg text-white/40 hover:text-white/80 transition-all font-bold uppercase tracking-widest hover:bg-white/[0.05]"
        >
          View Full
        </Link>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {topTeams.map((entry, idx) => {
            const isTopThree = idx < 3;
            const badgeColor = getMedalColor(entry.rank);
            const bgColor = getMedalBgColor(entry.rank);
            const rankClass = isTopThree ? `leaderboard-rank-${idx + 1}` : '';
            
            return (
            <motion.div
              key={entry.team_name}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, delay: idx * 0.03 }}
              className={`leaderboard-rank-card ${rankClass} flex items-center gap-3 p-3 rounded-xl transition-all border ${
                entry.team_id === teamId
                  ? 'ring-2 ring-white/40'
                  : ''
              } ${
                isTopThree
                  ? `${bgColor} bg-gradient-to-r ${badgeColor} shadow-lg`
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
              }`}
            >
              {/* Crown Badge */}
              {isTopThree ? (
                <div className={`leaderboard-rank-badge ${rankClass} w-10 h-10 rounded-full flex items-center justify-center text-lg font-black shrink-0 bg-gradient-to-b ${badgeColor} text-white shadow-lg border-2 border-white/20`}>
                  <Crown className="w-5 h-5" />
                </div>
              ) : (
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 text-white/40`}>
                  #{entry.rank}
                </div>
              )}

              {/* Name */}
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-semibold truncate block ${
                  entry.team_id === teamId ? 'text-white' : isTopThree ? 'text-white/95' : 'text-white/60'
                }`}>
                  {entry.team_name}
                </span>
                {entry.team_id === teamId && (
                  <span className="text-[9px] text-white/30 uppercase tracking-widest font-medium">You</span>
                )}
              </div>

              {/* Score */}
              <div className="text-right shrink-0">
                <span className={`leaderboard-rank-score ${rankClass} text-sm font-black font-mono ${
                  isTopThree ? 'text-white' : 'text-white/40'
                }`}>
                  {entry.total_score}
                </span>
              </div>
            </motion.div>
            );
          })}
        </AnimatePresence>

        {topTeams.length === 0 && (
          <p className="text-center text-white/20 text-xs py-8 font-light">No teams yet</p>
        )}
      </div>
    </div>
  );
}
