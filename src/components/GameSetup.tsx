import {
  getLiveMarkMax,
  getLiveMarkMin,
  getWinLength,
} from '../game/logic';
import type { AiDifficulty, GameMode, GameVariant } from '../game/types';

interface GameSetupProps {
  size: number;
  mode: GameMode;
  variant: GameVariant;
  aiDifficulty: AiDifficulty;
  liveMarkCount: number;
  onSizeChange: (size: number) => void;
  onModeChange: (mode: GameMode) => void;
  onVariantChange: (variant: GameVariant) => void;
  onAiDifficultyChange: (difficulty: AiDifficulty) => void;
  onLiveMarkCountChange: (count: number) => void;
  onStart: () => void;
}

const DIFFICULTIES: { id: AiDifficulty; name: string; desc: string }[] = [
  { id: 'easy', name: 'Easy', desc: 'Mostly random, sometimes clever' },
  { id: 'medium', name: 'Medium', desc: 'Blocks and wins, good openings' },
  { id: 'hard', name: 'Hard', desc: 'Full minimax — very tough' },
];

const SIZES = [3, 4, 5, 6, 7, 8];

function getLiveMarkOptions(minK: number, maxK: number): number[] {
  return Array.from({ length: maxK - minK + 1 }, (_, i) => minK + i);
}

function getWinHint(size: number, variant: GameVariant): string {
  const n = size <= 4 ? size : 4;
  if (variant === 'misere') {
    return `Avoid ${n} in a row — whoever completes a line loses`;
  }
  if (variant === 'limited') {
    return size <= 4
      ? `Win by getting ${size} in a row — marks expire after K moves`
      : `Win by getting 4 in a row on a ${size}×${size} board — marks expire after K moves`;
  }
  return size <= 4
    ? `Win by getting ${size} in a row`
    : `Win by getting 4 in a row on a ${size}×${size} board`;
}

export function GameSetup({
  size,
  mode,
  variant,
  onSizeChange,
  onModeChange,
  onVariantChange,
  aiDifficulty,
  onAiDifficultyChange,
  liveMarkCount,
  onLiveMarkCountChange,
  onStart,
}: GameSetupProps) {
  const winLength = getWinLength(size);
  const minK = getLiveMarkMin(size, winLength);
  const maxK = getLiveMarkMax(size);
  const liveMarkOptions = getLiveMarkOptions(minK, maxK);
  const useLiveMarkSelect = liveMarkOptions.length > 8;

  return (
    <div className="setup-panel">
      <h2 className="setup-title">Choose Your Game</h2>

      <div className="setup-section">
        <label className="setup-label">Game Mode</label>
        <div className="mode-toggle">
          <button
            type="button"
            className={`mode-btn ${mode === 'pvp' ? 'active' : ''}`}
            onClick={() => onModeChange('pvp')}
          >
            <span className="mode-icon">👥</span>
            <span className="mode-name">Human vs Human</span>
            <span className="mode-desc">Play locally with a friend</span>
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === 'pvc' ? 'active' : ''}`}
            onClick={() => onModeChange('pvc')}
          >
            <span className="mode-icon">🤖</span>
            <span className="mode-name">Human vs Computer</span>
            <span className="mode-desc">Challenge the AI</span>
          </button>
        </div>
      </div>

      {mode === 'pvc' && (
        <div className="setup-section">
          <label className="setup-label">AI Difficulty</label>
          <div className="difficulty-toggle">
            {DIFFICULTIES.map(({ id, name, desc }) => (
              <button
                key={id}
                type="button"
                className={`difficulty-btn ${aiDifficulty === id ? 'active' : ''}`}
                onClick={() => onAiDifficultyChange(id)}
              >
                <span className="difficulty-name">{name}</span>
                <span className="difficulty-desc">{desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="setup-section">
        <label className="setup-label">Rules</label>
        <div className="variant-toggle">
          <button
            type="button"
            className={`variant-btn ${variant === 'standard' ? 'active' : ''}`}
            onClick={() => onVariantChange('standard')}
          >
            <span className="variant-name">Standard</span>
            <span className="variant-desc">N in a row wins</span>
          </button>
          <button
            type="button"
            className={`variant-btn ${variant === 'misere' ? 'active' : ''}`}
            onClick={() => onVariantChange('misere')}
          >
            <span className="variant-name">Misère</span>
            <span className="variant-desc">Completing a line loses</span>
          </button>
          <button
            type="button"
            className={`variant-btn ${variant === 'limited' ? 'active' : ''}`}
            onClick={() => onVariantChange('limited')}
          >
            <span className="variant-name">Limited</span>
            <span className="variant-desc">Only K marks on board</span>
          </button>
        </div>
        <p className="setup-hint variant-hint">
          {variant === 'misere'
            ? 'Misère: the player who gets N in a row loses. Draws still happen when the board fills with no line.'
            : variant === 'limited'
              ? 'Limited: standard N-in-a-row wins, but each player keeps only their last K marks. Misère rules do not apply in this mode.'
              : 'Standard: first player to get N in a row wins.'}
        </p>
      </div>

      {variant === 'limited' && (
        <div className="setup-section">
          <label className="setup-label">Live Mark Count (K)</label>
          {useLiveMarkSelect ? (
            <select
              className="live-mark-select"
              value={liveMarkCount}
              onChange={(e) => onLiveMarkCountChange(Number(e.target.value))}
            >
              {liveMarkOptions.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          ) : (
            <div
              className="live-mark-grid"
              style={{ gridTemplateColumns: `repeat(${Math.min(liveMarkOptions.length, 4)}, 1fr)` }}
            >
              {liveMarkOptions.map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`live-mark-btn ${liveMarkCount === k ? 'active' : ''}`}
                  onClick={() => onLiveMarkCountChange(k)}
                >
                  {k}
                </button>
              ))}
            </div>
          )}
          <p className="setup-hint">
            Each player keeps their last K marks (K = {minK} … {maxK}). Oldest disappears.
          </p>
        </div>
      )}

      <div className="setup-section">
        <label className="setup-label">Board Size</label>
        <div className="size-grid">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              className={`size-btn ${size === s ? 'active' : ''}`}
              onClick={() => onSizeChange(s)}
            >
              {s}×{s}
            </button>
          ))}
        </div>
        <p className="setup-hint">{getWinHint(size, variant)}</p>
      </div>

      <button type="button" className="start-btn" onClick={onStart}>
        Start Game
      </button>
    </div>
  );
}
