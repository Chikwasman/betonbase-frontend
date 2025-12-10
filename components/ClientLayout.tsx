'use client';

import { ThemeProvider } from '@/components/ThemeProvider';
import { Navigation } from '@/components/Navigation';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t dark:border-gray-800 py-6 text-center text-sm text-muted-foreground dark:text-gray-400 bg-white dark:bg-gray-900">
          <p>BetOnBase © 2025 - Decentralized P2P Betting Built On Base</p>
        </footer>
      </div>
    </ThemeProvider>
  );
}
