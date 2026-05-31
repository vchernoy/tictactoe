import { Cell } from './Cell';
import type { Board, Move } from '../game/types';

interface BoardProps {
  board: Board;
  winningCells: [number, number][];
  expiredCell: Move | null;
  onCellClick: (row: number, col: number) => void;
  disabled: boolean;
}

function isWinningCell(winningCells: [number, number][], row: number, col: number): boolean {
  return winningCells.some(([r, c]) => r === row && c === col);
}

function isExpiredCell(expiredCell: Move | null, row: number, col: number): boolean {
  return expiredCell?.row === row && expiredCell?.col === col;
}

export function GameBoard({ board, winningCells, expiredCell, onCellClick, disabled }: BoardProps) {
  const size = board.length;

  return (
    <div
      className="board"
      style={{
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gridTemplateRows: `repeat(${size}, 1fr)`,
      }}
    >
      {board.map((row, r) =>
        row.map((cell, c) => (
          <Cell
            key={`${r}-${c}`}
            value={cell}
            row={r}
            col={c}
            isWinning={isWinningCell(winningCells, r, c)}
            isExpiring={isExpiredCell(expiredCell, r, c)}
            onClick={onCellClick}
            disabled={disabled}
            size={size}
          />
        )),
      )}
    </div>
  );
}
