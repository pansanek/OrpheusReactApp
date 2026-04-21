'use client';

import { useState, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Header } from './header';
import { Sidebar } from './sidebar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      <div className="flex">
        {currentUser && (
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
