# Tic Tac Toe

A beautiful web-based Tic Tac Toe game built with React and Vite.

## Features

- **Two game modes**: Human vs Human (local) and Human vs Computer (AI)
- **Flexible board sizes**: 3×3 through 8×8
- **First player suggestion**: Random coin flip with re-roll option
- **Smart AI**: Minimax with alpha-beta pruning (perfect on 3×3, heuristic on larger boards)
- **Win detection**: N-in-a-row for small boards, 4-in-a-row for boards 5×5 and up

## How to Run

```bash
# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`) in your browser.

## Production Build

```bash
npm run build
npm run preview
```

## Tech Stack

- React 19 + TypeScript
- Vite 8
- Pure CSS (no UI framework)
