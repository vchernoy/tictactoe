import type { Board, GameConfig, GameState, Move, Player } from './types';

export function createEmptyBoard(size: number): Board {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

export function getWinLength(size: number): number {
  return Math.min(size, size <= 4 ? size : 4);
}

export function createGameState(config: GameConfig, firstPlayer: Player): GameState {
  return {
    board: createEmptyBoard(config.size),
    currentPlayer: firstPlayer,
    winner: null,
    winningCells: [],
    status: 'playing',
    config,
    firstPlayer,
  };
}

export function getAvailableMoves(board: Board): Move[] {
  const moves: Move[] = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] === null) moves.push({ row: r, col: c });
    }
  }
  return moves;
}

export function findWinningCells(board: Board, winLength: number): [number, number][] {
  const size = board.length;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - winLength; c++) {
      const line = board[r].slice(c, c + winLength);
      if (line.every((cell) => cell !== null && cell === line[0])) {
        return Array.from({ length: winLength }, (_, i) => [r, c + i] as [number, number]);
      }
    }
  }

  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - winLength; r++) {
      const line = board.slice(r, r + winLength).map((row) => row[c]);
      if (line.every((cell) => cell !== null && cell === line[0])) {
        return Array.from({ length: winLength }, (_, i) => [r + i, c] as [number, number]);
      }
    }
  }

  for (let r = 0; r <= size - winLength; r++) {
    for (let c = 0; c <= size - winLength; c++) {
      const line = Array.from({ length: winLength }, (_, i) => board[r + i][c + i]);
      if (line.every((cell) => cell !== null && cell === line[0])) {
        return Array.from({ length: winLength }, (_, i) => [r + i, c + i] as [number, number]);
      }
    }
  }

  for (let r = 0; r <= size - winLength; r++) {
    for (let c = winLength - 1; c < size; c++) {
      const line = Array.from({ length: winLength }, (_, i) => board[r + i][c - i]);
      if (line.every((cell) => cell !== null && cell === line[0])) {
        return Array.from({ length: winLength }, (_, i) => [r + i, c - i] as [number, number]);
      }
    }
  }

  return [];
}

export function checkWinner(board: Board, winLength: number): Player | 'draw' | null {
  const winningCells = findWinningCells(board, winLength);
  if (winningCells.length > 0) {
    const [r, c] = winningCells[0];
    return board[r][c] as Player;
  }
  if (getAvailableMoves(board).length === 0) return 'draw';
  return null;
}

export function applyMove(state: GameState, move: Move): GameState {
  if (state.status !== 'playing') return state;
  if (state.board[move.row][move.col] !== null) return state;

  const board = state.board.map((row, r) =>
    row.map((cell, c) => (r === move.row && c === move.col ? state.currentPlayer : cell)),
  );

  const winner = checkWinner(board, state.config.winLength);
  const winningCells = winner && winner !== 'draw' ? findWinningCells(board, state.config.winLength) : [];

  return {
    ...state,
    board,
    currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
    winner,
    winningCells,
    status: winner ? 'finished' : 'playing',
  };
}

export function suggestFirstPlayer(): Player {
  return Math.random() < 0.5 ? 'X' : 'O';
}

export function opponent(player: Player): Player {
  return player === 'X' ? 'O' : 'X';
}
