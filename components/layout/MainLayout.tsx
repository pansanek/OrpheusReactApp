'use client';

import { Header } from './Header';
import { Sidebar } from './Sidebar';
import type { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function MainLayout({ children, showSidebar = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto flex max-w-7xl">
        {showSidebar && <Sidebar />}
        <main className="min-h-[calc(100vh-4rem)] flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
