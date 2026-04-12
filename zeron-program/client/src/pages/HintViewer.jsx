import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Image as ImageIcon, Send, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import BackButton from '../components/BackButton';

export default function HintViewer() {
  const { id } = useParams();
  const { team } = useAuth();
  const navigate = useNavigate();
  const [hint, setHint] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchHint = async () => {
      try {
        const res = await api.get(`/questions/${id}/hint`);
        setHint(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load hint');
      } finally {
        setLoading(false);
      }
    };
    fetchHint();
  }, [id]);

  // Auto-redirect to dashboard after correct answer
  useEffect(() => {
    if (result?.correct) {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [result, navigate]);

  const submitAnswer = async (e) => {
    e.preventDefault();
    if (!answer.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/questions/${id}/answer`, { submitted_answer: answer });
      setResult({ correct: res.data.is_correct, points: res.data.points_awarded, msg: res.data.is_correct ? 'Correct Answer!' : 'Incorrect Answer!' });
    } catch (err) {
      setResult({ correct: false, msg: err.response?.data?.error || 'Failed to submit' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
        <div className="animate-pulse flex flex-col items-center">
          <Compass className="w-12 h-12 text-primary mb-4 animate-spin drop-shadow-[0_0_15px_var(--primary)]" />
          <h2 className="text-xl font-black text-foreground uppercase tracking-widest">Decrypting Hint...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl shadow-red-500/5">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-red-400 mb-8">{error}</p>
          <Link to="/" className="inline-block bg-slate-800 hover:bg-slate-700 font-bold px-6 py-3 rounded-xl transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 py-12 bg-background">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card max-w-2xl w-full p-8 md:p-12 overflow-hidden relative shadow-[0_0_50px_rgba(var(--secondary),0.15)] border-2 border-secondary/20"
      >
        <BackButton fallback="/dashboard" label="Back" />
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-secondary via-primary to-secondary"></div>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-secondary/20 p-3 rounded-2xl border border-secondary/30 shadow-[0_0_15px_rgba(var(--secondary),0.3)]">
            <Compass className="w-8 h-8 text-secondary" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Treasure Hint</h1>
            <p className="text-secondary/80 font-bold tracking-widest text-sm uppercase">Secret Unlocked</p>
          </div>
        </div>

        {hint.question_image_url && (
          <div className="mb-8 rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg relative group bg-black/40">
            <img 
              src={hint.question_image_url} 
              alt="Hint Clue" 
              className="w-full h-auto object-contain max-h-[50vh]"
            />
          </div>
        )}

        <div className="bg-black/20 border-2 border-primary/20 p-6 md:p-8 rounded-3xl backdrop-blur-sm mb-8 shadow-inner">
          {(!hint.question_image_url) && (
            <div className="flex items-center gap-2 text-foreground/50 mb-4 pb-4 border-b border-primary/10">
              <ImageIcon className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-widest">Text Clue</span>
            </div>
          )}
          <h2 className="text-2xl md:text-3xl font-bold leading-tight text-foreground">
            {hint.question_text}
          </h2>
          
          <div className="mt-8 flex gap-4 text-sm font-mono font-black">
            <div className="bg-secondary/10 border-2 border-secondary/20 text-secondary px-4 py-2 rounded-xl shadow-[0_0_10px_rgba(var(--secondary),0.2)]">
              PTS: +{hint.points}
            </div>
            {hint.time_limit_seconds > 0 && (
              <div className="bg-primary/10 border-2 border-primary/20 text-primary px-4 py-2 rounded-xl shadow-[0_0_10px_rgba(var(--primary),0.2)]">
                TIME: {hint.time_limit_seconds}s
              </div>
            )}
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {team ? (
                <form onSubmit={submitAnswer} className="flex gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Enter your exact answer..."
                    className="flex-1 bg-background border-2 border-primary/30 text-foreground p-4 rounded-xl focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/20 transition-all font-bold placeholder:text-foreground/30"
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-primary hover:bg-secondary px-6 py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(var(--primary),0.3)] disabled:opacity-50 transition-all text-primary-foreground"
                  >
                    <Send className="w-5 h-5 text-primary-foreground" /> {submitting ? 'Sending...' : 'Submit'}
                  </button>
                </form>
              ) : (
                <div className="text-center bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
                  <p className="text-slate-300 font-semibold mb-4">You must be logged in as a team to submit an answer.</p>
                  <Link to="/login" className="inline-block bg-blue-600 hover:bg-blue-500 font-bold px-8 py-3 rounded-xl transition-colors">
                    Log in
                  </Link>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="result" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl text-center border-2 ${result.correct ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-red-500/10 border-red-500 text-red-400'}`}
            >
              {result.correct ? <CheckCircle className="w-12 h-12 mx-auto mb-3" /> : <XCircle className="w-12 h-12 mx-auto mb-3" />}
              <h3 className="text-2xl font-bold mb-2">{result.msg}</h3>
              {result.correct ? (
                <p className="font-mono text-sm tracking-widest mb-4">+ {result.points} POINTS AWARDED</p>
              ) : null}
              {result.correct && (
                <p className="text-sm text-green-400/70 animate-pulse">Redirecting to dashboard...</p>
              )}
              {!result.correct && (
                <button onClick={() => setResult(null)} className="mt-4 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-bold">
                  Try Again
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="mt-8 text-center pt-8 border-t border-white/5">
          {!result?.correct && (
            <Link to="/dashboard" className="text-slate-500 hover:text-slate-300 font-semibold transition-colors text-sm hover:underline">
              ← Return to Dashboard
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}
