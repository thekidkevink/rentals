import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { getPalette, ThemeMode } from '../theme/palette';

const THEME_MODE_KEY = 'rentals.theme-mode';
const SHOW_SAVED_KEY = 'rentals.show-saved-profile';

type PreferencesContextValue = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  showSavedListingsInProfile: boolean;
  setShowSavedListingsInProfile: (value: boolean) => Promise<void>;
  loading: boolean;
  palette: ReturnType<typeof getPalette>;
};

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [showSavedListingsInProfile, setShowSavedListingsState] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const [storedTheme, storedShowSaved] = await Promise.all([
          AsyncStorage.getItem(THEME_MODE_KEY),
          AsyncStorage.getItem(SHOW_SAVED_KEY),
        ]);

        if (!active) {
          return;
        }

        if (storedTheme === 'dark' || storedTheme === 'light') {
          setThemeModeState(storedTheme);
        }

        if (storedShowSaved === 'true' || storedShowSaved === 'false') {
          setShowSavedListingsState(storedShowSaved === 'true');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void hydrate();

    return () => {
      active = false;
    };
  }, []);

  async function setThemeMode(mode: ThemeMode) {
    setThemeModeState(mode);
    await AsyncStorage.setItem(THEME_MODE_KEY, mode);
  }

  async function setShowSavedListingsInProfile(value: boolean) {
    setShowSavedListingsState(value);
    await AsyncStorage.setItem(SHOW_SAVED_KEY, String(value));
  }

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      showSavedListingsInProfile,
      setShowSavedListingsInProfile,
      loading,
      palette: getPalette(themeMode),
    }),
    [loading, showSavedListingsInProfile, themeMode],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }

  return context;
}
