import type { CellValue } from '../game/types';

interface CellProps {
  value: CellValue;
  row: number;
  col: number;
  isWinning: boolean;
  isExpiring?: boolean;
  isDropping?: boolean;
  compactRowDelta?: number;
  compactFallDelayMs?: number;
  isGravity?: boolean;
  isColumnHovered?: boolean;
  isColumnFull?: boolean;
  onClick: (row: number, col: number) => void;
  onColumnHover?: (col: number | null) => void;
  disabled: boolean;
  size: number;
}

export function Cell({
  value,
  row,
  col,
  isWinning,
  isExpiring,
  isDropping,
  compactRowDelta,
  compactFallDelayMs,
  isGravity,
  isColumnHovered,
  isColumnFull,
  onClick,
  onColumnHover,
  disabled,
  size,
}: CellProps) {
  const fontSize = size <= 4 ? '2.5rem' : size <= 6 ? '1.8rem' : '1.2rem';

  const handleClick = () => onClick(row, col);

  const handleMouseEnter = () => {
    if (isGravity && onColumnHover) onColumnHover(col);
  };

  const ariaLabel = isGravity
    ? value
      ? `${value} at row ${row + 1}, column ${col + 1}`
      : isColumnFull
        ? `Column ${col + 1} is full`
        : `Drop in column ${col + 1}`
    : value
      ? `${value} at row ${row + 1}, column ${col + 1}`
      : `Empty cell at row ${row + 1}, column ${col + 1}`;

  return (
    <button
      type="button"
      className={[
        'cell',
        value ? `cell-${value.toLowerCase()}` : '',
        isWinning ? 'cell-winning' : '',
        isExpiring ? 'cell-expiring' : '',
        isDropping ? 'cell-dropping' : '',
        compactRowDelta !== undefined ? 'cell-compact-falling' : '',
        isGravity ? 'cell-gravity' : '',
        isColumnHovered ? 'cell-column-hover' : '',
        isColumnFull ? 'cell-column-full' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {value && (
        <span
          className="cell-mark"
          style={{
            fontSize,
            ...(compactRowDelta !== undefined
              ? {
                  ['--compact-row-delta' as string]: String(compactRowDelta),
                  animationDelay:
                    compactFallDelayMs !== undefined ? `${compactFallDelayMs}ms` : undefined,
                }
              : {}),
          }}
        >
          {value}
        </span>
      )}
    </button>
  );
}
