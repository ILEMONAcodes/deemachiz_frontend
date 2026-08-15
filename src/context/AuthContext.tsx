'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  getCurrentUser, 
  isAuthenticated,
  UserProfile, 
  RegisterPayload 
} from '@/lib/auth';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  authenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch current user if token exists on mount
  const refreshUser = async () => {
    if (!isAuthenticated()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await getCurrentUser();
      setUser(profile);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // Wrap login helper to set user state globally
  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      await loginUser(email, password);
      await refreshUser();
    } finally {
      setLoading(false);
    }
  };

  // Wrap register helper
  const handleRegister = async (userData: RegisterPayload) => {
    setLoading(true);
    try {
      await registerUser(userData);
    } finally {
      setLoading(false);
    }
  };

  // Wrap logout
  const handleLogout = () => {
    setUser(null);
    logoutUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authenticated: !!user,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for consuming auth state anywhere
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}