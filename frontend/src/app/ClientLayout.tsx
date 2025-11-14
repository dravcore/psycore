'use client';

import NotificationContainer from '@/components/NotificationContainer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <NotificationContainer />
    </>
  );
}
