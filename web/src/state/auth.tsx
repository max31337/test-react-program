import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';

interface AuthContextShape {
  user: User | null;
  token: string | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextShape | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  function setAuth (t: string, u: User) {
    setToken(t); setUser(u);
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
  }
  function logout () {
    setToken(null); setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return <AuthContext.Provider value={{ user, token, setAuth, logout }}>{children}</AuthContext.Provider>;
};

export function useAuth () {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside provider');
  return ctx;
}

export function useAuthInit () {
  const [loading, setLoading] = useState(true);
  const auth = useAuth();
  useEffect(() => { setLoading(false); }, []);
  return { ...auth, loading };
}
