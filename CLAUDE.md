# CLAUDE.md — giovanna_world

A paper-doll dress-up game for a six-year-old, running offline as an installed PWA on an iPad.
Full contract in [SPEC.md](SPEC.md). **Start every session by reading [PROGRESS.md](PROGRESS.md)** — it holds the current status, the next action and the part backlog.

---

## Art contract

viewBox of EVERY part: `0 0 680 540`. Never change it.
The doll occupies x 234–446. The lateral margin is deliberate.

Anchors: skull (340,68) · head (340,130) r62 · chin (340,192)
· neck y198 x322–358 · shoulders (282,216) and (398,216)
· arms x266–294 and x386–414, y212–338 · hands (280,344) and (400,344) r16
· torso x288–392 y194–334 rx30 · waist y280 · hip y330
· legs x306–336 and x344–374 · ankle y440 · sole y494
· head accessory: side (406,87), centre (340,66)

They live in `src/anchors.ts`. Import them; never retype a coordinate.

A part receives ONE colour and derives the rest with `shade(c, FOLD)` (0.78) for a fold
and `shade(c, HIGHLIGHT)` (1.10) for a highlight. Never hardcode a variation of a recolourable colour.

Forbidden: gradient, filter, `<image>`, `drop-shadow`, `blur`, `<pattern>`, `<mask>`.
Everything is `path`, `rect`, `circle`, `ellipse` with a flat fill.

Patterns (polka dot, stripe, check) come from `src/lib/patterns.ts`, never written by hand.

**SVG path data uses absolute commands only** (`M L H V C S Q T A Z`, uppercase). Relative
commands make a path's coordinates unverifiable, and the contract test bound-checks every
part by parsing its geometry.

Fixed, non-recolourable colours live in `src/model/palettes.ts` as `FIXED_COLORS`:
eye `#3B2418`, eye highlight `#FBFBF9`, mouth `#C24A6B`, blush `#F0997B` at 45% opacity,
white collar `#FBFBF9`.

## Adding a part

1. Create the file under `src/parts/<slot>/<name>.tsx`.
2. Register it in `src/parts/registry.ts` — one line. That file is the only import point for parts.
3. Run `npx vitest run tests/contract`. The contract suite validates the six criteria of SPEC §12
   against every registered part automatically; there is no new test file to write for pure artwork.
4. Check it visually at `http://localhost:5173/#/dev/sheet` across the 4 skin tones and the 6 fabric colours.
5. Commit as `feat(parts): add <name> <slot>`.

One part per session. A batch generated in one go comes out inconsistent between the parts (SPEC §16).

## UX rules that outrank aesthetics

- **Zero visible text in the game.** Every control is a thumbnail or a colour swatch; its accessible
  name comes from `useTranslation()`, never from a visible label.
- Touch targets ≥ 60×60 CSS px, ≥ 8 px apart.
- One level of navigation. No modal, no back button.
- No save button — autosave with a 300 ms debounce.
- **Pointer Events only** (`onPointerDown`), never Touch Events.
- No transition longer than 120 ms. `prefers-reduced-motion` respected. Visible keyboard focus.
- Layout works from 768 px to 1366 px.

## Engineering rules

- **Conventional Commits, written in English.** Enforced by commitlint on `commit-msg`.
  Types: `feat fix docs style refactor perf test build ci chore revert`.
- **All code symbols, comments and documentation in English.** The single exception is
  `src/i18n/locales/ptBR.ts`, whose _values_ are Brazilian Portuguese.
- **Every on-screen string goes through `src/i18n`.** Default and only locale: `pt-BR`.
  Adding a user-visible string means adding a key to the catalogue, never a literal in a component.
- **TDD.** Write the failing test, watch it fail, implement the minimum, watch it pass, commit.
- **Unit _and_ integration tests are mandatory.** Unit tests are co-located (`src/lib/color.test.ts`);
  integration and contract tests live in `tests/`.
- **95% coverage gate** on lines, branches, functions and statements, enforced in the pre-commit
  hook and in CI. `src/main.tsx` is the only production file excluded — it is `createRoot(...).render(...)`
  with no branch to assert.
- **SOLID, GRASP, DRY, YAGNI, clean code.** In practice here:
  - Logic lives in pure functions under `lib/` and `model/`; React components are thin shells.
  - Dependencies are injected, not imported by leaf modules — `storage.ts` takes a `Storage`,
    `sanitizeLook` takes a `PartLookup`. The model layer never imports the art layer.
  - One responsibility per file. ESLint caps files at 250 lines and cyclomatic complexity at 10.
  - No speculative Phase 2/3 code. Deferred items are listed in `PROGRESS.md`, not stubbed in the source.
- **No runtime network calls.** ESLint bans `fetch`; the app must work in aeroplane mode.

## Commands

```bash
npm run dev            # http://localhost:5173/  (dev sheet at /#/dev/sheet)
npm run verify         # format:check + lint + typecheck + test:coverage + build
npm run test:watch     # vitest in watch mode
npx vitest run tests/contract   # the SPEC §12 per-part gate
```

`npm run verify` is exactly what the pre-commit hook and CI run. If it passes locally, CI passes.

## Deployment

GitHub Pages, public URL `https://fenrrir.github.io/giovanna_world/`.
Vite `base` is `/giovanna_world/` on build and `/` on dev. Pushing to `main` runs the quality
job and deploys. Watch a run with `gh run watch --exit-status`.
