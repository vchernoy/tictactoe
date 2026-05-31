import type { Player } from '../game/types';

interface FirstPlayerSuggestionProps {
  suggested: Player;
  mode: 'pvp' | 'pvc';
  onAccept: () => void;
  onReroll: () => void;
}

export function FirstPlayerSuggestion({ suggested, mode, onAccept, onReroll }: FirstPlayerSuggestionProps) {
  const playerLabel =
    mode === 'pvp'
      ? suggested === 'X'
        ? 'Player 1 (X)'
        : 'Player 2 (O)'
      : suggested === 'X'
        ? 'You (X)'
        : 'Computer (X)';

  return (
    <div className="first-player-overlay">
      <div className="first-player-card">
        <div className="coin-flip">
          <span className={`coin ${suggested}`}>{suggested}</span>
        </div>
        <h2>Who Goes First?</h2>
        <p className="suggestion-text">
          We suggest <strong className={suggested}>{playerLabel}</strong> moves first!
        </p>
        <div className="first-player-actions">
          <button type="button" className="accept-btn" onClick={onAccept}>
            Let's Play!
          </button>
          <button type="button" className="reroll-btn" onClick={onReroll}>
            🎲 Pick Again
          </button>
        </div>
      </div>
    </div>
  );
}
