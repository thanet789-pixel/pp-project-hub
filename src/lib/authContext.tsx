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
    // Simulate fetching user session on mount
    // Default to the PM/Owner profile for prototype convenience
    const sessionUser = mockUsers.find(u => u.role === 'owner') || mockUsers[0];
    setUser(sessionUser);
    setIsLoading(false);
  }, []);

  const loginWithEmail = async (email: string) => {
    setIsLoading(true);
    const matched = mockUsers.find(u => u.email === email) || mockUsers[0];
    setUser(matched);
    setIsLoading(false);
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    // Login as default PM
    setUser(mockUsers[1]);
    setIsLoading(false);
  };

  const loginWithLine = async () => {
    setIsLoading(true);
    // Login as Installer for demo variety
    setUser(mockUsers[4]);
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    setUser(null);
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
