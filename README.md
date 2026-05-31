# Tic Tac Toe

A web-based Tic Tac Toe game with multiple rules, board sizes, themes, and AI difficulty levels. Built with React and Vite.

**Play live:** [vchernoy.github.io/tictactoe](https://vchernoy.github.io/tictactoe/) · [vchernoy.xyz/tictactoe](https://vchernoy.xyz/tictactoe/)

## Features

### Game modes
- **Human vs Human** — local two-player on one device
- **Human vs Computer** — play against the AI

### Composable rules
Rules combine via independent toggles (or quick presets):

| Preset | Misère | Limited | Gravity |
|--------|--------|---------|---------|
| Classic | — | — | — |
| Misère | ✓ | — | — |
| Connect-4 | — | — | ✓ |
| Limited | — | ✓ (K = win length) | — |
| Chaos | ✓ | ✓ (min K) | — |

- **Misère** — completing a line loses (opponent wins)
- **Limited moves** — each player keeps only their last K marks (adjustable K stepper)
- **Gravity** — drop marks into columns; they fall to the bottom

Mix any toggles for custom variants (e.g. Misère + Gravity, Limited + Gravity).

### Board & AI
- Board sizes **3×3 through 8×8**
- Win length: N-in-a-row on boards ≤4×4; **4-in-a-row** on larger boards
- **AI difficulty** (vs computer): Easy, Medium, Hard — from mostly random to full minimax with alpha-beta pruning
- **First player suggestion** — random coin flip with re-roll before each game

### Look & feel
- **Themes** — Midnight, Chalkboard, Wood, Neon Arcade (applied instantly via CSS variables; choice saved in `localStorage`)
- **Sound effects** — optional; **off by default**, preference saved in `localStorage`

## How to Run

```bash
npm install    # first time only
npm run dev    # dev server (usually http://localhost:5173)
npm run build  # production build → dist/
```

Preview a production build locally:

```bash
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
- Vite 6
- Pure CSS (no UI framework)
