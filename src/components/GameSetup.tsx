import {
  getLiveMarkMax,
  getLiveMarkMin,
  getWinLength,
} from '../game/logic';
import { createRulesFromPreset, detectPreset } from '../game/rules';
import type { AiDifficulty, GameMode, GameRules, RulesPreset } from '../game/types';
import { THEMES, type ThemeId } from '../themes';
import { SoundToggle } from './SoundToggle';

interface GameSetupProps {
  size: number;
  mode: GameMode;
  rules: GameRules;
  aiDifficulty: AiDifficulty;
  theme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  onSizeChange: (size: number) => void;
  onModeChange: (mode: GameMode) => void;
  onRulesChange: (rules: GameRules) => void;
  onAiDifficultyChange: (difficulty: AiDifficulty) => void;
  onStart: () => void;
}

const PRESETS: { id: Exclude<RulesPreset, 'custom'>; name: string; desc: string }[] = [
  { id: 'classic', name: 'Classic', desc: 'Standard N in a row' },
  { id: 'misere', name: 'Misère', desc: 'Line completes = lose' },
  { id: 'connect4', name: 'Connect-4', desc: 'Drop into columns' },
  { id: 'limited', name: 'Limited', desc: 'K live marks each' },
  { id: 'chaos', name: 'Chaos', desc: 'Misère + min K' },
];

const RULE_TOGGLES: { key: keyof Pick<GameRules, 'misere' | 'limited' | 'gravity'>; name: string; desc: string }[] = [
  { key: 'misere', name: 'Misère', desc: 'Completing a line loses' },
  { key: 'limited', name: 'Limited moves', desc: 'Only K marks on board' },
  { key: 'gravity', name: 'Gravity', desc: 'Drop into columns' },
];

const DIFFICULTIES: { id: AiDifficulty; name: string; desc: string }[] = [
  { id: 'easy', name: 'Easy', desc: 'Mostly random, sometimes clever' },
  { id: 'medium', name: 'Medium', desc: 'Blocks and wins, good openings' },
  { id: 'hard', name: 'Hard', desc: 'Full minimax — very tough' },
];

const SIZES = [3, 4, 5, 6, 7, 8];

interface LiveMarkStepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

function LiveMarkStepper({ value, min, max, onChange }: LiveMarkStepperProps) {
  return (
    <div className="live-mark-stepper">
      <button
        type="button"
        className="live-mark-stepper-btn"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Decrease live mark count"
      >
        −
      </button>
      <div className="live-mark-stepper-value-wrap">
        <span className="live-mark-stepper-value" aria-live="polite">
          {value}
        </span>
        <span className="live-mark-stepper-range">
          {min} – {max}
        </span>
      </div>
      <button
        type="button"
        className="live-mark-stepper-btn"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase live mark count"
      >
        +
      </button>
    </div>
  );
}

function getWinHint(size: number, rules: GameRules): string {
  const n = size <= 4 ? size : 4;
  const winPart =
    size <= 4 ? `Win by getting ${n} in a row` : `Win by getting 4 in a row on a ${size}×${size} board`;

  if (rules.misere) {
    return `Avoid ${n} in a row — whoever completes a line loses`;
  }
  if (rules.limited) {
    return `${winPart} — marks expire after K moves`;
  }
  if (rules.gravity) {
    return `Drop marks into columns — ${n} in a row wins`;
  }
  return winPart;
}

function getRulesHint(rules: GameRules): string {
  const parts: string[] = [];

  if (rules.misere) {
    parts.push('Misère: the player who completes N in a row loses.');
  }
  if (rules.limited) {
    parts.push('Limited: each player keeps only their last K marks (win-before-expire applies).');
  }
  if (rules.gravity) {
    parts.push('Gravity: pick a column — your mark drops to the bottom.');
  }
  if (rules.limited && rules.gravity) {
    parts.push('When a mark expires in gravity mode, the cell empties without re-dropping marks above.');
  }

  if (parts.length === 0) {
    return 'Classic: first player to get N in a row wins.';
  }
  return parts.join(' ');
}

export function GameSetup({
  size,
  mode,
  rules,
  theme,
  onThemeChange,
  soundEnabled,
  onSoundToggle,
  onSizeChange,
  onModeChange,
  onRulesChange,
  aiDifficulty,
  onAiDifficultyChange,
  onStart,
}: GameSetupProps) {
  const winLength = getWinLength(size);
  const minK = getLiveMarkMin(size, winLength);
  const maxK = getLiveMarkMax(size);
  const activePreset = detectPreset(rules, size, winLength);

  const handlePresetSelect = (preset: Exclude<RulesPreset, 'custom'>) => {
    onRulesChange(createRulesFromPreset(preset, size, winLength));
  };

  const handleToggle = (key: 'misere' | 'limited' | 'gravity') => {
    const next = { ...rules, [key]: !rules[key] };
    if (key === 'limited' && next.limited && !rules.limited) {
      next.liveMarkCount = winLength;
    }
    onRulesChange(next);
  };

  const handleLiveMarkCountChange = (count: number) => {
    onRulesChange({ ...rules, liveMarkCount: count });
  };

  return (
    <div className="setup-panel">
      <h2 className="setup-title">Choose Your Game</h2>

      <div className="setup-section">
        <label className="setup-label">Theme</label>
        <div className="theme-grid">
          {THEMES.map(({ id, name, swatchBg, swatchX, swatchO }) => (
            <button
              key={id}
              type="button"
              className={`theme-btn ${theme === id ? 'active' : ''}`}
              onClick={() => onThemeChange(id)}
              aria-pressed={theme === id}
            >
              <div className="theme-swatch" aria-hidden="true">
                <span className="theme-swatch-bg" style={{ background: swatchBg }} />
                <span className="theme-swatch-x" style={{ background: swatchX, color: swatchBg }}>X</span>
                <span className="theme-swatch-o" style={{ background: swatchO, color: swatchBg }}>O</span>
              </div>
              <span className="theme-name">{name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="setup-section setup-section-row">
        <label className="setup-label">Sound</label>
        <SoundToggle enabled={soundEnabled} onToggle={onSoundToggle} />
      </div>

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

        <div className="preset-toggle">
          {PRESETS.map(({ id, name, desc }) => (
            <button
              key={id}
              type="button"
              className={`preset-btn ${activePreset === id ? 'active' : ''}`}
              onClick={() => handlePresetSelect(id)}
            >
              <span className="preset-name">{name}</span>
              <span className="preset-desc">{desc}</span>
            </button>
          ))}
          {activePreset === 'custom' && (
            <div className="preset-custom-label" aria-live="polite">
              <span className="preset-name">Custom</span>
              <span className="preset-desc">Mix your own rules</span>
            </div>
          )}
        </div>

        <div className="rule-toggles">
          {RULE_TOGGLES.map(({ key, name, desc }) => (
            <button
              key={key}
              type="button"
              className={`rule-toggle ${rules[key] ? 'active' : ''}`}
              onClick={() => handleToggle(key)}
              aria-pressed={rules[key]}
            >
              <span className="rule-toggle-check" aria-hidden="true">{rules[key] ? '✓' : ''}</span>
              <span className="rule-toggle-text">
                <span className="rule-toggle-name">{name}</span>
                <span className="rule-toggle-desc">{desc}</span>
              </span>
            </button>
          ))}
        </div>

        <p className="setup-hint variant-hint">{getRulesHint(rules)}</p>
      </div>

      {rules.limited && (
        <div className="setup-section">
          <label className="setup-label">Live Mark Count (K)</label>
          <LiveMarkStepper
            value={rules.liveMarkCount}
            min={minK}
            max={maxK}
            onChange={handleLiveMarkCountChange}
          />
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
        <p className="setup-hint">{getWinHint(size, rules)}</p>
      </div>

      <button type="button" className="start-btn" onClick={onStart}>
        Start Game
      </button>
    </div>
  );
}
