import { createContext, useContext, useEffect, useState } from 'react';
import api from './services/api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('campusBuddyUser') || 'null'); } catch { return null; }
  });
  const [checking, setChecking] = useState(Boolean(localStorage.getItem('campusBuddyToken')));
  useEffect(() => {
    if (!localStorage.getItem('campusBuddyToken')) { setChecking(false); return; }
    api.get('/auth/me').then(({ data }) => {
      setUser(data.user); localStorage.setItem('campusBuddyUser', JSON.stringify(data.user));
    }).catch(() => {
      localStorage.removeItem('campusBuddyToken'); localStorage.removeItem('campusBuddyUser'); setUser(null);
    }).finally(() => setChecking(false));
  }, []);
  function login(data) {
    localStorage.setItem('campusBuddyToken', data.token);
    localStorage.setItem('campusBuddyUser', JSON.stringify(data.user));
    setUser(data.user);
  }
  function logout() {
    localStorage.removeItem('campusBuddyToken'); localStorage.removeItem('campusBuddyUser'); setUser(null);
  }
  return <AuthContext.Provider value={{ user, login, logout, checking }}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
