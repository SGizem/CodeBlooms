import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  // Sayfa yenilendiğinde kullanıcının oturumu açık kalsın
  useEffect(() => {
    const userStr = localStorage.getItem('cb_current_user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('cb_current_user');
      }
    }
  }, []);

  // GERÇEK KAYIT OLMA (MongoDB'ye yazar)
  async function register({ firstName, lastName, email, password }) {
    try {
      const res = await api.post('/api/users/register', { firstName, lastName, email, password });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('cb_current_user', JSON.stringify(res.data.user));
      setCurrentUser(res.data.user);

      return { ok: true, user: res.data.user };
    } catch (err) {
      return { ok: false, error: err.response?.data?.message || 'Kayıt başarısız oldu.' };
    }
  }

  // GERÇEK GİRİŞ YAPMA
  async function login({ email, password }) {
    try {
      const res = await api.post('/api/users/login', { email, password });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('cb_current_user', JSON.stringify(res.data.user));
      setCurrentUser(res.data.user);

      return { ok: true, user: res.data.user };
    } catch (err) {
      return { ok: false, error: err.response?.data?.message || 'E-posta veya şifre hatalı.' };
    }
  }

  // ÇIKIŞ YAPMA
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('cb_current_user');
    setCurrentUser(null);
  }

  const value = { currentUser, register, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}