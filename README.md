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

Push to `main` (or run **Deploy to GitHub Pages** manually). The workflow builds with `npm ci` and `npm run build`, then pushes the contents of `dist/` to the **`gh-pages`** branch.

### One-time Pages setting (required)

If the live site shows `<script type="module" src="/src/main.tsx">`, GitHub Pages is serving the **`main`** branch source tree instead of the built site.

In **github.com/vchernoy/tictactoe → Settings → Pages**:

1. **Build and deployment → Source:** **Deploy from a branch**
2. **Branch:** **`gh-pages`**, folder **`/ (root)`**
3. Save, wait ~1 minute, then re-run the deploy workflow if needed.

Do **not** use **main** as the publish branch — that exposes unbuilt `index.html` and `/src/*`.

**Custom domain:** keep **vchernoy.xyz** configured under the same Pages settings (or a `CNAME` on `gh-pages`). No extra reverse-proxy to the repo root is needed; both URLs should serve the `gh-pages` artifact.

## Tech Stack

- React 19 + TypeScript
- Vite 8
- Pure CSS (no UI framework)
