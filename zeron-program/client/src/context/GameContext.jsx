import React, { createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';

export const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
  const { team } = useAuth();
  const [socket, setSocket] = useState(null);
  const [roundState, setRoundState] = useState({ active: false, round_id: null, round_name: '', round_type: '' });
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [finalLeaderboard, setFinalLeaderboard] = useState([]);

  // Fetch initial leaderboard on mount
  useEffect(() => {
    api.get('/teams/leaderboard')
      .then(res => {
        setLeaderboard(res.data.leaderboard || []);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    setSocket(newSocket);

    if (team) {
      newSocket.emit('join_team', { team_id: team.team_id });
    }

    newSocket.on('round_started', (data) => {
      setRoundState({ active: true, ...data });
      setActiveQuestion(null);
    });

    newSocket.on('round_ended', (data) => {
      if (roundState.round_id === data.round_id || true) {
        setRoundState({ active: false, round_id: null, round_name: '', round_type: '' });
        setActiveQuestion(null);
      }
    });

    newSocket.on('question_revealed', (data) => {
      setActiveQuestion(data);
    });

    newSocket.on('leaderboard_update', (data) => {
      setLeaderboard(data.leaderboard);
    });

    newSocket.on('game_over', (data) => {
      setGameOver(true);
      setFinalLeaderboard(data.final_leaderboard);
    });

    return () => newSocket.close();
  }, [team]);

  return (
    <GameContext.Provider value={{ socket, roundState, activeQuestion, setActiveQuestion, leaderboard, gameOver, finalLeaderboard }}>
      {children}
    </GameContext.Provider>
  );
};
