import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import QuizGame from './pages/QuizGame';
import TreasureHunt from './pages/TreasureHunt';
import Leaderboard from './pages/Leaderboard';
import FinalResults from './pages/FinalResults';
import AdminDashboard from './pages/AdminDashboard';
import HintViewer from './pages/HintViewer';
import ThemeToggle from './components/ThemeToggle';
import CursorBubble from './components/CursorBubble';

const ProtectedRoute = ({ children }) => {
  const { team, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return team ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return isAdmin ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background w-full text-foreground relative cursor-none">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/game/quiz" element={<ProtectedRoute><QuizGame /></ProtectedRoute>} />
          <Route path="/game/treasure" element={<ProtectedRoute><TreasureHunt /></ProtectedRoute>} />
          <Route path="/hint/:id" element={<HintViewer />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/results" element={<FinalResults />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Routes>
        <ThemeToggle />
        <CursorBubble />
      </div>
    </Router>
  );
}

export default App;
