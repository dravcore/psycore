'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { preferences } = useSettingsStore();

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove any existing theme classes
    root.classList.remove('light', 'dark');

    if (preferences.theme === 'auto') {
      // Check system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(isDark ? 'dark' : 'light');

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Use user preference
      root.classList.add(preferences.theme);
    }
  }, [preferences.theme]);

  return <>{children}</>;
}
