import React, { useState, useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Clock, Send, ChevronRight } from 'lucide-react';

export default function QuizGame() {
  const { roundState, activeQuestion } = useGame();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!roundState.active || roundState.round_type !== 'quiz') navigate('/dashboard');
  }, [roundState, navigate]);

  useEffect(() => {
    if (activeQuestion) { setResult(null); setAnswer(''); setCountdown(3); }
  }, [activeQuestion]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    } else if (countdown === 0 && activeQuestion && !result) {
      setTimeLeft(activeQuestion.time_limit_seconds);
    }
  }, [countdown, activeQuestion, result]);

  useEffect(() => {
    if (activeQuestion?.time_limit_seconds > 0) {
      if (timeLeft > 0 && !result) {
        const t = setTimeout(() => setTimeLeft(l => l - 1), 1000);
        return () => clearTimeout(t);
      } else if (timeLeft === 0 && !result && countdown === 0) {
        handleTimeout();
      }
    }
  }, [timeLeft, result, activeQuestion, countdown]);

  const handleTimeout = async () => {
    if (submitting || result) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/questions/${activeQuestion.question_id}/answer`, { submitted_answer: '---TIMEOUT---' });
      setResult(res.data);
    } catch (err) {
      setResult(err.response?.status === 400
        ? { is_correct: false, points_awarded: 0, correct_answer: 'Already Answered' }
        : { is_correct: false, points_awarded: 0, correct_answer: 'Timeout' });
    } finally {
      setSubmitting(false);
    }
  };

  const submitAnswer = async (e) => {
    if (e) e.preventDefault();
    if (!answer.trim() || submitting || result) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/questions/${activeQuestion.question_id}/answer`, { submitted_answer: answer });
      setResult(res.data);
    } catch (err) {
      setResult(err.response?.status === 400
        ? { is_correct: false, points_awarded: 0, correct_answer: 'Already answered' }
        : { is_correct: false, points_awarded: 0, correct_answer: 'Error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Waiting for question
  if (!activeQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="fixed inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }}
          className="text-center relative z-10">
          <div className="text-[10px] tracking-[0.35em] text-white/25 uppercase font-medium mb-4">Round Active</div>
          <div className="glass-card px-12 py-8 shine">
            <div className="w-2 h-2 bg-white/40 rounded-full mx-auto mb-6 animate-pulse" />
            <p className="text-xl font-semibold text-white/60 font-light">Awaiting next question...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const hasTimer = activeQuestion.time_limit_seconds > 0;
  const progress = hasTimer ? (timeLeft / activeQuestion.time_limit_seconds) * 100 : 100;
  const isDanger = hasTimer && timeLeft <= 5;

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 max-w-3xl mx-auto justify-center relative">
      <div className="fixed inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {countdown > 0 ? (
          <motion.div key="countdown" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }} transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col items-center justify-center relative z-10">
            <div className="text-[11px] tracking-[0.4em] text-white/25 uppercase font-medium mb-6">Get Ready</div>
            <div className="text-[10rem] sm:text-[16rem] font-black leading-none text-white drop-shadow-[0_0_80px_rgba(255,255,255,0.15)]">
              {countdown}
            </div>
          </motion.div>
        ) : (
          <motion.div key="question" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="relative z-10 w-full">
            {/* Timer bar */}
            {hasTimer && (
              <div className="mb-6 h-[1px] bg-white/10 rounded-full overflow-hidden relative">
                <motion.div
                  className={`absolute inset-y-0 left-0 ${isDanger ? 'bg-white/60' : 'bg-white/30'}`}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'linear', duration: 1 }}
                />
              </div>
            )}

            {/* Meta row */}
            <div className="flex justify-between items-center mb-8">
              <span className="glass-card-sm px-3 py-1.5 text-[10px] tracking-[0.2em] text-white/30 uppercase font-medium">
                Q{activeQuestion.order_index}
              </span>
              <AnimatePresence>
                {hasTimer && (
                  <motion.span
                    key={timeLeft}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className={`flex items-center gap-1.5 text-sm font-mono font-bold ${isDanger ? 'text-white animate-pulse' : 'text-white/40'}`}
                  >
                    <Clock className="w-4 h-4" />
                    {`0:${timeLeft.toString().padStart(2, '0')}`}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Question text */}
            <div className="glass-card p-8 shine mb-6">
              <p className="text-2xl sm:text-3xl font-semibold text-white leading-snug mb-0"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {activeQuestion.question_text}
              </p>

              {activeQuestion.question_image_url && (
                <div className="mt-6 rounded-xl overflow-hidden glass-card-sm">
                  <img
                    src={activeQuestion.question_image_url.startsWith('http') 
                      ? activeQuestion.question_image_url.replace('http://', 'https://') 
                      : `${api.defaults.baseURL.replace('/api', '')}${activeQuestion.question_image_url}`}
                    alt="Question"
                    className="w-full max-h-72 object-contain"
                  />
                </div>
              )}
            </div>

            {/* Answer / Result */}
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }} onSubmit={submitAnswer}
                  className="flex gap-3">
                  <input
                    type="text" autoFocus required
                    placeholder="Type your answer…"
                    className="flex-1 glass-card-sm px-5 py-4 text-base text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-medium"
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                  />
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    disabled={submitting}
                    type="submit"
                    className="glass-card-sm px-6 py-4 text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-40 flex items-center gap-2 font-semibold text-sm"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
                    ) : (
                      <><Send className="w-4 h-4" /> <span className="hidden sm:inline">Submit</span></>
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`glass-card p-6 text-center border ${result.is_correct
                    ? 'border-white/30 bg-white/[0.06] shadow-[0_0_40px_rgba(255,255,255,0.08)]'
                    : 'border-white/10 bg-white/[0.02]'
                  }`}
                >
                  {result.is_correct ? (
                    <>
                      <div className="text-3xl font-black text-white mb-1">+{result.points_awarded}</div>
                      <p className="text-white/50 text-sm font-light">Points awarded — well done</p>
                    </>
                  ) : (
                    <>
                      <div className="text-lg font-bold text-white/60 mb-1">Incorrect</div>
                      <p className="text-white/30 text-sm font-light">Answer: <span className="text-white/60 font-medium">{result.correct_answer}</span></p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
