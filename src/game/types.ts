export type Player = 'X' | 'O';
export type CellValue = Player | null;
export type Board = CellValue[][];
export type GameMode = 'pvp' | 'pvc';
export type GameStatus = 'setup' | 'playing' | 'finished';

export interface GameConfig {
  size: number;
  mode: GameMode;
  winLength: number;
}

export interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player | 'draw' | null;
  winningCells: [number, number][];
  status: GameStatus;
  config: GameConfig;
  firstPlayer: Player;
}

export interface Move {
  row: number;
  col: number;
}
