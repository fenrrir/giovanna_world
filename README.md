# giovanna_world

A paper-doll dress-up game for a six-year-old. It runs offline as an installed PWA on an iPad:
choose a skin tone, a hairstyle, clothes and shoes, and recolour every piece. No accounts, no
network at runtime, no ads, no score.

All artwork is original SVG generated in this repository — see [SPEC.md](SPEC.md) §3.

**Live:** https://fenrrir.github.io/giovanna_world/

## Documents

| File                       | What it is                                                                        |
| -------------------------- | --------------------------------------------------------------------------------- |
| [SPEC.md](SPEC.md)         | The full contract — canvas anchors, slot taxonomy, palettes, acceptance criteria. |
| [CLAUDE.md](CLAUDE.md)     | The condensed art and engineering contract, loaded every session.                 |
| [PROGRESS.md](PROGRESS.md) | Current status, next action and the remaining part backlog.                       |

## Getting started

Requires the Node version in [.nvmrc](.nvmrc).

```bash
npm install
npm run dev
```

The game runs at http://localhost:5173/.
The hidden contact sheet — every part of a slot over the same body, in every skin tone and
fabric colour, with an anchor overlay — is at http://localhost:5173/#/dev/sheet.

## Scripts

| Script                  | What it does                                                       |
| ----------------------- | ------------------------------------------------------------------ |
| `npm run dev`           | Vite dev server.                                                   |
| `npm run dev:lan`       | Dev server reachable from the iPad — see below.                    |
| `npm run build`         | Typecheck and build to `dist/`.                                    |
| `npm run preview`       | Serve the production build locally, service worker included.       |
| `npm run preview:lan`   | The production build, reachable from the iPad.                     |
| `npm run typecheck`     | `tsc` with no emit.                                                |
| `npm run lint`          | ESLint over the whole project.                                     |
| `npm run format`        | Prettier, writing in place.                                        |
| `npm run test`          | Vitest, single run.                                                |
| `npm run test:watch`    | Vitest in watch mode.                                              |
| `npm run test:coverage` | Vitest with the 95% coverage gate.                                 |
| `npm run verify`        | The full pipeline: format check, lint, typecheck, coverage, build. |

`npm run verify` is exactly what the pre-commit hook and CI run.

## Checking on the iPad while you work

```bash
npm run dev:lan
```

Vite prints the address to open in Safari on the iPad, for example
`http://192.168.0.4:5173/`. Both devices must be on the same network, and macOS may ask once
whether to allow incoming connections for `node` — it has to be allowed. The address comes from
DHCP, so it can change between sessions; read it from the command's output rather than
remembering it. Hot reload works over the network, so an edit shows up on the iPad immediately.

**What this does and does not prove.** A service worker only runs on HTTPS or on `localhost`, so
over `http://` on the LAN there is none — and `vite-plugin-pwa` leaves it off in dev regardless.

| Criterion (SPEC §17)                        | `dev:lan` | Deployed URL |
| ------------------------------------------- | --------- | ------------ |
| Touch targets, layout, one-level navigation | yes       | yes          |
| Pointer events, no double-tap zoom          | yes       | yes          |
| No overscroll bounce, no long-press menu    | yes       | yes          |
| Autosave survives a reload                  | yes       | yes          |
| Opens full screen from the home screen      | yes       | yes          |
| **Works in aeroplane mode**                 | **no**    | yes          |

So: iterate on the artwork and the interface over the LAN, and validate installing and running
offline against https://fenrrir.github.io/giovanna_world/, which is HTTPS and redeploys on every
push to `main`. SPEC §5 makes the same point — serving over `http://` on the LAN does not work
for an installed PWA, and that is why the project deploys rather than running from the Mac.

## Quality gates

Commits are blocked unless the whole pipeline passes: Prettier, ESLint, TypeScript strict,
Vitest with **95%** coverage on lines, branches, functions and statements, and a successful build.
Commit messages must be [Conventional Commits](https://www.conventionalcommits.org/) in English —
`commitlint` rejects anything else.

## Deployment

Pushing to `main` runs the quality job and, if it passes, publishes to GitHub Pages.

```bash
gh run watch --exit-status
```

Vite's `base` is `/giovanna_world/` on build and `/` on dev.

## Installing on the iPad

There is no install prompt on iOS, so this is done once by an adult:

1. Open https://fenrrir.github.io/giovanna_world/ in **Safari** (not Chrome).
2. Share → **Add to Home Screen**.
3. Open it from the home screen. It runs full screen, with no address bar, and works offline.

Optional but recommended: **Settings → Accessibility → Guided Access**. Three clicks of the side
button then lock the iPad into the app.
