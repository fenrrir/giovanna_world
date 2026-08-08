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
| `npm run build`         | Typecheck and build to `dist/`.                                    |
| `npm run preview`       | Serve the production build locally, service worker included.       |
| `npm run typecheck`     | `tsc` with no emit.                                                |
| `npm run lint`          | ESLint over the whole project.                                     |
| `npm run format`        | Prettier, writing in place.                                        |
| `npm run test`          | Vitest, single run.                                                |
| `npm run test:watch`    | Vitest in watch mode.                                              |
| `npm run test:coverage` | Vitest with the 95% coverage gate.                                 |
| `npm run verify`        | The full pipeline: format check, lint, typecheck, coverage, build. |

`npm run verify` is exactly what the pre-commit hook and CI run.

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
