'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { mockUsers } from './mockData';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
  loginWithEmail: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithLine: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user session exists in localStorage
    try {
      const stored = localStorage.getItem('pp_auth_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to restore session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithEmail = async (email: string) => {
    setIsLoading(true);
    // Find matching user or fallback to owner
    const matched = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || mockUsers[0];
    setUser(matched);
    localStorage.setItem('pp_auth_user', JSON.stringify(matched));
    setIsLoading(false);
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    const matched = mockUsers[1]; // PM
    setUser(matched);
    localStorage.setItem('pp_auth_user', JSON.stringify(matched));
    setIsLoading(false);
  };

  const loginWithLine = async () => {
    setIsLoading(true);
    const matched = mockUsers[4]; // Installer
    setUser(matched);
    localStorage.setItem('pp_auth_user', JSON.stringify(matched));
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    setUser(null);
    localStorage.removeItem('pp_auth_user');
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        loginWithEmail,
        loginWithGoogle,
        loginWithLine,
        logout
      }}
    >
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
