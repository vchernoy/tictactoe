export type Player = 'X' | 'O';
export type CellValue = Player | null;
export type Board = CellValue[][];
export type GameMode = 'pvp' | 'pvc';
export type GameStatus = 'setup' | 'playing' | 'finished';
export type AiDifficulty = 'easy' | 'medium' | 'hard';

export interface GameRules {
  misere: boolean;
  limited: boolean;
  liveMarkCount: number;
  gravity: boolean;
  /** Only meaningful when gravity && limited: pack columns after a mark expires. */
  compactOnExpire: boolean;
}

export type RulesPreset =
  | 'classic'
  | 'misere'
  | 'connect4'
  | 'connect4Limited'
  | 'limited'
  | 'chaos'
  | 'custom';

export interface GameConfig {
  size: number;
  mode: GameMode;
  winLength: number;
  rules: GameRules;
  aiDifficulty: AiDifficulty;
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
