import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('regalux_token'));
  const [activeExperiment, setActiveExperiment] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const health = await api.getHealth();
        setSystemHealth(health);
        
        // Fetch experiments to set default active experiment
        const exps = await api.getExperiments();
        if (exps && exps.length > 0) {
          setActiveExperiment(exps[0]);
        }

        const me = await api.getMe();
        setUser(me);
      } catch (err) {
        console.warn("Auth initialization notice:", err.message);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    localStorage.setItem('regalux_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    return res;
  };

  const register = async (email, password, fullName, role) => {
    const res = await api.register(email, password, fullName, role);
    localStorage.setItem('regalux_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('regalux_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      loading,
      activeExperiment,
      setActiveExperiment,
      systemHealth,
      isLiveAI: systemHealth?.mode?.includes("Live") || false
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
