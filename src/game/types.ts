export type Player = 'X' | 'O';
export type CellValue = Player | null;
export type Board = CellValue[][];
export type GameMode = 'pvp' | 'pvc';
export type GameVariant = 'standard' | 'misere' | 'limited' | 'gravity';
export type GameStatus = 'setup' | 'playing' | 'finished';
export type AiDifficulty = 'easy' | 'medium' | 'hard';

export interface GameConfig {
  size: number;
  mode: GameMode;
  winLength: number;
  variant: GameVariant;
  aiDifficulty: AiDifficulty;
  liveMarkCount?: number;
}

export interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player | 'draw' | null;
  winningCells: [number, number][];
  status: GameStatus;
  config: GameConfig;
  firstPlayer: Player;
  playerMoves: Record<Player, Move[]>;
  expiredCell: Move | null;
}

export interface Move {
  row: number;
  col: number;
}

/** Gravity mode: only column is chosen; row is computed on drop. */
export type GravityInput = { col: number };

export type MoveInput = Move | GravityInput;
