'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import apiFetch from '@/lib/apiClient';
import { setAuthCookie, clearAuthCookie, persistAuthToken } from '@/lib/authCookie';

export interface User {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  university?: string;
  role?: 'buyer' | 'seller' | 'guest';
  isVerified?: boolean;
  createdAt?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; token?: string; user?: User; message?: string }>;
  signup: (data: any) => Promise<{ success: boolean; token?: string; user?: User; message?: string }>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth from localStorage on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Persist token to localStorage + cookie whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      if (token) {
        persistAuthToken(token);
      } else {
        localStorage.removeItem('unimart:token');
        clearAuthCookie();
      }
    } catch (e) {
      console.warn('Failed to save token:', e);
    }
  }, [token]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      if (user) {
        localStorage.setItem('unimart:user', JSON.stringify(user));
      } else {
        localStorage.removeItem('unimart:user');
      }
    } catch (e) {
      console.warn('Failed to save user to localStorage:', e);
    }
  }, [user]);

  async function initializeAuth() {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    try {
      // Try to get token and user from localStorage
      const storedToken = localStorage.getItem('unimart:token');
      const storedUser = localStorage.getItem('unimart:user');

      if (storedToken) {
        setToken(storedToken);
        setAuthCookie(storedToken);

        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.warn('Failed to parse stored user:', e);
          }
        }

        // Validate token with backend
        try {
          const res = await apiFetch<{ user?: User; data?: any; success?: boolean }>('/auth/me');
          if (res && (res.user || res.data)) {
            const userData = res.user || res.data;
            setUser(userData);
          } else {
            // Token is invalid, clear auth
            setToken(null);
            setUser(null);
            localStorage.removeItem('unimart:token');
            localStorage.removeItem('unimart:user');
          }
        } catch (e) {
          console.debug('Token validation failed:', e);
          setToken(null);
          setUser(null);
          localStorage.removeItem('unimart:token');
          localStorage.removeItem('unimart:user');
          clearAuthCookie();
        }
      }
    } catch (e) {
      console.error('Auth initialization error:', e);
    } finally {
      setIsLoading(false);
    }
  }

  async function checkAuth(): Promise<boolean> {
    if (!token) return false;

    try {
      const res = await apiFetch<{ user?: User; data?: any }>('/auth/me');
      if (res && (res.user || res.data)) {
        const userData = res.user || res.data;
        setUser(userData);
        return true;
      }
      return false;
    } catch (e) {
      console.debug('Auth check failed:', e);
      return false;
    }
  }

  async function login(email: string, password: string) {
    try {
      const res = await apiFetch<{ token: string; user: User; success: boolean; message?: string }>('/auth/login', {
        method: 'POST',
        body: { email, password }
      });

      if (res && res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        return { success: true, token: res.token, user: res.user };
      }

      return { success: false, message: res?.message || 'Login failed' };
    } catch (e: any) {
      const message = e?.payload?.message || e?.message || 'Login failed. Please try again.';
      return { success: false, message };
    }
  }

  async function signup(data: any) {
    try {
      const res = await apiFetch<{ token: string; user: User; success: boolean; message?: string }>('/auth/register', {
        method: 'POST',
        body: data
      });

      if (res && res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        return { success: true, token: res.token, user: res.user };
      }

      return { success: false, message: res?.message || 'Signup failed' };
    } catch (e: any) {
      const message = e?.payload?.message || e?.message || 'Signup failed. Please try again.';
      return { success: false, message };
    }
  }

  async function logout() {
    const tokenForLogout =
      typeof window !== 'undefined' ? localStorage.getItem('unimart:token') : null;

    // Clear client auth immediately so UI + middleware stay in sync
    setToken(null);
    setUser(null);
    try {
      const keysToRemove = [
        'unimart:token',
        'unimart:user',
        'unimart:guest',
        'unimart:onboarded',
        'unimart:university',
      ];
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      sessionStorage.removeItem('unimart:justLoggedIn');
      clearAuthCookie();
    } catch (e) {
      console.warn('Failed to clear auth storage:', e);
    }

    try {
      window.dispatchEvent(new Event('unimart:authChanged'));
    } catch (e) { }

    // Best-effort backend logout using the captured token
    if (tokenForLogout) {
      try {
        await apiFetch('/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${tokenForLogout}` },
        });
      } catch (e) {
        console.debug('Backend logout call failed (ignored):', e);
      }
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    setUser,
    setToken,
    logout,
    login,
    signup,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
