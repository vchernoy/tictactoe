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

The app is configured for [GitHub Pages](https://pages.github.com/) project-site URLs:

- **https://vchernoy.github.io/tictactoe/**
- **https://vchernoy.xyz/tictactoe/** (custom domain; same deployment as above)

`vite.config.ts` sets `base: '/tictactoe/'` so asset paths work on both hosts.

### Deploy

Push to `main` (or run **Deploy to GitHub Pages** manually). The workflow runs `npm ci`, `npm run build`, uploads `dist/`, and deploys via GitHub Actions.

### One-time Pages setting (required)

In **github.com/vchernoy/tictactoe → Settings → Pages → Build and deployment → Source**, choose **GitHub Actions** (not “Deploy from a branch”).

If the live site shows `<script type="module" src="/src/main.tsx">`, Pages is still serving the **main** branch (via the built-in `pages-build-deployment` Jekyll workflow) instead of the workflow artifact. In **Settings → Pages → Source**, choose **GitHub Actions** (not “Deploy from a branch → main”), then re-run **Deploy to GitHub Pages**. The deploy workflow verifies both URLs after each release.

## Tech Stack

- React 19 + TypeScript
- Vite 8
- Pure CSS (no UI framework)
