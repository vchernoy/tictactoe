# Tic Tac Toe

A web-based Tic Tac Toe game with composable rules, board sizes, themes, and AI difficulty levels. Built with React and Vite.

**Play live:** [tictactoe.vchernoy.xyz](https://tictactoe.vchernoy.xyz) (primary)

The custom subdomain is the canonical URL. [vchernoy.github.io/tictactoe](https://vchernoy.github.io/tictactoe/) may still work as a GitHub Pages mirror depending on your DNS and Pages settings.

## Features

### Game modes
- **PvP (Human vs Human)** — local two-player on one device
- **PvC (Human vs Computer)** — play against the AI with Easy, Medium, or Hard difficulty

### Composable rules
Pick a preset or mix independent toggles. Presets: **Classic**, **Misère**, **Connect-4**, **Connect-4 Limited**, **Limited**, **Chaos**, and **Custom** (shown when toggles no longer match a preset).

| Preset | Misère | Limited | Gravity | Fall on expire |
|--------|--------|---------|---------|----------------|
| Classic | — | — | — | — |
| Misère | ✓ | — | — | — |
| Connect-4 | — | — | ✓ | — |
| Connect-4 Limited | — | ✓ (K = win length) | ✓ | ✓ |
| Limited | — | ✓ (K = win length) | — | — |
| Chaos | ✓ | ✓ (min K) | — | — |
| Custom | mix | mix | mix | when Limited + Gravity |

- **Misère** — completing a line loses (opponent wins)
- **Limited moves** — each player keeps only their last K marks (adjustable K stepper)
- **Gravity** — drop marks into columns; they fall to the bottom
- **Realistic fall when marks expire** — sub-toggle under Gravity when Limited is also on: after the oldest mark expires, remaining marks in each column drop to fill gaps (new wins can form)

Mix any toggles for custom variants (e.g. Misère + Gravity, Limited without compact fall).

### Board & win rules
- Board sizes **3×3 through 8×8**
- Win length: **N-in-a-row** on boards ≤4×4 (3×3 → 3, 4×4 → 4); **4-in-a-row** on 5×5–8×8 boards

### AI & first player
- **AI difficulty** (PvC only): Easy, Medium, Hard — from mostly random to full minimax with alpha-beta pruning
- **First player coin flip** — random X/O suggestion before each game, with re-roll (“Pick Again”)

### Look & feel
- **Themes** — Midnight, Chalkboard, Wood, Neon Arcade (applied instantly via CSS variables; choice saved in `localStorage`)
- **Sound effects** — optional; **off by default**, preference saved in `localStorage`

### Shareable game links
Copy a link from the setup screen (or **Share** during a game) to send the current configuration. Settings are encoded in URL query params; opening the link pre-fills setup. Omitted params use defaults; invalid values fall back gracefully.

| Param | Values | Default |
|-------|--------|---------|
| `size` | 3–8 | 3 |
| `mode` | `pvp`, `pvc` | `pvp` |
| `misere` | 0, 1 | 0 |
| `limited` | 0, 1 | 0 |
| `k` | number | win length (when limited) |
| `gravity` | 0, 1 | 0 |
| `compact` | 0, 1 | 0 (only when `limited=1` and `gravity=1`) |
| `diff` | `easy`, `medium`, `hard` | `medium` (pvc only) |
| `theme` | `midnight`, `chalkboard`, `wood`, `neon` | localStorage / midnight |

Example:

```
https://tictactoe.vchernoy.xyz/?size=5&mode=pvc&gravity=1&limited=1&compact=1&k=4&diff=hard&theme=neon
```

Theme from the URL applies on initial load only; sound and other prefs still come from `localStorage`.

## Link previews (Open Graph)

Sharing **https://tictactoe.vchernoy.xyz/** in Slack, iMessage, Discord, or Twitter shows a preview card with title, description, and image. Meta tags live in `index.html`; the share image is `public/og-image.png` (1200×630, copied to `dist/` on build). Source SVG: `public/og-image.svg`.

To refresh cached previews after changes:

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator) (or post a new link)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [opengraph.xyz](https://www.opengraph.xyz/)

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

Deployed via [GitHub Pages](https://pages.github.com/) and GitHub Actions:

- **https://tictactoe.vchernoy.xyz** — primary (custom subdomain)
- **https://vchernoy.github.io/tictactoe/** — GitHub Pages default URL; may still serve the app

`vite.config.ts` sets `base: '/'` for root hosting on the subdomain. `public/CNAME` (`tictactoe.vchernoy.xyz`) is copied into `dist/` on each build so Pages knows the custom domain.

Older paths (e.g. `https://vchernoy.xyz/tictactoe/`) are not in this repo; redirect them in DNS/Cloudflare if needed.

### Deploy

Push to `main` (or run **Deploy to GitHub Pages** manually). The workflow runs `npm ci`, `npm run build`, uploads `dist/`, and deploys via GitHub Actions.

### One-time Pages settings (required)

1. In **github.com/vchernoy/tictactoe → Settings → Pages → Build and deployment → Source**, choose **GitHub Actions** (not “Deploy from a branch”).

2. In **Settings → Pages → Custom domain**, enter `tictactoe.vchernoy.xyz` and save. GitHub will create/update the `CNAME` file on deploy; the repo also includes `public/CNAME` so it is copied into `dist/` on each build.

3. **DNS** (Cloudflare or your registrar): add a CNAME record `tictactoe` → `vchernoy.github.io`. If proxied through Cloudflare, use SSL mode **Full (strict)**.

If the live site shows `<script type="module" src="/src/main.tsx">`, Pages is still serving the **main** branch (via the built-in `pages-build-deployment` Jekyll workflow) instead of the workflow artifact. In **Settings → Pages → Source**, choose **GitHub Actions** (not “Deploy from a branch → main”), then re-run **Deploy to GitHub Pages**. The deploy workflow verifies the live URL after each release.

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Pure CSS (no UI framework)
