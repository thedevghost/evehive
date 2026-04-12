import React, { useEffect, useState } from 'react';
import { useGame } from '../hooks/useGame';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, UploadCloud, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function TreasureHunt() {
  const { roundState } = useGame();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submissionValue, setSubmissionValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [taskStatus, setTaskStatus] = useState({}); // { task_id: 'pending'/'approved'/'rejected' }

  useEffect(() => {
    if (!roundState.active || roundState.round_type !== 'treasure_hunt') {
      navigate('/dashboard');
    } else {
      fetchTasks();
    }
  }, [roundState, navigate]);

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/treasure/tasks/${roundState.round_id}`);
      setTasks(res.data);
      // We'd ideally track already submitted tasks. In a real app we'd fetch submission history for the team.
      // For now, we assume simple client-side tracking state if refreshed.
    } catch(err) {
      console.error(err);
    }
  };

  const submitProof = async (e) => {
    e.preventDefault();
    if (!submissionValue.trim() || submitting) return;
    setSubmitting(true);
    const task = tasks[currentIndex];
    
    try {
      await api.post('/treasure/submit', { task_id: task.id, submission_proof: submissionValue });
      setTaskStatus(prev => ({ ...prev, [task.id]: 'pending' }));
      setSubmissionValue('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (tasks.length === 0) return <div className="min-h-screen flex items-center justify-center">Loading tasks...</div>;

  const task = tasks[currentIndex];
  const status = taskStatus[task.id];

  return (
    <div className="min-h-screen p-4 py-8 sm:p-6 sm:py-12 max-w-3xl mx-auto flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-3xl font-black flex items-center gap-2 sm:gap-3 text-foreground">
          <Compass className="w-6 h-6 sm:w-8 sm:h-8 text-secondary drop-shadow-[0_0_10px_var(--secondary)]" />
          {roundState.round_name}
        </h2>
        <div className="text-secondary/80 font-bold tracking-widest uppercase text-xs sm:text-sm">
          Task {currentIndex + 1} of {tasks.length}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={task.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="glass-card p-8 flex-1"
        >
          <div className="mb-8">
            <h3 className="text-2xl font-black mb-4 leading-tight text-foreground">{task.task_description}</h3>
            {task.clue_text && (
              <div className="bg-primary/10 border-2 border-primary/20 p-4 rounded-xl text-primary/80 font-mono text-sm leading-relaxed shadow-inner">
                <strong className="text-primary block mb-1 font-black">CLUE:</strong>
                {task.clue_text}
              </div>
            )}
            <div className="mt-4 inline-block bg-secondary/20 text-secondary px-4 py-1.5 rounded-full text-sm font-black border-2 border-secondary/30 shadow-[0_0_20px_rgba(var(--secondary),0.2)]">
              Reward: {task.points} PTS
            </div>
          </div>

          {!status ? (
            <form onSubmit={submitProof} className="space-y-4">
              <textarea 
                required
                rows={4}
                placeholder="Enter proof text or a link to an image/video..."
                className="w-full bg-background border-2 border-primary/20 rounded-2xl p-4 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all resize-none text-foreground font-medium placeholder:text-foreground/30"
                value={submissionValue}
                onChange={e => setSubmissionValue(e.target.value)}
              />
              <motion.button 
                whileHover={{ scale: 1.02, filter: "hue-rotate(15deg)" }}
                whileTap={{ scale: 0.98 }}
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-xl font-black flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(var(--primary),0.3)] disabled:opacity-50"
                type="submit"
              >
                <UploadCloud className="w-5 h-5" /> {submitting ? 'Submitting...' : 'Submit Proof'}
              </motion.button>
            </form>
          ) : (
            <div className={`p-6 rounded-2xl text-center border-2 ${status === 'approved' ? 'bg-green-500/10 border-green-500 text-green-400' : status === 'rejected' ? 'bg-red-500/10 border-red-500 text-red-400' : 'bg-blue-500/10 border-blue-500 text-blue-400'}`}>
              {status === 'pending' && <><Clock className="w-8 h-8 mx-auto mb-2 animate-pulse" /> Proof submitted. Awaiting Admin Approval...</>}
              {status === 'approved' && <><CheckCircle className="w-8 h-8 mx-auto mb-2" /> Task Approved! +{task.points} PTS</>}
              {status === 'rejected' && <><XCircle className="w-8 h-8 mx-auto mb-2" /> Submission Rejected. Try again?</>}
            </div>
          )}

          <div className="flex justify-between mt-8 sm:mt-12 gap-4">
            <button 
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(i => i - 1)}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold disabled:opacity-30 hover:bg-white/10 transition-colors"
            >
              ← Prev
            </button>
            <button 
              disabled={currentIndex === tasks.length - 1}
              onClick={() => setCurrentIndex(i => i + 1)}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold disabled:opacity-30 hover:bg-white/10 transition-colors"
            >
              Next →
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
