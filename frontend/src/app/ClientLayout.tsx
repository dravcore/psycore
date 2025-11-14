'use client';

import NotificationContainer from '@/components/NotificationContainer';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import ThemeProvider from '@/components/ThemeProvider';
import { Toaster } from 'react-hot-toast';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <NotificationContainer />
      <KeyboardShortcuts />
    </ThemeProvider>
  );
}
