'use client';

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { musicians, type Musician, type AITag } from './mock-data';

interface AuthContextType {
  currentUser: Musician | null;
  login: (userId: number) => void;
  logout: () => void;
  updateProfile: (data: Partial<Musician>) => void;
  addAITag: (tag: Omit<AITag, 'id'>) => void;
  removeAITag: (tagId: number) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Musician | null>(null);

  const login = useCallback((userId: number) => {
    const user = musicians.find(m => m.id === userId);
    if (user) {
      setCurrentUser({ ...user });
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const updateProfile = useCallback((data: Partial<Musician>) => {
    setCurrentUser(prev => prev ? { ...prev, ...data } : null);
  }, []);

  const addAITag = useCallback((tag: Omit<AITag, 'id'>) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const newTag = { ...tag, id: Date.now() };
      return { ...prev, aiTags: [...prev.aiTags, newTag] };
    });
  }, []);

  const removeAITag = useCallback((tagId: number) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      return { ...prev, aiTags: prev.aiTags.filter(t => t.id !== tagId) };
    });
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateProfile, addAITag, removeAITag }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
