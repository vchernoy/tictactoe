import { useCallback, useEffect, useRef, useState } from 'react';
import type { AiDifficulty, GameMode, GameRules } from '../game/types';
import type { ThemeId } from '../themes';
import { buildShareUrl, type ShareableGameConfig } from '../utils/gameUrl';

interface ShareButtonProps {
  size: number;
  mode: GameMode;
  rules: GameRules;
  aiDifficulty: AiDifficulty;
  theme: ThemeId;
  compact?: boolean;
}

export function ShareButton({
  size,
  mode,
  rules,
  aiDifficulty,
  theme,
  compact = false,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const getShareUrl = useCallback((): string => {
    const config: ShareableGameConfig = { size, mode, rules, aiDifficulty, theme };
    return buildShareUrl(config);
  }, [size, mode, rules, aiDifficulty, theme]);

  const showCopiedFeedback = useCallback(() => {
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleShare = useCallback(async () => {
    const url = getShareUrl();

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'Tic Tac Toe',
          text: 'Join my Tic Tac Toe game setup',
          url,
        });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      showCopiedFeedback();
    } catch {
      /* clipboard unavailable */
    }
  }, [getShareUrl, showCopiedFeedback]);

  return (
    <button
      type="button"
      className={`share-btn ${compact ? 'share-btn-compact' : ''} ${copied ? 'share-btn-copied' : ''}`}
      onClick={handleShare}
      aria-live="polite"
    >
      {copied ? 'Copied!' : compact ? 'Share' : 'Copy link'}
    </button>
  );
}
