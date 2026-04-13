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
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');

  useEffect(() => {
    if (!roundState.active || roundState.round_type !== 'treasure_hunt') {
      navigate('/dashboard');
    } else {
      fetchTasks();
      fetchMembers();
    }
  }, [roundState, navigate]);

  const fetchMembers = async () => {
    try {
      const res = await api.get('/teams/me');
      setMembers(res.data.members || []);
      if (res.data.members?.length > 0) {
        setSelectedMember(res.data.members[0].name);
      }
    } catch (err) { console.error(err); }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/treasure/tasks/${roundState.round_id}`);
      setTasks(res.data);
    } catch(err) {
      console.error(err);
    }
  };

  const submitProof = async (e) => {
    e.preventDefault();
    if (!submissionValue.trim() || !selectedMember || submitting) return;
    setSubmitting(true);
    const task = tasks[currentIndex];
    
    try {
      await api.post('/treasure/submit', { 
        task_id: task.id, 
        submission_proof: submissionValue,
        submitted_by: selectedMember
      });
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
        <h2 className="text-xl sm:text-3xl font-black flex items-center gap-2 sm:gap-3 text-white">
          <Compass className="w-6 h-6 sm:w-8 sm:h-8 text-primary shadow-lg" />
          {roundState.round_name}
        </h2>
        <div className="text-white/40 font-bold tracking-widest uppercase text-xs sm:text-sm">
          Task {currentIndex + 1} of {tasks.length}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={task.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="glass-card p-8 flex-1 shine"
        >
          <div className="mb-8">
            <h3 className="text-2xl font-black mb-4 leading-tight text-white">{task.task_description}</h3>
            {task.clue_text && (
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-white/60 font-mono text-sm leading-relaxed">
                <strong className="text-white block mb-1 font-black uppercase text-[10px] tracking-widest">Digital Clue:</strong>
                {task.clue_text}
              </div>
            )}
            <div className="mt-4 inline-block bg-primary/20 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/30">
              Reward: {task.points} PTS
            </div>
          </div>

          {!status ? (
            <form onSubmit={submitProof} className="space-y-6">
              <div>
                <label className="block text-[10px] tracking-widest text-white/30 uppercase font-bold mb-3">Who is submitting?</label>
                <select 
                  required
                  value={selectedMember}
                  onChange={e => setSelectedMember(e.target.value)}
                  className="w-full glass-card-sm px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all font-medium appearance-none"
                >
                  {members.map((m, i) => (
                    <option key={i} value={m.name} className="bg-slate-900">{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] tracking-widest text-white/30 uppercase font-bold mb-3">Submission Proof</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Enter proof text or a link to an image/video..."
                  className="w-full glass-card-sm px-4 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all resize-none font-medium"
                  value={submissionValue}
                  onChange={e => setSubmissionValue(e.target.value)}
                />
              </div>

              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={submitting}
                className="w-full py-4 bg-primary hover:bg-secondary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(var(--primary),0.25)] disabled:opacity-50"
                type="submit"
              >
                <UploadCloud className="w-5 h-5" /> {submitting ? 'Transmitting...' : 'Send Proof'}
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
