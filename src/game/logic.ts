import type { Board, GameConfig, GameState, GameVariant, Move, Player } from './types';

export function createEmptyBoard(size: number): Board {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

export function getWinLength(size: number): number {
  return Math.min(size, size <= 4 ? size : 4);
}

export function getDefaultLiveMarkCount(size: number): number {
  if (size <= 3) return 2;
  if (size <= 4) return 3;
  return 4;
}

export function getLiveMarkCap(size: number, winLength: number): number {
  return Math.min(size - 1, winLength, 5);
}

export function createGameState(config: GameConfig, firstPlayer: Player): GameState {
  const resolvedConfig =
    config.variant === 'limited'
      ? {
          ...config,
          liveMarkCount: config.liveMarkCount ?? getDefaultLiveMarkCount(config.size),
        }
      : config;

  return {
    board: createEmptyBoard(resolvedConfig.size),
    currentPlayer: firstPlayer,
    winner: null,
    winningCells: [],
    status: 'playing',
    config: resolvedConfig,
    firstPlayer,
    playerMoves: { X: [], O: [] },
    expiredCell: null,
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

function effectiveVariant(variant: GameVariant): 'standard' | 'misere' {
  return variant === 'misere' ? 'misere' : 'standard';
}

export function checkWinner(
  board: Board,
  winLength: number,
  variant: GameVariant = 'standard',
): Player | 'draw' | null {
  const winningCells = findWinningCells(board, winLength);
  if (winningCells.length > 0) {
    const [r, c] = winningCells[0];
    const linePlayer = board[r][c] as Player;
    return effectiveVariant(variant) === 'misere' ? opponent(linePlayer) : linePlayer;
  }
  if (getAvailableMoves(board).length === 0) return 'draw';
  return null;
}

function applyLimitedExpiration(
  board: Board,
  player: Player,
  playerMoves: Record<Player, Move[]>,
  move: Move,
  liveMarkCount: number,
): { board: Board; playerMoves: Record<Player, Move[]>; expiredCell: Move | null } {
  const nextMoves = [...playerMoves[player], move];
  let expiredCell: Move | null = null;
  let updatedBoard = board;

  if (nextMoves.length > liveMarkCount) {
    const oldest = nextMoves[0];
    updatedBoard = board.map((row, r) =>
      row.map((cell, c) => (r === oldest.row && c === oldest.col ? null : cell)),
    );
    expiredCell = oldest;
    nextMoves.shift();
  }

  return {
    board: updatedBoard,
    playerMoves: { ...playerMoves, [player]: nextMoves },
    expiredCell,
  };
}

export function applyMove(state: GameState, move: Move): GameState {
  if (state.status !== 'playing') return state;
  if (state.board[move.row][move.col] !== null) return state;

  const player = state.currentPlayer;
  let board = state.board.map((row, r) =>
    row.map((cell, c) => (r === move.row && c === move.col ? player : cell)),
  );

  let playerMoves = state.playerMoves;
  let expiredCell: Move | null = null;

  if (state.config.variant === 'limited') {
    const liveMarkCount =
      state.config.liveMarkCount ?? getDefaultLiveMarkCount(state.config.size);

    const immediateWinner = checkWinner(board, state.config.winLength, state.config.variant);
    if (immediateWinner) {
      const nextMoves = [...playerMoves[player], move];
      const winningCells =
        immediateWinner !== 'draw' ? findWinningCells(board, state.config.winLength) : [];
      return {
        ...state,
        board,
        playerMoves: { ...playerMoves, [player]: nextMoves },
        expiredCell: null,
        currentPlayer: player === 'X' ? 'O' : 'X',
        winner: immediateWinner,
        winningCells,
        status: 'finished',
      };
    }

    const result = applyLimitedExpiration(board, player, playerMoves, move, liveMarkCount);
    board = result.board;
    playerMoves = result.playerMoves;
    expiredCell = result.expiredCell;
  }

  const winner = checkWinner(board, state.config.winLength, state.config.variant);
  const winningCells = winner && winner !== 'draw' ? findWinningCells(board, state.config.winLength) : [];

  return {
    ...state,
    board,
    playerMoves,
    expiredCell,
    currentPlayer: player === 'X' ? 'O' : 'X',
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
