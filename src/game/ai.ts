import { applyMove, checkWinner, getAvailableMoves, opponent } from './logic';
import type { GameState, Move, Player } from './types';

function evaluateBoard(state: GameState, aiPlayer: Player): number {
  const { winner, config } = state;
  if (winner === aiPlayer) return 100;
  if (winner && winner !== 'draw') return -100;
  if (winner === 'draw') return 0;

  const size = state.config.size;
  const center = Math.floor(size / 2);
  let score = 0;

  for (const { row, col } of getAvailableMoves(state.board)) {
    const dist = Math.abs(row - center) + Math.abs(col - center);
    score += (size - dist) * 0.1;
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

  const moves = getAvailableMoves(state.board);
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
  const empty = getAvailableMoves(state.board).length;
  const { size } = state.config;

  if (size <= 3) return empty;
  if (size <= 4) return Math.min(empty, 8);
  if (size <= 5) return Math.min(empty, 5);
  return Math.min(empty, 4);
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

export function getComputerMove(state: GameState, aiPlayer: Player): Move {
  let moves = getAvailableMoves(state.board);
  if (moves.length === 0) return { row: 0, col: 0 };

  const { winLength, variant } = state.config;
  moves = filterLosingMoves(state, moves, aiPlayer);

  for (const move of moves) {
    const next = applyMove(state, move);
    const immediate = checkWinner(next.board, winLength, variant);
    if (immediate === aiPlayer) return move;
  }

  if (variant === 'standard') {
    for (const move of moves) {
      const testState = { ...state, currentPlayer: aiPlayer };
      const afterAi = applyMove(testState, move);
      const humanWin = getAvailableMoves(afterAi.board).some((m) => {
        const blocked = applyMove(afterAi, m);
        return checkWinner(blocked.board, winLength, variant) === state.currentPlayer;
      });
      if (humanWin) return move;
    }
  }

  const depth = getMaxDepth(state);
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

  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}
