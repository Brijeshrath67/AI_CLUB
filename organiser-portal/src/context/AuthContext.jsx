import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken, clearToken, setRefreshFn } from '../api/tokens.js';

const AuthContext = createContext();

let refreshPromise = null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshAccessToken = async () => {
    if (!refreshPromise) {
      refreshPromise = fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      }).then(async (res) => {
        refreshPromise = null;
        if (res.ok) {
          const data = await res.json();
          setToken(data.access_token);
          return data.access_token;
        }
        throw new Error('Refresh failed');
      }).catch((err) => {
        refreshPromise = null;
        throw err;
      });
    }
    return refreshPromise;
  };

  useEffect(() => {
    setRefreshFn(refreshAccessToken);
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await refreshAccessToken();
        const meRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        const meData = await meRes.json();
        if (meData.success) {
          if (meData.user.role === 'organiser') {
            setUser(meData.user);
          } else {
            console.error('Session restore failed: User is not an organiser');
            clearToken();
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Session restore failed:', err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password, type, redirectTo) => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, type, requiredRole: 'organiser' }),
    });

    const data = await res.json();

    if (data.success) {
      if (data.user.role !== 'organiser') {
        return 'Access denied. You are not registered as an organiser.';
      }
      refreshPromise = null;
      setToken(data.access_token);
      setUser(data.user);
      navigate(redirectTo || '/');
      return null;
    }

    if (
      res.status === 403 ||
      data.message?.toLowerCase().includes('not verified') ||
      data.message?.toLowerCase().includes('otp') ||
      data.error?.toLowerCase().includes('not verified')
    ) {
      try {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
      } catch (err) {
        console.error('Failed to trigger OTP send:', err);
      }
      navigate('/otp', { state: { email, password, fromLogin: true, from: redirectTo } });
      return 'Email not verified. Redirecting to OTP verification...';
    }

    return data.message || data.error || 'Login failed';
  };

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      refreshPromise = null;
      clearToken();
      setUser(null);
      navigate('/login');
    }
  };

  const register = async (name, email, password, redirectTo) => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password, role: 'organiser' }),
    });
    const data = await res.json();

    if (res.ok && data.success) {
      const loginErr = await login(email, password, undefined, redirectTo);
      if (!loginErr) {
        navigate(redirectTo || '/');
        return null;
      }
    }

    if (
      res.status === 403 ||
      data.error?.toLowerCase().includes('not verified') ||
      data.message?.toLowerCase().includes('not verified')
    ) {
      try {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
      } catch (err) {
        console.error('Failed to trigger OTP send during register:', err);
      }
      navigate('/otp', { state: { name, email, password, fromRegister: true, from: redirectTo } });
      return null;
    }

    return data.message || data.error || 'Registration failed';
  };

  const loginWithToken = async (accessToken) => {
    setToken(accessToken);
    try {
      const meRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: 'include',
      });
      const meData = await meRes.json();
      if (meData.success) {
        if (meData.user.role === 'organiser') {
          setUser(meData.user);
          return meData.user;
        } else {
          clearToken();
          setUser(null);
        }
      }
    } catch (err) {
      console.error('Failed to login with token:', err);
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, register, loginWithToken, refreshAccessToken, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
