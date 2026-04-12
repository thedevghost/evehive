import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [team, setTeam] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token) {
      if (role === 'admin') {
        setIsAdmin(true);
        setLoading(false);
      } else {
        api.get('/teams/me')
          .then(res => {
            setTeam(res.data.team);
          })
          .catch(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
          })
          .finally(() => setLoading(false));
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, teamData, role = 'team') => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    if (role === 'admin') {
      setIsAdmin(true);
    } else {
      setTeam(teamData);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setTeam(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ team, setTeam, isAdmin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
