'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiFetch } from '@/lib/apiClient';
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
      const storedGuest = localStorage.getItem('unimart:guest');

      if (storedToken) {
        // ✅ FIXED: Set token and user immediately from localStorage
        setToken(storedToken);
        setAuthCookie(storedToken);

        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (e) {
            console.warn('Failed to parse stored user:', e);
          }
        }

        // ✅ FIXED: Validate token in background, don't clear on failure
        // This keeps the user on the page even if validation fails
        try {
          // ✅ FIXED: Removed duplicate /api prefix
          const res = await apiFetch<{ user?: User; data?: any; success?: boolean }>('/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` },
            suppressErrorLog: true
          });
          
          if (res && (res.user || res.data)) {
            const userData = res.user || res.data;
            setUser(userData);
            // Update stored user with fresh data
            localStorage.setItem('unimart:user', JSON.stringify(userData));
          }
          // If validation fails, we keep the stored user data anyway
          // This prevents redirect on refresh
        } catch (e) {
          console.debug('Token validation failed (keeping stored user):', e);
          // Don't clear the user data on validation failure
          // This keeps the user on the page
        }
      } else if (storedGuest && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.role === 'guest') {
            setUser(parsedUser);
          } else {
            localStorage.removeItem('unimart:guest');
            localStorage.removeItem('unimart:user');
            setUser(null);
          }
        } catch (e) {
          console.warn('Failed to parse guest user:', e);
          localStorage.removeItem('unimart:guest');
          localStorage.removeItem('unimart:user');
          setUser(null);
        }
      } else {
        // If localStorage is cleared but an auth cookie remains, clear the stale cookie too.
        clearAuthCookie();
        localStorage.removeItem('unimart:user');
        localStorage.removeItem('unimart:guest');
        setUser(null);
      }
    } catch (e) {
      console.error('Auth initialization error:', e);
    } finally {
      setIsLoading(false);
    }
  }

  async function checkAuth(): Promise<boolean> {
    if (!token) {
      // ✅ FIXED: Check localStorage for token
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('unimart:token') : null;
      if (storedToken) {
        setToken(storedToken);
        try {
          // ✅ FIXED: Removed duplicate /api prefix
          const res = await apiFetch<{ user?: User; data?: any }>('/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` },
            suppressErrorLog: true
          });
          if (res && (res.user || res.data)) {
            const userData = res.user || res.data;
            setUser(userData);
            localStorage.setItem('unimart:user', JSON.stringify(userData));
            return true;
          }
        } catch (e) {
          console.debug('Auth check failed:', e);
          return false;
        }
      }
      return false;
    }

    try {
      // ✅ FIXED: Removed duplicate /api prefix
      const res = await apiFetch<{ user?: User; data?: any }>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
        suppressErrorLog: true
      });
      if (res && (res.user || res.data)) {
        const userData = res.user || res.data;
        setUser(userData);
        localStorage.setItem('unimart:user', JSON.stringify(userData));
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
      // ✅ FIXED: Removed duplicate /api prefix
      const res = await apiFetch<{ token: string; user: User; success: boolean; message?: string }>('/auth/login', {
        method: 'POST',
        body: { email, password },
        suppressErrorLog: true
      });

      if (res && res.success && res.token) {
        // ✅ FIXED: Persist both token and user immediately
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('unimart:token', res.token);
        localStorage.setItem('unimart:user', JSON.stringify(res.user));
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
      // ✅ FIXED: Removed duplicate /api prefix
      const res = await apiFetch<{ token: string; user: User; success: boolean; message?: string }>('/auth/register', {
        method: 'POST',
        body: data,
        suppressErrorLog: true
      });

      if (res && res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('unimart:token', res.token);
        localStorage.setItem('unimart:user', JSON.stringify(res.user));
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
        // ✅ FIXED: Removed duplicate /api prefix
        await apiFetch('/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${tokenForLogout}` },
          suppressErrorLog: true
        });
      } catch (e) {
        console.debug('Backend logout call failed (ignored):', e);
      }
    }
  }

  const isGuestUser = !!user && user.role === 'guest';
  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: (!!token && !!user) || isGuestUser,
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