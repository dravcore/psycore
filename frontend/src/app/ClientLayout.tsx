'use client';

import NotificationContainer from '@/components/NotificationContainer';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <NotificationContainer />
      <KeyboardShortcuts />
    </>
  );
}
