import { useCallback, useEffect, useState } from 'react';
import { FirstPlayerSuggestion } from './components/FirstPlayerSuggestion';
import { GameBoard } from './components/GameBoard';
import { GameSetup } from './components/GameSetup';
import { getComputerMove } from './game/ai';
import {
  applyMove,
  createGameState,
  getDefaultLiveMarkCount,
  getLiveMarkCap,
  getWinLength,
  suggestFirstPlayer,
} from './game/logic';
import type { AiDifficulty, GameConfig, GameMode, GameState, GameVariant, Player } from './game/types';
import './App.css';

type AppPhase = 'setup' | 'first-player' | 'playing';

function getLosingPlayer(state: GameState): Player | null {
  if (!state.winningCells.length || state.winner === 'draw' || !state.winner) return null;
  const [r, c] = state.winningCells[0];
  const linePlayer = state.board[r][c];
  return linePlayer === state.winner ? null : (linePlayer as Player);
}

function getStatusMessage(state: GameState, mode: GameMode): string {
  const isMisere = state.config.variant === 'misere';
  const loser = isMisere ? getLosingPlayer(state) : null;

  if (state.winner === 'draw') {
    return isMisere ? "It's a draw! No one completed a line." : "It's a draw!";
  }

  if (state.winner) {
    if (mode === 'pvp') {
      const winnerLabel = state.winner === 'X' ? 'Player 1 (X)' : 'Player 2 (O)';
      if (isMisere && loser) {
        const loserLabel = loser === 'X' ? 'Player 1 (X)' : 'Player 2 (O)';
        return `${winnerLabel} wins! ${loserLabel} completed the losing line.`;
      }
      return `${winnerLabel} wins!`;
    }

    const humanWon =
      (state.winner === 'X' && state.firstPlayer === 'X') ||
      (state.winner === 'O' && state.firstPlayer === 'O');

    if (isMisere) {
      if (humanWon) {
        return loser
          ? 'You win! The computer completed the losing line.'
          : 'You win! 🎉';
      }
      return loser
        ? 'Computer wins! You completed the losing line.'
        : 'Computer wins!';
    }

    return humanWon ? 'You win! 🎉' : 'Computer wins!';
  }

  if (mode === 'pvp') {
    const turn = state.currentPlayer === 'X' ? "Player 1's turn (X)" : "Player 2's turn (O)";
    return isMisere ? `${turn} — avoid completing a line` : turn;
  }

  const isHumanTurn =
    (state.currentPlayer === 'X' && state.firstPlayer === 'X') ||
    (state.currentPlayer === 'O' && state.firstPlayer === 'O');

  if (isMisere) {
    return isHumanTurn ? 'Your turn — avoid completing a line' : 'Computer is thinking...';
  }

  return isHumanTurn ? 'Your turn' : 'Computer is thinking...';
}

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('setup');
  const [size, setSize] = useState(3);
  const [mode, setMode] = useState<GameMode>('pvp');
  const [variant, setVariant] = useState<GameVariant>('standard');
  const [liveMarkCount, setLiveMarkCount] = useState(getDefaultLiveMarkCount(3));
  const [aiDifficulty, setAiDifficulty] = useState<AiDifficulty>('medium');
  const [suggestedFirst, setSuggestedFirst] = useState<Player>('X');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const handleSizeChange = useCallback((newSize: number) => {
    setSize(newSize);
    const cap = getLiveMarkCap(newSize, getWinLength(newSize));
    setLiveMarkCount(Math.min(getDefaultLiveMarkCount(newSize), cap));
  }, []);

  const handleVariantChange = useCallback((newVariant: GameVariant) => {
    setVariant(newVariant);
    if (newVariant === 'limited') {
      const cap = getLiveMarkCap(size, getWinLength(size));
      setLiveMarkCount(Math.min(getDefaultLiveMarkCount(size), cap));
    }
  }, [size]);

  const handleLiveMarkCountChange = useCallback((count: number) => {
    setLiveMarkCount(count);
  }, []);

  const handleStart = useCallback(() => {
    setSuggestedFirst(suggestFirstPlayer());
    setPhase('first-player');
  }, []);

  const handleAcceptFirst = useCallback(() => {
    const config: GameConfig = {
      size,
      mode,
      winLength: getWinLength(size),
      variant,
      aiDifficulty: mode === 'pvc' ? aiDifficulty : 'medium',
      ...(variant === 'limited' ? { liveMarkCount } : {}),
    };
    setGameState(createGameState(config, suggestedFirst));
    setPhase('playing');
  }, [size, mode, variant, aiDifficulty, liveMarkCount, suggestedFirst]);

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
    if (!gameState?.expiredCell) return;
    const timer = setTimeout(() => {
      setGameState((prev) => (prev ? { ...prev, expiredCell: null } : prev));
    }, 450);
    return () => clearTimeout(timer);
  }, [gameState?.expiredCell]);

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
            variant={variant}
            aiDifficulty={aiDifficulty}
            liveMarkCount={liveMarkCount}
            onSizeChange={handleSizeChange}
            onModeChange={setMode}
            onVariantChange={handleVariantChange}
            onLiveMarkCountChange={handleLiveMarkCountChange}
            onAiDifficultyChange={setAiDifficulty}
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
                {mode === 'pvc' && (
                  <span className="meta-badge difficulty">
                    {gameState.config.aiDifficulty === 'easy'
                      ? 'Easy'
                      : gameState.config.aiDifficulty === 'medium'
                        ? 'Medium'
                        : 'Hard'}
                  </span>
                )}
                {gameState.config.variant === 'misere' && (
                  <span className="meta-badge misere">Misère</span>
                )}
                {gameState.config.variant === 'limited' && (
                  <span className="meta-badge limited">
                    Limited · K={gameState.config.liveMarkCount ?? getDefaultLiveMarkCount(gameState.config.size)}
                  </span>
                )}
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
              expiredCell={gameState.expiredCell}
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
