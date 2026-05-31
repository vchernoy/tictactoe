export const THEME_STORAGE_KEY = 'tictactoe-theme';

export type ThemeId = 'midnight' | 'chalkboard' | 'wood' | 'neon';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  swatchBg: string;
  swatchX: string;
  swatchO: string;
}

export const THEMES: ThemeOption[] = [
  { id: 'midnight', name: 'Midnight', swatchBg: '#1a1929', swatchX: '#ff6b6b', swatchO: '#4ecdc4' },
  { id: 'chalkboard', name: 'Chalkboard', swatchBg: '#243824', swatchX: '#e8dcc8', swatchO: '#c4b8a4' },
  { id: 'wood', name: 'Wood', swatchBg: '#3d2518', swatchX: '#c45c3e', swatchO: '#d4a853' },
  { id: 'neon', name: 'Neon Arcade', swatchBg: '#140028', swatchX: '#ff2d95', swatchO: '#00f5ff' },
];

export const DEFAULT_THEME: ThemeId = 'midnight';

const VALID_THEMES = new Set<string>(THEMES.map((t) => t.id));

export function isValidTheme(value: string): value is ThemeId {
  return VALID_THEMES.has(value);
}

export function getStoredTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && isValidTheme(stored)) return stored;
  } catch {
    /* localStorage unavailable */
  }
  return DEFAULT_THEME;
}

export function applyTheme(theme: ThemeId): void {
  document.documentElement.setAttribute('data-theme', theme);
}

export function persistTheme(theme: ThemeId): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* localStorage unavailable */
  }
}
