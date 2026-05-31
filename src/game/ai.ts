import { applyMove, checkWinner, getAvailableMoves, opponent } from './logic';
import type { AiDifficulty, GameState, Move, Player } from './types';

function evaluateBoard(state: GameState, aiPlayer: Player): number {
  const { winner, config } = state;
  if (winner === aiPlayer) return 100;
  if (winner && winner !== 'draw') return -100;
  if (winner === 'draw') return 0;

  const size = state.config.size;
  const center = Math.floor(size / 2);
  let score = 0;

  const variant = state.config.variant;
  for (const { row, col } of getAvailableMoves(state.board, variant)) {
    if (variant === 'gravity') {
      score += (size - Math.abs(col - center)) * 0.15;
    } else {
      const dist = Math.abs(row - center) + Math.abs(col - center);
      score += (size - dist) * 0.1;
    }
  }

  return config.variant === 'misere' ? -score : score;
}

function minimax(
  state: GameState,
  aiPlayer: Player,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
): number {
  const result = checkWinner(state.board, state.config.winLength, state.config.variant);
  if (result !== null) {
    if (result === aiPlayer) return 100 + depth;
    if (result === 'draw') return 0;
    return -100 - depth;
  }

  if (depth === 0) return evaluateBoard(state, aiPlayer);

  const moves = getAvailableMoves(state.board, state.config.variant);
  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const next = applyMove(state, move);
      maxEval = Math.max(maxEval, minimax(next, aiPlayer, depth - 1, alpha, beta, false));
      alpha = Math.max(alpha, maxEval);
      if (beta <= alpha) break;
    }
    return maxEval;
  }

  let minEval = Infinity;
  for (const move of moves) {
    const next = applyMove(state, move);
    minEval = Math.min(minEval, minimax(next, aiPlayer, depth - 1, alpha, beta, true));
    beta = Math.min(beta, minEval);
    if (beta <= alpha) break;
  }
  return minEval;
}

function getMaxDepth(state: GameState): number {
  const empty = getAvailableMoves(state.board, state.config.variant).length;
  const { size } = state.config;

  if (size <= 3) return empty;
  if (size <= 4) return Math.min(empty, 8);
  if (size <= 5) return Math.min(empty, 5);
  return Math.min(empty, 4);
}

function getMediumDepth(state: GameState): number {
  const { size } = state.config;
  if (size <= 3) return 2;
  if (size <= 5) return 2;
  return 1;
}

function filterLosingMoves(state: GameState, moves: Move[], aiPlayer: Player): Move[] {
  const { winLength, variant } = state.config;
  if (variant !== 'misere') return moves;

  const safe = moves.filter((move) => {
    const next = applyMove(state, move);
    const result = checkWinner(next.board, winLength, variant);
    return result !== opponent(aiPlayer);
  });

  return safe.length > 0 ? safe : moves;
}

function prepareMoves(state: GameState, aiPlayer: Player): Move[] {
  let moves = getAvailableMoves(state.board, state.config.variant);
  if (moves.length === 0) return [];
  return filterLosingMoves(state, moves, aiPlayer);
}

function findWinningMove(state: GameState, moves: Move[], aiPlayer: Player): Move | null {
  const { winLength, variant } = state.config;
  for (const move of moves) {
    const next = applyMove({ ...state, currentPlayer: aiPlayer }, move);
    if (checkWinner(next.board, winLength, variant) === aiPlayer) return move;
  }
  return null;
}

function findBlockingMove(state: GameState, moves: Move[], aiPlayer: Player): Move | null {
  const { winLength, variant } = state.config;
  const human = opponent(aiPlayer);

  for (const move of getAvailableMoves(state.board, variant)) {
    const next = applyMove({ ...state, currentPlayer: human }, move);
    if (checkWinner(next.board, winLength, variant) === human && moves.some((m) => m.row === move.row && m.col === move.col)) {
      return move;
    }
  }
  return null;
}

function pickRandom(moves: Move[]): Move {
  return moves[Math.floor(Math.random() * moves.length)];
}

function positionalScore(state: GameState, move: Move): number {
  const size = state.config.size;
  const center = Math.floor(size / 2);
  const { row, col } = move;

  if (state.config.variant === 'gravity') {
    const colDist = Math.abs(col - center);
    if (colDist === 0) return 3;
    if (colDist === 1) return 2;
    return 1;
  }

  if (row === center && col === center) return 3;
  const onEdge = row === 0 || row === size - 1 || col === 0 || col === size - 1;
  const isCorner = onEdge && (row === 0 || row === size - 1) && (col === 0 || col === size - 1);
  if (isCorner) return 2;
  return 1;
}

function pickPositional(state: GameState, moves: Move[]): Move {
  let bestScore = -Infinity;
  let best: Move[] = [];

  for (const move of moves) {
    const score = positionalScore(state, move);
    if (score > bestScore) {
      bestScore = score;
      best = [move];
    } else if (score === bestScore) {
      best.push(move);
    }
  }

  return pickRandom(best);
}

function pickMinimaxMove(state: GameState, moves: Move[], aiPlayer: Player, depth: number): Move {
  const maximizing = state.currentPlayer === aiPlayer;
  let bestScore = -Infinity;
  let bestMoves: Move[] = [];

  for (const move of moves) {
    const next = applyMove(state, move);
    const score = minimax(next, aiPlayer, depth - 1, -Infinity, Infinity, !maximizing);

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }

  return pickRandom(bestMoves);
}

function fallbackMove(state: GameState): Move {
  const moves = getAvailableMoves(state.board, state.config.variant);
  return moves[0] ?? { row: 0, col: 0 };
}

function getComputerMoveEasy(state: GameState, aiPlayer: Player): Move {
  const moves = prepareMoves(state, aiPlayer);
  if (moves.length === 0) return fallbackMove(state);

  if (Math.random() < 0.3) {
    const win = findWinningMove(state, moves, aiPlayer);
    if (win) return win;
    const block = findBlockingMove(state, moves, aiPlayer);
    if (block) return block;
  }

  return pickRandom(moves);
}

function getComputerMoveMedium(state: GameState, aiPlayer: Player): Move {
  const moves = prepareMoves(state, aiPlayer);
  if (moves.length === 0) return fallbackMove(state);

  const win = findWinningMove(state, moves, aiPlayer);
  if (win) return win;

  const block = findBlockingMove(state, moves, aiPlayer);
  if (block) return block;

  const depth = getMediumDepth(state);
  if (depth > 0) {
    return pickMinimaxMove(state, moves, aiPlayer, depth);
  }

  return pickPositional(state, moves);
}

function getComputerMoveHard(state: GameState, aiPlayer: Player): Move {
  let moves = getAvailableMoves(state.board, state.config.variant);
  if (moves.length === 0) return fallbackMove(state);

  const { winLength, variant } = state.config;
  moves = filterLosingMoves(state, moves, aiPlayer);

  for (const move of moves) {
    const next = applyMove(state, move);
    const immediate = checkWinner(next.board, winLength, variant);
    if (immediate === aiPlayer) return move;
  }

  if (variant !== 'misere') {
    for (const move of moves) {
      const testState = { ...state, currentPlayer: aiPlayer };
      const afterAi = applyMove(testState, move);
      const humanWin = getAvailableMoves(afterAi.board, variant).some((m) => {
        const blocked = applyMove(afterAi, m);
        return checkWinner(blocked.board, winLength, variant) === state.currentPlayer;
      });
      if (humanWin) return move;
    }
  }

  const depth = getMaxDepth(state);
  return pickMinimaxMove(state, moves, aiPlayer, depth);
}

const MOVE_BY_DIFFICULTY: Record<
  AiDifficulty,
  (state: GameState, aiPlayer: Player) => Move
> = {
  easy: getComputerMoveEasy,
  medium: getComputerMoveMedium,
  hard: getComputerMoveHard,
};

export function getComputerMove(state: GameState, aiPlayer: Player): Move {
  const difficulty = state.config.aiDifficulty ?? 'hard';
  return MOVE_BY_DIFFICULTY[difficulty](state, aiPlayer);
}
