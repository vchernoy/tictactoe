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

## GitHub Pages

The app is configured for [GitHub Pages](https://pages.github.com/) at **https://vchernoy.github.io/tictactoe/**.

Push to `main` (or run the **Deploy to GitHub Pages** workflow manually). The workflow in `.github/workflows/deploy.yml` builds with `npm ci` and `npm run build`, then publishes `dist/`.

The workflow uses `actions/configure-pages` with `enablement: true` to try to enable GitHub Pages automatically on first deploy. If deployment still fails with a Pages setup error, open **Settings → Pages** in the repo and set **Build and deployment → Source** to **GitHub Actions**, then re-run the workflow.

## Tech Stack

- React 19 + TypeScript
- Vite 8
- Pure CSS (no UI framework)
