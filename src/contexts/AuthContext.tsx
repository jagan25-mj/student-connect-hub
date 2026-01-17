import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import { authApi, setToken, getToken, removeToken } from '@/lib/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role?: 'student') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true, // Start with loading to check for existing token
  });

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const response = await authApi.getMe();
          if (response.success && response.user) {
            setAuthState({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
        } catch {
          removeToken();
        }
      }
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    };
    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await authApi.login({ email, password });

      if (response.success && response.token) {
        setToken(response.token);
        setAuthState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      }

      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: response.error || 'Login failed' };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  }, []);

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    role: 'student' = 'student'
  ) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await authApi.register({ name, email, password, role });

      if (response.success && response.token) {
        setToken(response.token);
        setAuthState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      }

      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: response.error || 'Registration failed' };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error instanceof Error ? error.message : 'Registration failed' };
    }
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const updateUser = useCallback((user: User) => {
    setAuthState(prev => ({
      ...prev,
      user,
    }));
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.getMe();
      if (response.success && response.user) {
        setAuthState(prev => ({
          ...prev,
          user: response.user,
        }));
      }
    } catch {
      // Silently fail - user will see stale data
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

