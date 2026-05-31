import { useCallback, useEffect, useState } from 'react';
import {
  applyTheme,
  getStoredTheme,
  persistTheme,
  type ThemeId,
} from '../themes';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>(() => getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next);
    applyTheme(next);
    persistTheme(next);
  }, []);

  return { theme, setTheme };
}
