import { useCallback, useEffect, useState } from 'react';
import { FirstPlayerSuggestion } from './components/FirstPlayerSuggestion';
import { GameBoard } from './components/GameBoard';
import { GameSetup } from './components/GameSetup';
import { getComputerMove } from './game/ai';
import {
  applyMove,
  createGameState,
  getWinLength,
  suggestFirstPlayer,
} from './game/logic';
import type { GameConfig, GameMode, GameState, Player } from './game/types';
import './App.css';

type AppPhase = 'setup' | 'first-player' | 'playing';

function getStatusMessage(state: GameState, mode: GameMode): string {
  if (state.winner === 'draw') return "It's a draw!";
  if (state.winner) {
    if (mode === 'pvp') {
      return state.winner === 'X' ? 'Player 1 (X) wins!' : 'Player 2 (O) wins!';
    }
    const humanWon =
      (state.winner === 'X' && state.firstPlayer === 'X') ||
      (state.winner === 'O' && state.firstPlayer === 'O');
    return humanWon ? 'You win! 🎉' : 'Computer wins!';
  }

  if (mode === 'pvp') {
    return state.currentPlayer === 'X' ? "Player 1's turn (X)" : "Player 2's turn (O)";
  }

  const isHumanTurn =
    (state.currentPlayer === 'X' && state.firstPlayer === 'X') ||
    (state.currentPlayer === 'O' && state.firstPlayer === 'O');

  return isHumanTurn ? 'Your turn' : 'Computer is thinking...';
}

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('setup');
  const [size, setSize] = useState(3);
  const [mode, setMode] = useState<GameMode>('pvp');
  const [suggestedFirst, setSuggestedFirst] = useState<Player>('X');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const handleStart = useCallback(() => {
    setSuggestedFirst(suggestFirstPlayer());
    setPhase('first-player');
  }, []);

  const handleAcceptFirst = useCallback(() => {
    const config: GameConfig = {
      size,
      mode,
      winLength: getWinLength(size),
    };
    setGameState(createGameState(config, suggestedFirst));
    setPhase('playing');
  }, [size, mode, suggestedFirst]);

  const handleReroll = useCallback(() => {
    setSuggestedFirst(suggestFirstPlayer());
  }, []);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (!gameState || gameState.status !== 'playing' || isAiThinking) return;

      const isHumanTurn =
        mode === 'pvp' ||
        (gameState.currentPlayer === 'X' && gameState.firstPlayer === 'X') ||
        (gameState.currentPlayer === 'O' && gameState.firstPlayer === 'O');

      if (!isHumanTurn) return;

      const next = applyMove(gameState, { row, col });
      setGameState(next);
    },
    [gameState, mode, isAiThinking],
  );

  useEffect(() => {
    if (!gameState || gameState.status !== 'playing' || mode !== 'pvc') return;

    const isComputerTurn =
      (gameState.currentPlayer === 'X' && gameState.firstPlayer !== 'X') ||
      (gameState.currentPlayer === 'O' && gameState.firstPlayer !== 'O');

    if (!isComputerTurn) return;

    setIsAiThinking(true);
    const timer = setTimeout(() => {
      const aiPlayer = gameState.currentPlayer;
      const move = getComputerMove(gameState, aiPlayer);
      setGameState((prev) => (prev ? applyMove(prev, move) : prev));
      setIsAiThinking(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [gameState, mode]);

  const handleNewGame = () => {
    setGameState(null);
    setPhase('setup');
  };

  const handleRematch = () => {
    setSuggestedFirst(suggestFirstPlayer());
    setPhase('first-player');
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-x">X</span>
          <span className="logo-o">O</span>
        </div>
        <h1>Tic Tac Toe</h1>
        <p className="tagline">Classic strategy, any size board</p>
      </header>

      <main className="main">
        {phase === 'setup' && (
          <GameSetup
            size={size}
            mode={mode}
            onSizeChange={setSize}
            onModeChange={setMode}
            onStart={handleStart}
          />
        )}

        {phase === 'first-player' && (
          <FirstPlayerSuggestion
            suggested={suggestedFirst}
            mode={mode}
            onAccept={handleAcceptFirst}
            onReroll={handleReroll}
          />
        )}

        {phase === 'playing' && gameState && (
          <div className="game-area">
            <div className="game-info">
              <div className="board-meta">
                <span className="meta-badge">{gameState.config.size}×{gameState.config.size}</span>
                <span className="meta-badge">{mode === 'pvp' ? '2 Players' : 'vs AI'}</span>
              </div>
              <p className={`status ${gameState.winner ? 'status-finished' : ''} ${isAiThinking ? 'status-thinking' : ''}`}>
                {getStatusMessage(gameState, mode)}
              </p>
              <div className="turn-indicator">
                {!gameState.winner && (
                  <>
                    <span className={`turn-mark ${gameState.currentPlayer === 'X' ? 'active' : ''}`}>X</span>
                    <span className="turn-divider">|</span>
                    <span className={`turn-mark ${gameState.currentPlayer === 'O' ? 'active' : ''}`}>O</span>
                  </>
                )}
              </div>
            </div>

            <GameBoard
              board={gameState.board}
              winningCells={gameState.winningCells}
              onCellClick={handleCellClick}
              disabled={gameState.status === 'finished' || isAiThinking}
            />

            <div className="game-actions">
              {gameState.status === 'finished' ? (
                <>
                  <button type="button" className="action-btn primary" onClick={handleRematch}>
                    Play Again
                  </button>
                  <button type="button" className="action-btn secondary" onClick={handleNewGame}>
                    New Setup
                  </button>
                </>
              ) : (
                <button type="button" className="action-btn secondary" onClick={handleNewGame}>
                  Quit Game
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Built with React + Vite</p>
      </footer>
    </div>
  );
}
