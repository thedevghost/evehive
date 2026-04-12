import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { useGame } from '../hooks/useGame';
import { Check, X, Play, Square, Plus, Upload, QrCode, Trash2 } from 'lucide-react';
import LeaderboardPanel from '../components/LeaderboardPanel';
import BackButton from '../components/BackButton';

export default function AdminDashboard() {
  const { leaderboard } = useGame();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('rounds');
  const [rounds, setRounds] = useState([]);
  const [teams, setTeams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [accessCodes, setAccessCodes] = useState([]);
  const [generateCount, setGenerateCount] = useState(5);
  const [lastGeneratedCount, setLastGeneratedCount] = useState(0);
  const [selectedRound, setSelectedRound] = useState('');
  
  const [newRound, setNewRound] = useState({ round_name: '', round_type: 'quiz', order_index: '' });
  const [newQuestion, setNewQuestion] = useState({ 
    round_id: '', question_text: '', correct_answer: '', points: 10, time_limit_seconds: 30, order_index: '' 
  });
  const [qImage, setQImage] = useState(null);

  useEffect(() => {
    fetchRounds();
    fetchTeams();
    fetchSubmissions();
    fetchAccessCodes();
  }, []);

  const fetchRounds = () =>
    api.get('/rounds').then(res => {
      const roundsData = res.data;
      setRounds(roundsData);

      // Keep selected round stable so question list remains visible.
      if (roundsData.length === 0) {
        setSelectedRound('');
        setQuestions([]);
        return;
      }

      const stillExists = roundsData.some(r => String(r.id) === String(selectedRound));
      if (!selectedRound || !stillExists) {
        setSelectedRound(String(roundsData[0].id));
      }
    });
  const fetchTeams = () => api.get('/admin/teams').then(res => setTeams(res.data));
  const fetchSubmissions = () => api.get('/admin/submissions').then(res => setSubmissions(res.data));
  const fetchQuestions = (rid) => {
    if (!rid) {
      setQuestions([]);
      return Promise.resolve();
    }
    return api.get(`/questions/round/${rid}`).then(res => setQuestions(res.data));
  };
  const fetchAccessCodes = () => api.get('/admin/access-codes').then(res => setAccessCodes(res.data));

  useEffect(() => {
    fetchQuestions(selectedRound);
  }, [selectedRound]);

  const createRound = async (e) => {
    e.preventDefault();
    try {
      await api.post('/rounds', newRound);
      fetchRounds();
      setNewRound({ round_name: '', round_type: 'quiz', order_index: '' });
    } catch (error) {
      alert("Failed to create round: " + (error.response?.data?.error || error.message));
    }
  };

  const startRound = async (id) => {
    await api.patch(`/rounds/${id}/start`);
    fetchRounds();
  };

  const stopRound = async (id) => {
    await api.patch(`/rounds/${id}/stop`);
    fetchRounds();
  };

  const createQuestion = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.keys(newQuestion).forEach(key => fd.append(key, newQuestion[key]));
    if (qImage) fd.append('image', qImage);
    
    try {
      await api.post('/questions', fd);
      if (newQuestion.round_id) fetchQuestions(newQuestion.round_id);
      setNewQuestion(prev => ({ ...prev, question_text: '', correct_answer: '', points: 10, time_limit_seconds: 30, order_index: '' }));
      setQImage(null);
    } catch (error) {
      alert("Failed to create question: " + (error.response?.data?.error || error.message));
    }
  };

  const pushQuestion = async (qId) => {
    await api.post('/admin/push-question', { question_id: qId });
    fetchQuestions(selectedRound);
  };

  const deleteRound = async (id) => {
    if (window.confirm("Delete this round and all its questions?")) {
      try {
        await api.delete(`/rounds/${id}`);
        fetchRounds();
      } catch (err) { alert("Failed: " + err.message); }
    }
  };

  const deleteQuestion = async (id, round_id) => {
    if (window.confirm("Delete this question?")) {
      try {
        await api.delete(`/questions/${id}`);
        fetchQuestions(round_id);
      } catch (err) { alert("Failed: " + err.message); }
    }
  };

  const approveSubmission = async (id) => {
    await api.patch(`/treasure/submission/${id}/approve`);
    fetchSubmissions();
  };

  const rejectSubmission = async (id) => {
    await api.patch(`/treasure/submission/${id}/reject`);
    fetchSubmissions();
  };



  const generateAccessCodes = async (e) => {
    e.preventDefault();
    const safeCount = Math.max(1, Math.min(100, Number(generateCount) || 1));
    const res = await api.post('/admin/access-codes/generate', { count: safeCount });
    setLastGeneratedCount(res.data?.codes?.length || safeCount);
    fetchAccessCodes();
  };

  const deleteAccessCode = async (id, isUsed) => {
    if (isUsed) {
      alert('Used access codes cannot be deleted.');
      return;
    }
    if (!window.confirm('Delete this access code?')) return;

    try {
      await api.delete(`/admin/access-codes/${id}`);
      fetchAccessCodes();
    } catch (error) {
      alert("Failed to delete access code: " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="admin-console min-h-screen p-6 max-w-7xl mx-auto text-foreground">
      <BackButton fallback="/login?type=admin" label="Back" />
      <header className="flex justify-between items-center mb-8 border-b-2 border-primary/20 pb-6">
        <h1 className="text-3xl font-black text-primary drop-shadow-[0_0_10px_var(--primary)] uppercase tracking-widest">Admin Console</h1>
        <div className="flex gap-4">
          <a href={`${api.defaults.baseURL}/qr`} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm" title="Invite teams using QR">
            <QrCode className="w-4 h-4" /> Invite Teams (QR)
          </a>
          <button onClick={logout} className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg font-bold text-sm">
            Logout
          </button>
        </div>
      </header>

      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {[
          { id: 'rounds',       label: 'Rounds' },
          { id: 'questions',    label: 'Questions' },
          { id: 'teams',        label: 'Teams' },
          { id: 'treasure',     label: 'Treasure' },
          { id: 'access_codes', label: 'Access Codes' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all border-2 ${
              activeTab === tab.id
                ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/25'
                : 'bg-transparent border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'rounds' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass p-6 rounded-2xl border-2 border-primary/20 shadow-[0_0_30px_rgba(0,0,0,0.1)]">
            <h3 className="text-xl font-black mb-4 text-foreground">Create Round</h3>
            <form onSubmit={createRound} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Round Name</label>
                <input required type="text" placeholder="Round Name" className="w-full bg-slate-800 p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" value={newRound.round_name} onChange={e => setNewRound({...newRound, round_name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Round Type</label>
                <select required className="w-full bg-slate-800 p-3 rounded-lg focus:outline-none" value={newRound.round_type} onChange={e => setNewRound({...newRound, round_type: e.target.value})}>
                  <option value="quiz">Quiz</option>
                  <option value="treasure_hunt">Treasure Hunt</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-foreground/50 font-black uppercase block mb-1">Order Index</label>
                <input required type="number" placeholder="Order Index" className="w-full bg-background border-2 border-primary/20 p-3 rounded-lg focus:outline-none focus:border-primary text-foreground" value={newRound.order_index} onChange={e => setNewRound({...newRound, order_index: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-lg font-black mt-2 shadow-[0_0_15px_rgba(234,88,12,0.4)] transition-all">Add Round</button>
            </form>
          </div>
          
          <div className="space-y-4 glass p-6 rounded-2xl border-2 border-primary/20 shadow-[0_0_30px_rgba(0,0,0,0.1)]">
            <h3 className="text-xl font-black mb-4 text-foreground">All Rounds</h3>
            {rounds.map(r => (
              <div key={r.id} className={`p-4 rounded-xl flex items-center justify-between border-2 transition-all ${r.status === 'active' ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]' : 'bg-background border-white/5 opacity-80'}`}>
                <div>
                  <div className="font-bold text-foreground">{r.order_index}. {r.round_name}</div>
                  <div className="text-xs text-foreground/50 font-bold uppercase tracking-widest">{r.round_type} • <span className={r.status === 'active' ? 'text-primary' : ''}>{r.status}</span></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startRound(r.id)} className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-colors" title="Start"><Play className="w-5 h-5"/></button>
                  <button onClick={() => stopRound(r.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors" title="Stop"><Square className="w-5 h-5"/></button>
                  <button onClick={() => deleteRound(r.id)} className="p-2 bg-slate-500/20 text-slate-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors" title="Delete Round"><Trash2 className="w-5 h-5"/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="grid md:grid-cols-[1fr_2fr] gap-8">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-xl font-bold mb-2">Create Question</h3>
            <form onSubmit={createQuestion} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Select Round</label>
                <select className="w-full bg-slate-800 p-3 rounded-lg focus:outline-none" value={newQuestion.round_id} onChange={e => { setNewQuestion({...newQuestion, round_id: e.target.value}); setSelectedRound(e.target.value); }}>
                  <option value="">Select Round</option>
                  {rounds.map(r => <option key={r.id} value={r.id}>{r.round_name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Question Text</label>
                <textarea placeholder="Question Text" required className="w-full bg-slate-800 p-3 rounded-lg max-h-32 focus:outline-none" value={newQuestion.question_text} onChange={e => setNewQuestion({...newQuestion, question_text: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Question Image (Optional)</label>
                <input type="file" className="w-full text-sm text-slate-400" onChange={e => setQImage(e.target.files[0])} />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Correct Answer</label>
                <input type="text" placeholder="Correct Answer" required className="w-full bg-slate-800 p-3 rounded-lg focus:outline-none" value={newQuestion.correct_answer} onChange={e => setNewQuestion({...newQuestion, correct_answer: e.target.value})} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Points</label>
                  <input type="number" placeholder="Points" required className="w-full bg-slate-800 p-3 rounded-lg focus:outline-none" value={newQuestion.points} onChange={e => setNewQuestion({...newQuestion, points: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Time (s, 0 for ∞)</label>
                  <input type="number" placeholder="Time (s)" required className="w-full bg-slate-800 p-3 rounded-lg focus:outline-none" value={newQuestion.time_limit_seconds} onChange={e => setNewQuestion({...newQuestion, time_limit_seconds: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Order</label>
                  <input type="number" placeholder="Order" required className="w-full bg-slate-800 p-3 rounded-lg focus:outline-none" value={newQuestion.order_index} onChange={e => setNewQuestion({...newQuestion, order_index: e.target.value})} />
                </div>
              </div>
              <button disabled={!newQuestion.round_id} type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-lg font-black mt-2 shadow-[0_0_15px_rgba(234,88,12,0.4)] disabled:bg-orange-600 disabled:text-white disabled:opacity-100 disabled:cursor-not-allowed transition-all">Save Question</button>
            </form>
          </div>

          <div className="space-y-4 glass p-6 rounded-2xl border-2 border-primary/20 shadow-[0_0_30px_rgba(0,0,0,0.1)]">
            <h3 className="text-xl font-black mb-4 text-foreground">Questions in Round</h3>
            {questions.length === 0 ? <p className="text-foreground/50 font-medium">Select a round or no questions found.</p> : questions.map(q => (
              <div key={q.id} className="bg-background border-2 border-white/10 p-4 rounded-xl flex justify-between items-center transition-all hover:border-primary/50">
                <div className="max-w-md">
                  <div className="font-semibold truncate">{q.order_index}. {q.question_text}</div>
                  <div className="text-sm text-green-400 font-mono mt-1">Ans: {q.correct_answer} ({q.points} pts, {q.time_limit_seconds}s)</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => deleteQuestion(q.id, q.round_id)} className="bg-slate-700 hover:bg-red-600 px-3 py-2 rounded-lg text-slate-300 hover:text-white transition-colors"><Trash2 className="w-4 h-4"/></button>
                  <a href={`${api.defaults.baseURL}/qr/question/${q.id}`} target="_blank" rel="noreferrer" className="bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center justify-center" title="QR Code"><QrCode className="w-4 h-4"/></a>
                  <button onClick={() => pushQuestion(q.id)} className="bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg font-bold text-sm tracking-widest uppercase shadow-lg shadow-violet-500/20">Push</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'teams' && (
        <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 overflow-x-auto">
            <h3 className="text-xl font-bold mb-4">Registered Teams</h3>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800 text-slate-400">
                <tr>
                  <th className="p-4 rounded-tl-lg">Rank</th>
                  <th className="p-4">Team Name</th>
                  <th className="p-4">Members</th>
                  <th className="p-4">Volunteer</th>
                  <th className="p-4 rounded-tr-lg text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {teams.map(t => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold">{t.rank}</td>
                    <td className="p-4 font-semibold">{t.team_name} <br/><span className="text-xs text-slate-400">@{t.username}</span></td>
                    <td className="p-4">{t.memory_count}</td>
                    <td className="p-4">{t.volunteer_name}</td>
                    <td className="p-4 text-right font-mono text-blue-400 font-bold">{t.total_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-4">
            <LeaderboardPanel leaderboard={leaderboard && leaderboard.length > 0 ? leaderboard : teams} />
          </div>
        </div>
      )}

      {activeTab === 'treasure' && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold mb-4">Treasure Submissions</h3>
          {submissions.length === 0 ? <p className="text-slate-500">No submissions yet.</p> : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {submissions.map(sub => (
                <div key={sub.id} className="bg-slate-900 border border-white/10 rounded-2xl p-6 relative">
                  <div className="text-xs text-slate-500 absolute top-4 right-4">{new Date(sub.submitted_at).toLocaleTimeString()}</div>
                  <h4 className="font-bold text-lg mb-1">{sub.team_name}</h4>
                  <p className="text-sm text-amber-400 mb-4">{sub.task_description}</p>
                  <div className="mb-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      sub.status === 'approved'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                        : sub.status === 'rejected'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                  
                  <div className="bg-slate-800 p-3 rounded-lg mb-6 max-h-32 overflow-y-auto">
                    <p className="font-mono text-xs break-all">{sub.submission_proof}</p>
                    {sub.submission_proof?.startsWith('http') && (
                      <a href={sub.submission_proof} target="_blank" className="text-blue-400 text-xs mt-2 inline-block hover:underline">Open Link</a>
                    )}
                  </div>

                  {sub.status === 'pending' ? (
                    <div className="flex gap-3">
                      <button onClick={() => approveSubmission(sub.id)} className="flex-1 py-2 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white rounded-lg flex items-center justify-center gap-2 transition-colors font-semibold">
                        <Check className="w-4 h-4" /> Approve
                      </button>
                      <button onClick={() => rejectSubmission(sub.id)} className="flex-1 py-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg flex items-center justify-center gap-2 transition-colors font-semibold">
                        <X className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 font-medium">This submission has been reviewed.</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'access_codes' && (
        <div className="grid md:grid-cols-[1fr_2fr] gap-8">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-xl font-bold mb-2">Generate Codes</h3>
            <div className="text-xs font-semibold tracking-wide text-slate-400">
              Last generated: <span className="text-foreground font-bold">{lastGeneratedCount}</span>
            </div>
            <form onSubmit={generateAccessCodes} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Number of Codes</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Number of codes"
                  required
                  className="w-full bg-slate-800 border border-white/15 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={generateCount}
                  onChange={e => setGenerateCount(e.target.value)}
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 py-3 rounded-lg font-bold hover:bg-blue-500 mt-2">Generate</button>
            </form>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">All Access Codes</h3>
            <div className="text-sm text-slate-400 font-semibold">
              Total: <span className="text-foreground font-bold">{accessCodes.length}</span>
              {'  '}|{'  '}
              Unused: <span className="text-green-400 font-bold">{accessCodes.filter(ac => !ac.is_used).length}</span>
              {'  '}|{'  '}
              Used: <span className="text-amber-400 font-bold">{accessCodes.filter(ac => ac.is_used).length}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {accessCodes.map(ac => (
                <div key={ac.id} className={`p-4 rounded-xl border ${ac.is_used ? 'bg-slate-800/50 border-slate-700' : 'bg-green-900/20 border-green-500/30'} flex flex-col gap-2`}>
                  <div className="font-mono text-xl text-center font-bold tracking-widest">{ac.code}</div>
                  {ac.is_used ? (
                    <div className="text-xs text-center text-slate-400">Used by: {ac.used_by}</div>
                  ) : (
                    <div className="text-xs text-center text-green-400 font-bold uppercase tracking-wider">Unused</div>
                  )}
                  <button
                    onClick={() => deleteAccessCode(ac.id, ac.is_used)}
                    disabled={ac.is_used}
                    className={`mt-2 px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      ac.is_used
                        ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                        : 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
