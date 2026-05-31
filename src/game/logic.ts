import type { Board, GameConfig, GameRules, GameState, Move, MoveInput, Player } from './types';

export function createEmptyBoard(size: number): Board {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

export function getWinLength(size: number): number {
  return Math.min(size, size <= 4 ? size : 4);
}

export function getLiveMarkMin(_size: number, winLength: number): number {
  return winLength;
}

export function getLiveMarkMax(size: number): number {
  return Math.ceil((size * size) / 2);
}

export function getDefaultLiveMarkCount(_size: number, winLength: number): number {
  return winLength;
}

export function clampLiveMarkCount(k: number, size: number, winLength: number): number {
  const minK = getLiveMarkMin(size, winLength);
  const maxK = getLiveMarkMax(size);
  return Math.min(Math.max(k, minK), maxK);
}

export function createGameState(config: GameConfig, firstPlayer: Player): GameState {
  const resolvedConfig = config.rules.limited
    ? {
        ...config,
        rules: {
          ...config.rules,
          liveMarkCount: clampLiveMarkCount(
            config.rules.liveMarkCount,
            config.size,
            config.winLength,
          ),
        },
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

export function getLowestEmptyRow(board: Board, col: number): number | null {
  const size = board.length;
  for (let r = size - 1; r >= 0; r--) {
    if (board[r][col] === null) return r;
  }
  return null;
}

export function isColumnFull(board: Board, col: number): boolean {
  return getLowestEmptyRow(board, col) === null;
}

/** Pack non-null cells to the bottom of each column (gravity-style). */
export function compactAllColumns(board: Board): Board {
  const size = board.length;
  const next = createEmptyBoard(size);
  for (let c = 0; c < size; c++) {
    const pieces = board.map((row) => row[c]).filter((cell) => cell !== null);
    const gap = size - pieces.length;
    for (let i = 0; i < pieces.length; i++) {
      next[gap + i][c] = pieces[i];
    }
  }
  return next;
}

function syncPlayerMovesAfterCompact(
  board: Board,
  playerMoves: Record<Player, Move[]>,
): Record<Player, Move[]> {
  const size = board.length;
  const updated: Record<Player, Move[]> = { X: [], O: [] };

  for (const player of ['X', 'O'] as const) {
    const colRows = new Map<number, number[]>();
    for (let c = 0; c < size; c++) {
      const rows: number[] = [];
      for (let r = size - 1; r >= 0; r--) {
        if (board[r][c] === player) rows.push(r);
      }
      colRows.set(c, rows);
    }

    const colIndex = new Map<number, number>();
    for (const move of playerMoves[player]) {
      const rows = colRows.get(move.col) ?? [];
      const idx = colIndex.get(move.col) ?? 0;
      updated[player].push({ row: rows[idx], col: move.col });
      colIndex.set(move.col, idx + 1);
    }
  }

  return updated;
}

export function getAvailableMoves(board: Board, rules: GameRules): Move[] {
  if (rules.gravity) {
    const moves: Move[] = [];
    const size = board.length;
    for (let c = 0; c < size; c++) {
      const row = getLowestEmptyRow(board, c);
      if (row !== null) moves.push({ row, col: c });
    }
    return moves;
  }

  const moves: Move[] = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] === null) moves.push({ row: r, col: c });
    }
  }
  return moves;
}

export function resolveMoveInput(state: GameState, input: MoveInput): Move | null {
  if (state.config.rules.gravity) {
    const col = input.col;
    const row = getLowestEmptyRow(state.board, col);
    if (row === null) return null;
    return { row, col };
  }

  if (!('row' in input)) return null;
  const { row, col } = input;
  if (state.board[row][col] !== null) return null;
  return { row, col };
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

export function checkWinner(
  board: Board,
  winLength: number,
  rules: GameRules,
): Player | 'draw' | null {
  const winningCells = findWinningCells(board, winLength);
  if (winningCells.length > 0) {
    const [r, c] = winningCells[0];
    const linePlayer = board[r][c] as Player;
    return rules.misere ? opponent(linePlayer) : linePlayer;
  }
  if (getAvailableMoves(board, rules).length === 0) return 'draw';
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

export function applyMove(state: GameState, input: MoveInput): GameState {
  if (state.status !== 'playing') return state;

  const move = resolveMoveInput(state, input);
  if (!move) return state;

  const player = state.currentPlayer;
  let board = state.board.map((row, r) =>
    row.map((cell, c) => (r === move.row && c === move.col ? player : cell)),
  );

  let playerMoves = state.playerMoves;
  let expiredCell: Move | null = null;

  if (state.config.rules.limited) {
    const liveMarkCount = state.config.rules.liveMarkCount;

    const immediateWinner = checkWinner(board, state.config.winLength, state.config.rules);
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

    const { gravity, compactOnExpire } = state.config.rules;
    if (expiredCell && gravity && compactOnExpire) {
      board = compactAllColumns(board);
      playerMoves = syncPlayerMovesAfterCompact(board, playerMoves);
    }
  }

  const winner = checkWinner(board, state.config.winLength, state.config.rules);
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
