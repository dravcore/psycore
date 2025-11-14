'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K için arama
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // TODO: Open search modal
        console.log('Search shortcut triggered');
      }

      // Cmd/Ctrl + N için yeni anket
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        router.push('/surveys/create');
      }

      // Cmd/Ctrl + H için ana sayfa
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault();
        router.push('/dashboard');
      }

      // Cmd/Ctrl + / için yardım
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        // TODO: Open help modal
        console.log('Help shortcut triggered');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [router]);

  return null;
}
