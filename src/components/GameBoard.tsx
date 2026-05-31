import { useState } from 'react';
import { isColumnFull } from '../game/logic';
import { Cell } from './Cell';
import type { Board, Move } from '../game/types';

interface BoardProps {
  board: Board;
  gravity: boolean;
  winningCells: [number, number][];
  expiredCell: Move | null;
  droppedCell: Move | null;
  onCellClick: (row: number, col: number) => void;
  disabled: boolean;
}

function isWinningCell(winningCells: [number, number][], row: number, col: number): boolean {
  return winningCells.some(([r, c]) => r === row && c === col);
}

function isExpiredCell(expiredCell: Move | null, row: number, col: number): boolean {
  return expiredCell?.row === row && expiredCell?.col === col;
}

function isDroppedCell(droppedCell: Move | null, row: number, col: number): boolean {
  return droppedCell?.row === row && droppedCell?.col === col;
}

export function GameBoard({
  board,
  gravity,
  winningCells,
  expiredCell,
  droppedCell,
  onCellClick,
  disabled,
}: BoardProps) {
  const size = board.length;
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  return (
    <div
      className={`board ${gravity ? 'board-gravity' : ''}`}
      style={{
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gridTemplateRows: `repeat(${size}, 1fr)`,
      }}
      onMouseLeave={() => setHoveredCol(null)}
    >
      {board.map((row, r) =>
        row.map((cell, c) => {
          const columnFull = gravity && isColumnFull(board, c);
          const columnHovered = gravity && hoveredCol === c && !columnFull;
          const cellDisabled =
            disabled || (gravity ? columnFull : cell !== null);

          return (
            <Cell
              key={`${r}-${c}`}
              value={cell}
              row={r}
              col={c}
              isWinning={isWinningCell(winningCells, r, c)}
              isExpiring={isExpiredCell(expiredCell, r, c)}
              isDropping={isDroppedCell(droppedCell, r, c)}
              isGravity={gravity}
              isColumnHovered={columnHovered}
              isColumnFull={columnFull}
              onClick={onCellClick}
              onColumnHover={setHoveredCol}
              disabled={cellDisabled}
              size={size}
            />
          );
        }),
      )}
    </div>
  );
}
