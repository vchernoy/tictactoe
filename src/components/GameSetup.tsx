import type { GameMode } from '../game/types';

interface GameSetupProps {
  size: number;
  mode: GameMode;
  onSizeChange: (size: number) => void;
  onModeChange: (mode: GameMode) => void;
  onStart: () => void;
}

const SIZES = [3, 4, 5, 6, 7, 8];

export function GameSetup({ size, mode, onSizeChange, onModeChange, onStart }: GameSetupProps) {
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
        <p className="setup-hint">
          {size <= 4
            ? `Win by getting ${size} in a row`
            : `Win by getting 4 in a row on a ${size}×${size} board`}
        </p>
      </div>

      <button type="button" className="start-btn" onClick={onStart}>
        Start Game
      </button>
    </div>
  );
}
