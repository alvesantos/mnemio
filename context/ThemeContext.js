import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'mnemio:theme-mode';

// Cores de status compartilhadas pelos dois temas: precisam ser legíveis
// sobre fundo claro e escuro, então são tons médios saturados.
const statusPalette = {
  plano: { color: '#6C7BFF', label: 'No plano', icon: 'bookmark-outline' },
  andamento: { color: '#F2A03D', label: 'Em andamento', icon: 'play-circle-outline' },
  finalizado: { color: '#3DAE7C', label: 'Finalizado', icon: 'checkmark-circle-outline' },
  dropado: { color: '#C75C63', label: 'Dropado', icon: 'close-circle-outline' },
};

const palettes = {
  light: {
    mode: 'light',
    background: '#F6F4EF',
    surface: '#FFFFFF',
    surfaceAlt: '#EFECE4',
    border: '#E3DFD4',
    text: '#1D3357',
    textMuted: 'rgba(29, 51, 87, 0.6)',
    textFaint: 'rgba(29, 51, 87, 0.38)',
    heading: '#1D3357',
    tabActive: '#1D3357',
    tabInactive: 'rgba(29, 51, 87, 0.35)',
    accent: '#8FA98A',
    danger: '#d93025',
    track: 'rgba(29, 51, 87, 0.10)',
    overlay: 'rgba(29, 51, 87, 0.45)',
    shadowOpacity: 0.1,
  },
  dark: {
    mode: 'dark',
    background: '#1D3357',
    surface: '#283D63',
    surfaceAlt: '#32406B',
    border: 'rgba(246, 244, 239, 0.14)',
    text: '#F6F4EF',
    textMuted: 'rgba(246, 244, 239, 0.65)',
    textFaint: 'rgba(246, 244, 239, 0.42)',
    heading: '#F6F4EF',
    tabActive: '#F6F4EF',
    tabInactive: 'rgba(246, 244, 239, 0.4)',
    accent: '#8FA98A',
    danger: '#ff6b5e',
    track: 'rgba(246, 244, 239, 0.14)',
    overlay: 'rgba(9, 16, 30, 0.6)',
    shadowOpacity: 0.3,
  },
};

// Identidade visual por tipo de mídia, reaproveitada na Home, nos cards e
// nos cabeçalhos de detalhe.
export const MEDIA_THEME = {
  livros: { label: 'Livro', plural: 'Livros', icon: 'book', gradient: ['#7C6CFF', '#4B36D9'] },
  series: { label: 'Série', plural: 'Séries', icon: 'tv', gradient: ['#12D6C4', '#0C8F91'] },
  filmes: { label: 'Filme', plural: 'Filmes', icon: 'film', gradient: ['#FF7A7A', '#D93D5A'] },
  animes: { label: 'Anime', plural: 'Animes', icon: 'sparkles', gradient: ['#FFB84D', '#F76B1C'] },
};

export const STATUS_META = statusPalette;

export const STATUS_OPTIONS = [
  { value: 'plano', label: 'No plano' },
  { value: 'andamento', label: 'Em andamento' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'dropado', label: 'Dropado' },
];

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
      status: statusPalette,
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
