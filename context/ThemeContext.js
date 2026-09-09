import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const MODE_KEY = 'mnemio:theme-mode';
const PALETTE_KEY = 'mnemio:theme-palette';

// Cores de status compartilhadas pelos dois temas: precisam ser legíveis
// sobre fundo claro e escuro, então são tons médios saturados.
const statusPalette = {
  plano: { color: '#6C7BFF', label: 'No plano', icon: 'bookmark-outline' },
  andamento: { color: '#F2A03D', label: 'Em andamento', icon: 'play-circle-outline' },
  finalizado: { color: '#3DAE7C', label: 'Finalizado', icon: 'checkmark-circle-outline' },
  dropado: { color: '#C75C63', label: 'Dropado', icon: 'close-circle-outline' },
};

// Cada família define só os tons "âncora": a tinta escura (usada como texto no
// claro e como fundo no escuro), o papel claro e o accent. O resto é derivado
// em buildPalette para os dois modos continuarem consistentes entre si.
const families = {
  azul: {
    key: 'azul',
    label: 'Azul',
    ink: '#1D3357',
    inkSurface: '#283D63',
    inkSurfaceAlt: '#32406B',
    paper: '#F6F4EF',
    paperSurfaceAlt: '#EFECE4',
    paperBorder: '#E3DFD4',
    accent: '#8FA98A',
  },
  rosa: {
    key: 'rosa',
    label: 'Rosa',
    ink: '#4A1F3D',
    inkSurface: '#5E2B4E',
    inkSurfaceAlt: '#6E3459',
    paper: '#FBF3F5',
    paperSurfaceAlt: '#F4E6EA',
    paperBorder: '#EBD6DC',
    accent: '#D96A9A',
  },
  laranja: {
    key: 'laranja',
    label: 'Laranja',
    ink: '#4A2A17',
    inkSurface: '#5E3720',
    inkSurfaceAlt: '#6E4327',
    paper: '#FDF4EC',
    paperSurfaceAlt: '#F6E7D8',
    paperBorder: '#EDD9C6',
    accent: '#E8813C',
  },
};

const DEFAULT_PALETTE = 'azul';

function rgba(hex, alpha) {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildPalette(family, mode) {
  const { ink, inkSurface, inkSurfaceAlt, paper, paperSurfaceAlt, paperBorder, accent } = family;

  if (mode === 'dark') {
    return {
      mode: 'dark',
      palette: family.key,
      background: ink,
      surface: inkSurface,
      surfaceAlt: inkSurfaceAlt,
      border: rgba(paper, 0.14),
      text: paper,
      textMuted: rgba(paper, 0.65),
      textFaint: rgba(paper, 0.42),
      heading: paper,
      tabActive: paper,
      tabInactive: rgba(paper, 0.4),
      accent,
      danger: '#ff6b5e',
      track: rgba(paper, 0.14),
      overlay: 'rgba(0, 0, 0, 0.55)',
      shadowOpacity: 0.3,
    };
  }

  return {
    mode: 'light',
    palette: family.key,
    background: paper,
    surface: '#FFFFFF',
    surfaceAlt: paperSurfaceAlt,
    border: paperBorder,
    text: ink,
    textMuted: rgba(ink, 0.6),
    textFaint: rgba(ink, 0.38),
    heading: ink,
    tabActive: ink,
    tabInactive: rgba(ink, 0.35),
    accent,
    danger: '#d93025',
    track: rgba(ink, 0.1),
    overlay: rgba(ink, 0.45),
    shadowOpacity: 0.1,
  };
}

// Lista para a tela de Perfil montar os seletores de paleta.
export const PALETTE_OPTIONS = Object.values(families).map((family) => ({
  key: family.key,
  label: family.label,
  swatch: [family.ink, family.accent],
}));

// Identidade visual por tipo de mídia, reaproveitada na Home, nos cards e
// nos cabeçalhos de detalhe.
export const MEDIA_THEME = {
  livros: { label: 'Livro', plural: 'Livros', icon: 'book', gradient: ['#7C6CFF', '#4B36D9'] },
  series: { label: 'Série', plural: 'Séries', icon: 'tv', gradient: ['#12D6C4', '#0C8F91'] },
  filmes: { label: 'Filme', plural: 'Filmes', icon: 'film', gradient: ['#FF7A7A', '#D93D5A'] },
  doramas: { label: 'Dorama', plural: 'Doramas', icon: 'heart', gradient: ['#F58BB0', '#C3417A'] },
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
  const [palette, setPaletteState] = useState(DEFAULT_PALETTE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [storedMode, storedPalette] = await Promise.all([
        AsyncStorage.getItem(MODE_KEY),
        AsyncStorage.getItem(PALETTE_KEY),
      ]);
      if (storedMode === 'light' || storedMode === 'dark') {
        setMode(storedMode);
      }
      if (storedPalette && families[storedPalette]) {
        setPaletteState(storedPalette);
      }
      setLoaded(true);
    })();
  }, []);

  async function setTheme(nextMode) {
    setMode(nextMode);
    await AsyncStorage.setItem(MODE_KEY, nextMode);
  }

  async function setPalette(nextPalette) {
    if (!families[nextPalette]) return;
    setPaletteState(nextPalette);
    await AsyncStorage.setItem(PALETTE_KEY, nextPalette);
  }

  const value = useMemo(
    () => ({
      mode,
      palette,
      palettes: PALETTE_OPTIONS,
      colors: buildPalette(families[palette] ?? families[DEFAULT_PALETTE], mode),
      status: statusPalette,
      setTheme,
      setPalette,
      loaded,
    }),
    [mode, palette, loaded]
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
