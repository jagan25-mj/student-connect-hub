import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import { mockCredentials, mockUsers } from '@/data/mockData';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role: 'student' | 'founder') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  const login = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const credential = mockCredentials.find(
      c => c.email === email && c.password === password
    );
    
    if (credential) {
      setAuthState({
        user: credential.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true };
    }
    
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return { success: false, error: 'Invalid email or password' };
  }, []);

  const register = useCallback(async (
    name: string, 
    email: string, 
    password: string, 
    role: 'student' | 'founder'
  ) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if email already exists
    const exists = mockCredentials.some(c => c.email === email);
    if (exists) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Email already registered' };
    }
    
    // Create new user (in real app, this would be saved to backend)
    const newUser: User = {
      id: String(mockUsers.length + 1),
      name,
      email,
      role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      createdAt: new Date(),
    };
    
    setAuthState({
      user: newUser,
      isAuthenticated: true,
      isLoading: false,
    });
    
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout }}>
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
