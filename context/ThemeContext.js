import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'mnemio:theme-mode';

const palettes = {
  light: {
    mode: 'light',
    background: '#fff',
    surface: '#f7f7f8',
    border: '#dadce0',
    text: '#1f1f1f',
    textMuted: '#666',
    heading: '#1a1f3d',
    tabActive: '#1a1f3d',
    tabInactive: '#999',
    danger: '#d93025',
  },
  dark: {
    mode: 'dark',
    background: '#121218',
    surface: '#1e1e26',
    border: '#33333d',
    text: '#f2f2f2',
    textMuted: '#a0a0a8',
    heading: '#ffffff',
    tabActive: '#ffffff',
    tabInactive: '#71717a',
    danger: '#ff6b5e',
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        setMode(stored);
      }
      setLoaded(true);
    })();
  }, []);

  async function setTheme(nextMode) {
    setMode(nextMode);
    await AsyncStorage.setItem(STORAGE_KEY, nextMode);
  }

  const value = useMemo(
    () => ({
      mode,
      colors: palettes[mode],
      setTheme,
      loaded,
    }),
    [mode, loaded]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
