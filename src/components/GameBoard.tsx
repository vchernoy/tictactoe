import { Cell } from './Cell';
import type { Board } from '../game/types';

interface BoardProps {
  board: Board;
  winningCells: [number, number][];
  onCellClick: (row: number, col: number) => void;
  disabled: boolean;
}

function isWinningCell(winningCells: [number, number][], row: number, col: number): boolean {
  return winningCells.some(([r, c]) => r === row && c === col);
}

export function GameBoard({ board, winningCells, onCellClick, disabled }: BoardProps) {
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
            onClick={onCellClick}
            disabled={disabled}
            size={size}
          />
        )),
      )}
    </div>
  );
}
