import type { CellValue } from '../game/types';

interface CellProps {
  value: CellValue;
  row: number;
  col: number;
  isWinning: boolean;
  onClick: (row: number, col: number) => void;
  disabled: boolean;
  size: number;
}

export function Cell({ value, row, col, isWinning, onClick, disabled, size }: CellProps) {
  const fontSize = size <= 4 ? '2.5rem' : size <= 6 ? '1.8rem' : '1.2rem';

  return (
    <button
      type="button"
      className={`cell ${value ? `cell-${value.toLowerCase()}` : ''} ${isWinning ? 'cell-winning' : ''}`}
      onClick={() => onClick(row, col)}
      disabled={disabled || value !== null}
      aria-label={value ? `${value} at row ${row + 1}, column ${col + 1}` : `Empty cell at row ${row + 1}, column ${col + 1}`}
    >
      {value && (
        <span className="cell-mark" style={{ fontSize }}>
          {value}
        </span>
      )}
    </button>
  );
}
