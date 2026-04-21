'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Musician, AuthContextType } from '@/lib/types';
import { musicians as initialMusicians } from '@/lib/mockData';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Musician | null>(null);
  const [musicians, setMusicians] = useState<Musician[]>(initialMusicians);

  const login = useCallback((userId: number) => {
    const user = musicians.find((m) => m.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  }, [musicians]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const updateProfile = useCallback((data: Partial<Musician>) => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...data };
    setCurrentUser(updatedUser);
    setMusicians((prev) =>
      prev.map((m) => (m.id === currentUser.id ? updatedUser : m))
    );
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateProfile }}>
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
