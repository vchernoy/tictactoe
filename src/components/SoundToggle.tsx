interface SoundToggleProps {
  enabled: boolean;
  onToggle: () => void;
  compact?: boolean;
}

export function SoundToggle({ enabled, onToggle, compact = false }: SoundToggleProps) {
  return (
    <button
      type="button"
      className={`sound-toggle ${compact ? 'sound-toggle-compact' : ''}`}
      onClick={onToggle}
      aria-pressed={enabled}
      aria-label={enabled ? 'Sound on' : 'Sound off'}
      title={enabled ? 'Sound on' : 'Sound off'}
    >
      <span className="sound-toggle-icon" aria-hidden="true">
        {enabled ? '🔊' : '🔇'}
      </span>
      {!compact && (
        <span className="sound-toggle-label">{enabled ? 'Sound on' : 'Sound off'}</span>
      )}
    </button>
  );
}
