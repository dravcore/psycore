import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserPreferences {
  emailNotifications: boolean;
  surveyCompletedNotifications: boolean;
  profileVisibility: boolean;
  anonymousResponses: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: 'tr' | 'en';
}

interface SettingsState {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
}

const defaultPreferences: UserPreferences = {
  emailNotifications: true,
  surveyCompletedNotifications: true,
  profileVisibility: false,
  anonymousResponses: false,
  theme: 'light',
  language: 'tr',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      updatePreference: (key, value) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            [key]: value,
          },
        })),
      updatePreferences: (newPreferences) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...newPreferences,
          },
        })),
    }),
    {
      name: 'settings-storage',
    }
  )
);
