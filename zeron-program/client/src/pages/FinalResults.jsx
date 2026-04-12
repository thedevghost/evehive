import React, { useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Medal, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';

export default function FinalResults() {
  const { finalLeaderboard, gameOver } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    if (!gameOver) {
      navigate('/dashboard');
      return;
    }

    const duration = 15 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [gameOver, navigate]);

  if (!finalLeaderboard || finalLeaderboard.length === 0) return null;

  const top3 = finalLeaderboard.slice(0, 3);
  const others = finalLeaderboard.slice(3);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start p-8 pt-20">
      <BackButton fallback="/dashboard" label="Back" />
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4 drop-shadow-md">
          PROGRAM CONCLUDED
        </h1>
        <p className="text-xl font-bold text-foreground/60 uppercase tracking-widest">Final Standings</p>
      </motion.div>

      <div className="flex items-end justify-center gap-2 sm:gap-4 md:gap-8 mb-12 sm:mb-24 h-44 sm:h-64 w-full px-2">
        {/* 2nd Place */}
        {top3.length > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="flex flex-col items-center w-20 sm:w-32 md:w-48 z-10 relative group">
            <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="text-sm sm:text-xl font-black text-accent mb-1 sm:mb-2 truncate max-w-full relative">{top3[1].team_name}</div>
            <div className="text-base sm:text-2xl font-mono font-black text-accent mb-2 sm:mb-4 relative">{top3[1].total_score}</div>
            <div className="w-full h-28 sm:h-40 bg-gradient-to-t from-accent/20 to-accent/40 border-t-[3px] border-accent rounded-t-2xl flex justify-center pt-3 sm:pt-4 shadow-[0_0_40px_rgba(var(--accent),0.3)] relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 w-full h-full bg-[linear-gradient(180deg,rgba(255,255,255,0.2)_0%,transparent_100%)]" />
              <Medal className="w-8 h-8 sm:w-12 sm:h-12 text-accent drop-shadow-[0_0_10px_var(--accent)] relative z-10" />
            </div>
          </motion.div>
        )}

        {/* 1st Place */}
        {top3.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, type: 'spring', bounce: 0.6 }}
            className="flex flex-col items-center w-24 sm:w-32 md:w-56 z-20 relative group">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="text-base sm:text-2xl font-black text-primary mb-1 sm:mb-2 truncate max-w-full relative">{top3[0].team_name}</div>
            <div className="text-2xl sm:text-4xl font-mono font-black text-primary mb-2 sm:mb-4 relative drop-shadow-[0_0_10px_var(--primary)]">{top3[0].total_score}</div>
            <div className="w-full h-36 sm:h-56 bg-gradient-to-t from-primary/30 to-primary/50 border-t-[4px] border-primary rounded-t-2xl flex justify-center pt-3 sm:pt-4 shadow-[0_0_60px_rgba(var(--primary),0.5)] relative overflow-hidden backdrop-blur-lg">
              <div className="absolute top-0 w-full h-full bg-[linear-gradient(180deg,rgba(255,255,255,0.3)_0%,transparent_100%)]" />
              <Trophy className="w-10 h-10 sm:w-16 sm:h-16 text-primary drop-shadow-[0_0_15px_var(--primary)] relative z-10" />
            </div>
          </motion.div>
        )}

        {/* 3rd Place */}
        {top3.length > 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="flex flex-col items-center w-20 sm:w-32 md:w-48 z-10 relative group">
            <div className="absolute inset-0 bg-secondary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="text-sm sm:text-xl font-black text-secondary mb-1 sm:mb-2 truncate max-w-full relative">{top3[2].team_name}</div>
            <div className="text-base sm:text-2xl font-mono font-black text-secondary mb-2 sm:mb-4 relative">{top3[2].total_score}</div>
            <div className="w-full h-20 sm:h-32 bg-gradient-to-t from-secondary/20 to-secondary/40 border-t-[3px] border-secondary rounded-t-2xl flex justify-center pt-2 sm:pt-4 shadow-[0_0_40px_rgba(var(--secondary),0.3)] relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 w-full h-full bg-[linear-gradient(180deg,rgba(255,255,255,0.2)_0%,transparent_100%)]" />
              <Award className="w-7 h-7 sm:w-10 sm:h-10 text-secondary drop-shadow-[0_0_10px_var(--secondary)] relative z-10" />
            </div>
          </motion.div>
        )}
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {others.map(team => (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={team.team_name}
            className="flex justify-between items-center glass p-4 rounded-xl border-l-4 border-l-primary/50 hover:bg-primary/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="text-lg font-black text-primary/60 w-6">{team.rank}</span>
              <span className="font-bold text-lg text-foreground">{team.team_name}</span>
            </div>
            <span className="font-mono font-black text-secondary">{team.total_score} <span className="text-xs">PTS</span></span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
