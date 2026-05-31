import { useCallback, useState } from 'react';
import {
  playDrawSound,
  playExpireSound,
  playPlaceSound,
  playWinSound,
} from '../audio/sounds';

const STORAGE_KEY = 'tictactoe-sound';

function getStoredSoundEnabled(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return false;
    return raw === 'true';
  } catch {
    return false;
  }
}

function persistSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    /* ignore quota / private mode */
  }
}

export function useSound() {
  const [enabled, setEnabledState] = useState(getStoredSoundEnabled);

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
    persistSoundEnabled(next);
  }, []);

  const toggleEnabled = useCallback(() => {
    setEnabledState((prev) => {
      const next = !prev;
      persistSoundEnabled(next);
      return next;
    });
  }, []);

  const playPlace = useCallback(() => {
    if (!enabled) return;
    playPlaceSound();
  }, [enabled]);

  const playWin = useCallback(
    (misere = false) => {
      if (!enabled) return;
      playWinSound(misere);
    },
    [enabled],
  );

  const playDraw = useCallback(() => {
    if (!enabled) return;
    playDrawSound();
  }, [enabled]);

  const playExpire = useCallback(() => {
    if (!enabled) return;
    playExpireSound();
  }, [enabled]);

  return {
    soundEnabled: enabled,
    setSoundEnabled: setEnabled,
    toggleSound: toggleEnabled,
    playPlace,
    playWin,
    playDraw,
    playExpire,
  };
}
