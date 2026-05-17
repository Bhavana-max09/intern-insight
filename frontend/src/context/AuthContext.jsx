import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Expose a helper to fetch the latest profile from the live database
  const refetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const { data } = await api.get('/users/profile');
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
    } catch (err) {
      console.error('Failed to sync live user profile:', err);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token) {
        if (savedUser) {
          // Pre-populate with saved data for instant rendering
          setUser(JSON.parse(savedUser));
        }
        // Immediately fetch the absolute latest data from the Atlas Database
        await refetchUser();
      }
      setLoading(false);
    };

    initAuth();
  }, [refetchUser]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};
