import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, MemberSubscription } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; password?: string; phone?: string; planId?: string }, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserSubscription: (sub: MemberSubscription | null) => void;
  quickDemoLogin: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'cambiar_auth_user';
const LOCAL_STORAGE_TOKEN_KEY = 'cambiar_auth_token';
const SESSION_STORAGE_USER_KEY = 'cambiar_auth_user_session';
const SESSION_STORAGE_TOKEN_KEY = 'cambiar_auth_token_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const savedLocal = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (savedLocal) return JSON.parse(savedLocal);
      const savedSession = sessionStorage.getItem(SESSION_STORAGE_USER_KEY);
      if (savedSession) return JSON.parse(savedSession);
      return null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY) || sessionStorage.getItem(SESSION_STORAGE_TOKEN_KEY) || null;
    } catch (e) {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const persistAuth = (userData: AuthUser, tokenValue: string, remember: boolean = true) => {
    setUser(userData);
    setToken(tokenValue);
    if (remember) {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userData));
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, tokenValue);
      sessionStorage.removeItem(SESSION_STORAGE_USER_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_TOKEN_KEY);
    } else {
      sessionStorage.setItem(SESSION_STORAGE_USER_KEY, JSON.stringify(userData));
      sessionStorage.setItem(SESSION_STORAGE_TOKEN_KEY, tokenValue);
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    }
  };

  // Sync user status on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY) || sessionStorage.getItem(SESSION_STORAGE_TOKEN_KEY);
        const savedUserStr = localStorage.getItem(LOCAL_STORAGE_USER_KEY) || sessionStorage.getItem(SESSION_STORAGE_USER_KEY);
        
        if (savedUserStr) {
          const parsed = JSON.parse(savedUserStr);
          const res = await fetch(`/api/auth/me?email=${encodeURIComponent(parsed.email)}`, {
            headers: savedToken ? { Authorization: `Bearer ${savedToken}` } : {},
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              setUser(data.user);
              if (localStorage.getItem(LOCAL_STORAGE_USER_KEY)) {
                localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(data.user));
              } else {
                sessionStorage.setItem(SESSION_STORAGE_USER_KEY, JSON.stringify(data.user));
              }
            }
          }
        } else {
          // Default active member for seamless demo if first visit
          const demoRes = await fetch('/api/auth/me?email=alex@cambiar.nl');
          if (demoRes.ok) {
            const data = await demoRes.json();
            if (data.user) {
              persistAuth(data.user, data.token, true);
            }
          }
        }
      } catch (err) {
        console.warn('Auth initialization fallback:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password?: string, rememberMe: boolean = true) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Inloggen mislukt' };
      }

      persistAuth(data.user, data.token, rememberMe);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Verbindingsfout' };
    }
  };

  const register = async (data: { name: string; email: string; password?: string; phone?: string; planId?: string }, rememberMe: boolean = true) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Registratie mislukt' };
      }

      persistAuth(resData.user, resData.token, rememberMe);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Verbindingsfout' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_USER_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_TOKEN_KEY);
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/auth/me?email=${encodeURIComponent(user.email)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          if (localStorage.getItem(LOCAL_STORAGE_USER_KEY)) {
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(data.user));
          } else {
            sessionStorage.setItem(SESSION_STORAGE_USER_KEY, JSON.stringify(data.user));
          }
        }
      }
    } catch (e) {
      console.warn('Could not refresh user', e);
    }
  };

  const updateUserSubscription = (sub: MemberSubscription | null) => {
    if (!user) return;
    const updated = { ...user, subscription: sub };
    setUser(updated);
    if (localStorage.getItem(LOCAL_STORAGE_USER_KEY)) {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
    } else {
      sessionStorage.setItem(SESSION_STORAGE_USER_KEY, JSON.stringify(updated));
    }
  };

  const quickDemoLogin = async (email: string) => {
    await login(email, 'password123', true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateUserSubscription,
        quickDemoLogin,
      }}
    >
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
