import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'mnemio:theme-mode';

const palettes = {
  light: {
    mode: 'light',
    background: '#F6F4EF',
    surface: '#FFFFFF',
    border: '#E3DFD4',
    text: '#1D3357',
    textMuted: 'rgba(29, 51, 87, 0.6)',
    heading: '#1D3357',
    tabActive: '#1D3357',
    tabInactive: 'rgba(29, 51, 87, 0.35)',
    accent: '#8FA98A',
    danger: '#d93025',
  },
  dark: {
    mode: 'dark',
    background: '#1D3357',
    surface: '#3D3357',
    border: 'rgba(246, 244, 239, 0.14)',
    text: '#F6F4EF',
    textMuted: 'rgba(246, 244, 239, 0.65)',
    heading: '#F6F4EF',
    tabActive: '#F6F4EF',
    tabInactive: 'rgba(246, 244, 239, 0.4)',
    accent: '#8FA98A',
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
