# Paper-Doll Dress-Up Game — Initial Implementation Plan

> **For agentic workers:** implement task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Every task ends with a passing `npm run verify` and one Conventional Commit in English.

**Goal:** Build the foundation, engine, UI and quality pipeline for an offline paper-doll dress-up PWA for a six-year-old on an iPad, with one art part per slot proving the whole pipeline end to end.

**Architecture:** Vite + React 18 + TypeScript (strict), no backend, no runtime network. A pure functional core (`lib/`, `model/`, `render/resolve.ts`) holds all logic and is 100% unit-testable; React components are thin shells over it. Art parts are pure `(color) => ReactNode` SVG fragment functions registered in a single `parts/registry.ts`, and a registry-driven contract test suite mechanically enforces the SPEC's per-part definition of done.

**Tech Stack:** Vite 7, React 18, TypeScript strict, CSS Modules, Vitest + Testing Library + jsdom, `@vitest/coverage-v8`, ESLint 9 (flat) + Prettier, Husky + lint-staged + commitlint, `vite-plugin-pwa` (Workbox), GitHub Actions → GitHub Pages.

---

## Context

`/Users/rodrigo/Projects/giovanna_world` currently contains a single file: `SPEC.md` (in Portuguese). There is no git repository, no `package.json`, no source.

Toolchain on this machine, verified:
- Node v26.7.0 / npm 11.19.0. **pnpm and yarn are not installed** — every command in this plan uses `npm`.
- **`gh` CLI 2.97.0, installed at `/opt/homebrew/bin/gh` and authenticated** as `fenrrir` (git protocol `ssh`; token scopes `admin:public_key`, `gist`, `read:org`, `repo`). Repository setup, Pages activation and CI observation are therefore scripted through `gh`, not done in the web UI.
- The GitHub repository **`fenrrir/giovanna_world` already exists, is public and is empty** (no default branch yet) — so no `gh repo create`, just a first push to `main`.

`SPEC.md` is a complete, agent-oriented contract: it fixes the SVG `viewBox` (`0 0 680 540`), 22 body anchors, the slot/z-order taxonomy, the colour palettes, the tone-derivation rule (`shade`), the persistence schema, and a per-part definition of done. This plan turns that contract into executable code plus the engineering rules the user added on top of it.

Scope decision (confirmed with the user): this plan delivers the **full foundation + engine + UI + `/dev/sheet` + one art part per slot**. The remaining eight Phase 1 parts are deliberately left to follow-up sessions, because `SPEC.md` §16 warns that a batch of parts generated in one go comes out inconsistent. A `PROGRESS.md` file is a first-class deliverable so those follow-up sessions can resume without re-reading this plan.

---

## Global Constraints

Every task's requirements implicitly include this section.

**From the user's rules:**
- Complete pre-commit pipeline: format → lint → typecheck → tests with coverage → build. Nothing is committed that fails any stage.
- Unit **and** integration tests are mandatory for every behavioural change. Tests are written before the implementation (TDD).
- Pre-commit enforces **95%** coverage on lines, branches, functions and statements, globally over `src/`.
- Deploy target is **GitHub Pages**, repo `https://github.com/fenrrir/giovanna_world` (public, already created, currently empty) → Vite `base: '/giovanna_world/'` on build, `'/'` on dev. Public URL: `https://fenrrir.github.io/giovanna_world/`. Repository and Pages configuration is done with the authenticated `gh` CLI.
- Commit messages are **Conventional Commits, written in English**, enforced by commitlint on `commit-msg`.
- Code follows SOLID and GRASP, with DRY, YAGNI and clean code. Concretely: pure functions in `lib/`+`model/`, dependencies injected (RNG, storage, part lookup) rather than imported into leaf modules, one responsibility per file, no speculative Phase 2/3 code.
- **All code symbols, comments and documentation in English.** `SPEC.md` is translated to English; `CLAUDE.md`, `README.md`, `PROGRESS.md` are written in English.
- Any on-screen message goes through the i18n module; the default (and only) locale is **pt-BR**.

**From `SPEC.md` (verbatim values):**
- `viewBox="0 0 680 540"` — contractual, no part may change it. Doll occupies x 234–446.
- Slot z-order: `hairBack` 0, `body` 10, `socks` 20, `shoes` 30, `bottom` 40, `top` 50, `outer` 60, `hairFront` 70, `accessoryFace` 75, `accessoryHead` 80, `handheld` 90.
- Tone derivation: fold `shade(c, 0.78)`, highlight `shade(c, 1.10)`. Never hardcode a variation of a recolourable colour.
- Forbidden in art: `<linearGradient>`, `<radialGradient>`, `<filter>`, external `<image>`, `drop-shadow`, `blur`. Only flat-filled `path/rect/circle/ellipse`.
- Fixed, non-recolourable colours: eye `#3B2418`, eye highlight `#FBFBF9`, mouth `#C24A6B`, blush `#F0997B` @ 45% opacity, white collar `#FBFBF9`.
- Palettes: skin 4 colours, hair 6, fabric 6 (exact hex values in Task 4).
- Zero text in the child's UI. Touch targets ≥ 60×60 CSS px with ≥ 8 px separation. One navigation level, no modals, no back button.
- No save button — autosave with a **300 ms** debounce to `localStorage` key `look:current`. Unknown `schemaVersion` or invalid JSON → silently fall back to the default look.
- `hides` removes a slot from the **render only**; it stays in state and reappears when the hiding part is swapped out.
- Hair is one choice and one colour writing into **two** slots (`hairBack` + `hairFront`).
- Pointer Events only (`pointerdown`/`pointermove`/`pointerup`), never Touch Events.
- Interaction feedback ≤ 120 ms, `prefers-reduced-motion` respected, visible keyboard focus, layout works 768 px → 1366 px.

**Explicitly out of scope here (YAGNI — recorded in `PROGRESS.md` backlog):** drag and drop, `look:saved` gallery, randomize action and button, sound, `socks`/`outer`/`accessory*`/`handheld` slots, backgrounds, PNG export, second character.

---

## File Structure

```
.editorconfig  .gitignore  .nvmrc  .prettierrc.json  .prettierignore
commitlint.config.js  eslint.config.js  index.html
package.json  tsconfig.json  tsconfig.node.json
vite.config.ts  vitest.config.ts
CLAUDE.md            # art + engineering contract, loaded every session
SPEC.md              # translated to English, unchanged in substance
README.md            # setup, scripts, deploy
PROGRESS.md          # living status + backlog for future sessions
.github/workflows/ci.yml
.husky/pre-commit  .husky/commit-msg
assets/CREDITS.md    # raster asset provenance (empty for now, per SPEC §3)
public/              # generated PWA icons + favicon.svg
src/
  main.tsx                  # DOM bootstrap only (excluded from coverage)
  App.tsx  App.module.css   # layout shell + #/dev/sheet route switch
  anchors.ts                # SPEC §8 constants, single source of truth
  styles/global.css         # iOS hardening from SPEC §6
  i18n/
    types.ts                # MessageKey derived from the pt-BR catalogue
    translator.ts           # pure translate(catalogue, key, params)
    locales/ptBR.ts         # the catalogue — the only place with human text
    I18nContext.tsx         # provider + useTranslation()
    index.ts
  lib/
    color.ts                # shade(), FOLD, HIGHLIGHT
    patterns.ts             # dots(), stripes(), checks() generators
    debounce.ts             # debounce() with cancel/flush
    storage.ts              # load/save Look, schema validation
  model/
    slots.ts                # Slot, Z, RENDER_ORDER, SELECTABLE_SLOTS
    types.ts                # Part, HairStyle, Look, EquippedPart, Palette
    palettes.ts             # PALETTES + FIXED_COLORS
    defaults.ts             # DEFAULT_LOOK
    sanitize.ts             # drop equipped parts missing from the registry
    reducer.ts              # lookReducer + action types
  parts/
    body.tsx
    hair/bobFringe.tsx
    top/tShirt.tsx
    bottom/skirt.tsx
    shoes/sneakers.tsx
    registry.ts             # the only import point for parts
  render/
    resolve.ts              # pure: Look -> ordered, hides-filtered layers
    Doll.tsx                # the single <svg>
    Thumb.tsx               # one part isolated, same viewBox + transform
  state/
    LookContext.tsx         # reducer + hydration + debounced autosave
  ui/
    SlotBar.tsx  PartTray.tsx  ColorTray.tsx  (+ .module.css each)
  dev/
    Sheet.tsx  Sheet.module.css
tests/
  contract/registry.test.tsx   # mechanises SPEC §12 over every part
  contract/svgGeometry.ts      # bbox extraction helper
  integration/*.test.tsx       # user-visible flows through real components
```

Unit tests are co-located (`src/lib/color.test.ts`); integration and contract tests live under `tests/`. Files that change together live together; each file has one responsibility.

---

## Task 1: Repository bootstrap and English documentation

**Files:**
- Create: `.gitignore`, `.editorconfig`, `.nvmrc`, `README.md`, `CLAUDE.md`, `PROGRESS.md`, `assets/CREDITS.md`, `docs/plans/2026-08-08-paper-doll-mvp.md`
- Modify: `SPEC.md` (full translation to English)

**Interfaces:**
- Produces: `CLAUDE.md` as the per-session contract every later task must obey; `PROGRESS.md` as the resume point for future sessions.

- [ ] **Step 1: Initialise the repository**

`fenrrir/giovanna_world` already exists on GitHub and is empty, so this only wires the local side. `gh auth` reports `ssh` as the git protocol, so use the SSH remote.

```bash
cd /Users/rodrigo/Projects/giovanna_world
git init -b main
git remote add origin git@github.com:fenrrir/giovanna_world.git
gh repo set-default fenrrir/giovanna_world
```

Confirm the wiring before going further:

```bash
gh repo view --json name,visibility,isEmpty
```
Expected: `{"isEmpty":true,"name":"giovanna_world","visibility":"PUBLIC"}`.

- [ ] **Step 2: Write `.gitignore`, `.editorconfig`, `.nvmrc`**

`.gitignore`: `node_modules/`, `dist/`, `coverage/`, `dev-dist/`, `.DS_Store`, `*.local`, `.vite/`.
`.editorconfig`: `root = true`, UTF-8, LF, 2-space indent, final newline, trim trailing whitespace.
`.nvmrc`: `26` (matches the local toolchain; CI reads this file).

- [ ] **Step 3: Translate `SPEC.md` to English in place**

Translate every section faithfully. Do **not** change any number, hex value, coordinate, type definition or code block — only prose. Keep the section numbering (§1–§17 + annex) so `CLAUDE.md` and this plan can reference it. Retitle to `# Spec — dress-up character game (web/PWA, iPad)`.

- [ ] **Step 4: Write `CLAUDE.md`**

It must contain, in English and compactly: the art contract from the SPEC annex (viewBox, all anchors, `shade` rule, forbidden SVG features, `patterns.ts` rule, registry + `/dev/sheet` validation); plus the engineering rules — Conventional Commits in English, SOLID/GRASP/DRY/YAGNI/clean code, TDD with mandatory unit **and** integration tests, 95% coverage gate, all symbols/comments/docs in English, every on-screen string through `src/i18n` with pt-BR values, absolute-only SVG path commands (`M L H V C S Q T A Z`, uppercase) so the geometry contract test can bound-check parts, and a pointer to `PROGRESS.md` as the session entry point.

- [ ] **Step 5: Write `PROGRESS.md`**

Structure:
1. **How to resume** — read `CLAUDE.md`, then this file's *Next up*, then run `npm run verify`.
2. **Status** — a table of the tasks in this plan with `done / in progress / pending`, all `pending` at this step except Task 1.
3. **Next up** — the single next action.
4. **Phase 1 part backlog** — 8 remaining parts to reach the SPEC's twelve (2 more hair, 2 more top, 2 more bottom, 2 more shoes), each with the ready-to-paste prompt from SPEC §16.
5. **Deferred by YAGNI** — drag and drop, `look:saved` gallery, randomize, sound, `socks`/`outer`/`accessoryFace`/`accessoryHead`/`handheld`, backgrounds, PNG export, second character.
6. **MVP acceptance checklist** — the nine boxes from SPEC §17, unticked.

- [ ] **Step 6: Write `README.md` and `assets/CREDITS.md`**

`README.md`: what it is, `npm install`, the script table, how to reach `/#/dev/sheet`, the deploy URL `https://fenrrir.github.io/giovanna_world/`, and the one-off iPad install steps (Safari → Share → Add to Home Screen, plus Guided Access).
`assets/CREDITS.md`: a table with columns `Asset | Source | Licence | Added on` and a note that all current art is original SVG and the table stays empty until a CC0 raster asset is introduced (SPEC §3).

- [ ] **Step 7: Copy this plan into the repo**

Save the plan as `docs/plans/2026-08-08-paper-doll-mvp.md`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "docs: translate spec to english and add project contract docs"
```

(Husky is not installed yet, so this commit bypasses no gate — it is documentation only.)

---

## Task 2: Vite + React 18 + TypeScript strict scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/App.module.css`, `src/styles/global.css`, `src/vite-env.d.ts`

**Interfaces:**
- Produces: `npm run dev`, `npm run build`, `npm run preview`, `npm run typecheck`; a mounted `<App />`.

- [ ] **Step 1: Install runtime and build dependencies**

```bash
npm init -y
npm install react@^18.3.1 react-dom@^18.3.1
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom
```

- [ ] **Step 2: Write `tsconfig.json`**

`strict: true`, plus `noUncheckedIndexedAccess`, `noImplicitOverride`, `exactOptionalPropertyTypes`, `noUnusedLocals`, `noUnusedParameters`, `target: ES2022`, `lib: ["ES2022","DOM","DOM.Iterable"]`, `module: ESNext`, `moduleResolution: bundler`, `jsx: react-jsx`, `noEmit: true`, `verbatimModuleSyntax: true`, `resolveJsonModule: true`, `isolatedModules: true`. `include: ["src", "tests"]`. `references: [{ "path": "./tsconfig.node.json" }]`.
`tsconfig.node.json` covers `vite.config.ts` and `vitest.config.ts` with `composite: true`, `moduleResolution: bundler`, `allowSyntheticDefaultImports: true`.

- [ ] **Step 3: Write `vite.config.ts` with the GitHub Pages base**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves this project from https://fenrrir.github.io/giovanna_world/,
// so built assets need the repository name as their base path. Dev serves from root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/giovanna_world/' : '/',
  plugins: [react()],
  build: { target: 'es2022', sourcemap: true },
}));
```

- [ ] **Step 4: Write `index.html` with the mandatory iOS metadata (SPEC §6)**

`<html lang="pt-BR">`. In `<head>`, exactly:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/giovanna_world/icon-180.png">
```

Body: `<div id="root"></div>` + `<script type="module" src="/src/main.tsx"></script>`.

- [ ] **Step 5: Write `src/styles/global.css` verbatim from SPEC §6**

The `html, body` block (`overscroll-behavior: none`, `touch-action: manipulation`, `-webkit-user-select: none`, `user-select: none`, `-webkit-touch-callout: none`, `margin: 0`, `height: 100%`) and the `#root` safe-area padding block, exactly as specified. Then add the quality floor:

```css
:focus-visible { outline: 3px solid #378ADD; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

- [ ] **Step 6: Write `src/main.tsx` and a minimal `src/App.tsx`**

`main.tsx` is bootstrap only — `createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)` plus the `global.css` import. `App.tsx` renders a `<main>` shell; it is fleshed out in Task 16.

- [ ] **Step 7: Add scripts to `package.json`**

`dev`, `build` (`tsc -b && vite build`), `preview`, `typecheck` (`tsc -b --noEmit` — note: with project references use `tsc -b`).

- [ ] **Step 8: Verify the build**

```bash
npm run typecheck && npm run build
```
Expected: `tsc` silent, Vite writes `dist/` with asset URLs prefixed `/giovanna_world/`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "build: scaffold vite react typescript project"
```

---

## Task 3: Quality pipeline — Prettier, ESLint, Vitest, coverage gate, Husky, commitlint

This is the task that makes every later task enforceable. It ends with a pre-commit hook that runs the complete pipeline and a `commit-msg` hook that rejects non-conventional messages.

**Files:**
- Create: `.prettierrc.json`, `.prettierignore`, `eslint.config.js`, `vitest.config.ts`, `tests/setup.ts`, `commitlint.config.js`, `.husky/pre-commit`, `.husky/commit-msg`, `src/App.test.tsx`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm run lint`, `npm run format`, `npm run format:check`, `npm run test`, `npm run test:coverage`, `npm run verify`; the 95% coverage threshold every later task must keep green.

- [ ] **Step 1: Install the tooling**

```bash
npm install -D prettier eslint @eslint/js typescript-eslint globals \
  eslint-plugin-react-hooks eslint-plugin-react-refresh eslint-plugin-jsx-a11y \
  eslint-config-prettier \
  vitest @vitest/coverage-v8 jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  husky lint-staged @commitlint/cli @commitlint/config-conventional
```

- [ ] **Step 2: Configure Prettier**

`.prettierrc.json`: `{ "singleQuote": true, "semi": true, "printWidth": 100, "trailingComma": "all", "arrowParens": "always" }`.
`.prettierignore`: `dist`, `coverage`, `dev-dist`, `node_modules`, `public`.

- [ ] **Step 3: Configure ESLint 9 flat config**

`eslint.config.js` composes `@eslint/js` recommended, `typescript-eslint` **strictTypeChecked + stylisticTypeChecked** (with `parserOptions.projectService: true`), `react-hooks`, `react-refresh`, `jsx-a11y` recommended, and `eslint-config-prettier` last. Ignore `dist`, `coverage`, `dev-dist`. Add the rules that carry the user's principles:

```js
'@typescript-eslint/explicit-module-boundary-types': 'error',
'@typescript-eslint/no-explicit-any': 'error',
'@typescript-eslint/consistent-type-imports': 'error',
'no-restricted-syntax': [
  'error',
  {
    // SPEC §2: the app makes no network calls at runtime.
    selector: "CallExpression[callee.name='fetch']",
    message: 'The app must make no runtime network calls (SPEC section 2).',
  },
],
complexity: ['error', 10],
'max-lines': ['error', { max: 250, skipBlankLines: true, skipComments: true }],
```

Override for `tests/**` and `**/*.test.{ts,tsx}`: relax `max-lines`.

- [ ] **Step 4: Configure Vitest with the 95% threshold**

`vitest.config.ts` (separate from `vite.config.ts` so tests never load the PWA plugin):

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      // main.tsx is the DOM bootstrap (createRoot); it has no logic to assert.
      exclude: ['src/main.tsx', 'src/vite-env.d.ts', 'src/**/*.test.{ts,tsx}'],
      reporter: ['text-summary', 'html', 'lcov'],
      thresholds: { lines: 95, branches: 95, functions: 95, statements: 95 },
    },
  },
});
```

`tests/setup.ts`: `import '@testing-library/jest-dom/vitest';` and `afterEach(cleanup)`.

- [ ] **Step 5: Write the first test so the gate can pass**

`src/App.test.tsx` — render `<App />` and assert the `main` landmark exists. This proves the RTL harness works and keeps `src/App.tsx` covered.

- [ ] **Step 6: Add the remaining scripts to `package.json`**

```json
"lint": "eslint .",
"lint:fix": "eslint . --fix",
"format": "prettier --write .",
"format:check": "prettier --check .",
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage",
"verify": "npm run format:check && npm run lint && npm run typecheck && npm run test:coverage && npm run build",
"prepare": "husky"
```

- [ ] **Step 7: Install the hooks**

```bash
npx husky init
```

`.husky/pre-commit` — the complete pipeline. `lint-staged` formats and lints only what is staged (fast); the rest runs project-wide because coverage and type errors are not per-file properties:

```sh
npx lint-staged
npm run typecheck
npm run test:coverage
npm run build
```

`.husky/commit-msg`:

```sh
npx --no -- commitlint --edit "$1"
```

`package.json` `lint-staged` block:

```json
"lint-staged": {
  "*.{ts,tsx}": ["prettier --write", "eslint --fix --max-warnings=0"],
  "*.{json,css,md,yml}": ["prettier --write"]
}
```

- [ ] **Step 8: Configure commitlint for English Conventional Commits**

`commitlint.config.js`:

```js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat','fix','docs','style','refactor','perf','test','build','ci','chore','revert']],
    'subject-case': [2, 'always', 'lower-case'],
    'header-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100],
  },
};
```

- [ ] **Step 9: Prove both hooks work**

```bash
npm run verify
```
Expected: all five stages pass, coverage summary shows 100% over the two covered files.

```bash
git add -A && git commit -m "broken message"
```
Expected: **rejected** by commitlint with `subject may not be empty` / `type may not be empty`.

- [ ] **Step 10: Commit with a valid message**

```bash
git commit -m "build: add lint, format, test and pre-commit quality gates"
```
Expected: pre-commit runs all four stages, commit succeeds.

---

## Task 4: Domain model — slots, types, palettes, anchors

**Files:**
- Create: `src/model/slots.ts`, `src/model/types.ts`, `src/model/palettes.ts`, `src/anchors.ts`
- Test: `src/model/slots.test.ts`, `src/model/palettes.test.ts`, `src/anchors.test.ts`

**Interfaces:**
- Produces: `Slot`, `TraySlot`, `Z`, `RENDER_ORDER`, `SELECTABLE_SLOTS`, `Palette`, `Part`, `HairStyle`, `Look`, `EquippedPart`, `PALETTES`, `FIXED_COLORS`, `BLUSH_OPACITY`, `Box`, `VIEW_BOX`, `VIEW_BOX_ATTR`, `ANCHORS`. Every later task consumes these names.

- [ ] **Step 1: Write the failing tests**

`slots.test.ts`: `Z` has exactly the eleven SPEC keys with the SPEC values; `RENDER_ORDER` is `Z`-ascending and starts with `hairBack`, ends with `handheld`; `SELECTABLE_SLOTS` (what the child can tap) is `['hair','top','bottom','shoes']` and never contains `body`.
`palettes.test.ts`: `PALETTES.skin` has 4 entries, `hair` 6, `fabric` 6; every entry matches `/^#[0-9A-F]{6}$/`; no duplicates within a palette; `FIXED_COLORS` contains the five SPEC values.
`anchors.test.ts`: every numeric x in `ANCHORS` is within `0..680` and every y within `0..540`; `ANCHORS.dollBounds` is `{ x1: 234, x2: 446 }`; `VIEW_BOX_ATTR === '0 0 680 540'`.

- [ ] **Step 2: Run to verify failure**

```bash
npx vitest run src/model src/anchors.test.ts
```
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement `src/model/slots.ts`**

```ts
export type Slot =
  | 'hairBack' | 'body' | 'socks' | 'shoes' | 'bottom'
  | 'top' | 'outer' | 'hairFront' | 'accessoryFace'
  | 'accessoryHead' | 'handheld';

export const Z: Record<Slot, number> = {
  hairBack: 0, body: 10, socks: 20, shoes: 30, bottom: 40,
  top: 50, outer: 60, hairFront: 70, accessoryFace: 75,
  accessoryHead: 80, handheld: 90,
};

/** Slots in paint order, back to front. Derived from Z so the two can never drift. */
export const RENDER_ORDER: readonly Slot[] = (Object.keys(Z) as Slot[]).sort((a, b) => Z[a] - Z[b]);

/**
 * What the child can choose. `hair` is a single choice writing into two slots
 * (SPEC section 7), so it is not a Slot — it is a tray identifier.
 */
export type TraySlot = 'hair' | 'top' | 'bottom' | 'shoes';
export const SELECTABLE_SLOTS: readonly TraySlot[] = ['hair', 'top', 'bottom', 'shoes'];
```

- [ ] **Step 4: Implement `src/model/types.ts`**

Exactly the SPEC §7 shapes, with `ReactNode` imported as a type:

```ts
import type { ReactNode } from 'react';
import type { Slot } from './slots';

export type Palette = 'skin' | 'hair' | 'fabric';

export type Part = {
  /** Namespaced identifier, e.g. 'top.polka-dot-dress'. */
  id: string;
  slot: Slot;
  palette: Palette;
  /** Slots this part removes from the render while equipped. Never its own slot, never 'body'. */
  hides?: Slot[];
  /** An SVG fragment, without an outer <svg>. */
  render: (color: string) => ReactNode;
};

export type HairStyle = {
  id: string;
  back: (color: string) => ReactNode;
  front: (color: string) => ReactNode;
};

export type EquippedPart = { partId: string; color: string };

export type Look = {
  schemaVersion: 1;
  skin: string;
  equipped: Partial<Record<Slot, EquippedPart>>;
};
```

- [ ] **Step 5: Implement `src/model/palettes.ts` and `src/anchors.ts`**

`palettes.ts` holds `PALETTES` verbatim from SPEC §9 plus:

```ts
/** Colours that are never recoloured by the child (SPEC section 9). */
export const FIXED_COLORS = {
  eye: '#3B2418', eyeHighlight: '#FBFBF9', mouth: '#C24A6B',
  blush: '#F0997B', collarWhite: '#FBFBF9',
} as const;
export const BLUSH_OPACITY = 0.45;
```

`anchors.ts` holds `export type Box = { x: number; y: number; width: number; height: number }` (the shared geometry type, consumed by `lib/patterns.ts` and `render/Thumb.tsx`), `VIEW_BOX = { width: 680, height: 540 } as const`, `VIEW_BOX_ATTR = '0 0 680 540'`, and a single frozen `ANCHORS` object with one entry per row of the SPEC §8 table plus `dollBounds: { x1: 234, x2: 446 }`. Names in English camelCase: `skullTop`, `headCenter`, `eyeLine`, `chin`, `neckBase`, `shoulderLeft`, `shoulderRight`, `armLeft`, `armRight`, `handLeft`, `handRight`, `torso`, `waist`, `hip`, `legLeft`, `legRight`, `ankle`, `sole`, `shoeLeft`, `shoeRight`, `skirtHem`, `headAccessorySide`, `headAccessoryCenter`.

- [ ] **Step 6: Run tests, then commit**

```bash
npx vitest run src/model src/anchors.test.ts
git add -A && git commit -m "feat(model): add slot taxonomy, part types and canvas anchors"
```

---

## Task 5: `lib/color.ts` — the `shade` helper

**Files:**
- Create: `src/lib/color.ts`
- Test: `src/lib/color.test.ts`

**Interfaces:**
- Produces: `shade(hex: string, factor: number): string`, `FOLD = 0.78`, `HIGHLIGHT = 1.1`. Every art part and `Thumb` consumes these.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { FOLD, HIGHLIGHT, shade } from './color';

describe('shade', () => {
  it('returns the same colour for a factor of 1', () => {
    expect(shade('#7F77DD', 1)).toBe('#7F77DD');
  });

  it('darkens each channel by the factor', () => {
    // 0x80 * 0.5 = 0x40
    expect(shade('#808080', 0.5)).toBe('#404040');
  });

  it('clamps above 255', () => {
    expect(shade('#F0F0F0', 2)).toBe('#FFFFFF');
  });

  it('clamps below 0', () => {
    expect(shade('#101010', -1)).toBe('#000000');
  });

  it('expands three-digit hex', () => {
    expect(shade('#FA0', 1)).toBe('#FFAA00');
  });

  it('rejects a malformed colour', () => {
    expect(() => shade('rebeccapurple', 1)).toThrow(/hex colour/i);
  });

  it('exposes the fold and highlight factors from the spec', () => {
    expect(FOLD).toBe(0.78);
    expect(HIGHLIGHT).toBe(1.1);
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npx vitest run src/lib/color.test.ts` → FAIL, module not found.

- [ ] **Step 3: Implement**

```ts
/** Fold / shadow factor from the spec. */
export const FOLD = 0.78;
/** Highlight factor from the spec. */
export const HIGHLIGHT = 1.1;

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const clampChannel = (value: number): number => Math.min(255, Math.max(0, Math.round(value)));

/**
 * Derives a tone from a base colour by multiplying every channel by `factor`.
 * A part receives one colour and derives every other tone through this helper,
 * so recolouring never breaks the artwork (SPEC section 9).
 */
export const shade = (hex: string, factor: number): string => {
  if (!HEX.test(hex)) throw new Error(`Invalid hex colour: ${hex}`);
  const full =
    hex.length === 4 ? `#${hex[1]!}${hex[1]!}${hex[2]!}${hex[2]!}${hex[3]!}${hex[3]!}` : hex;
  const channels = [1, 3, 5].map((i) =>
    clampChannel(Number.parseInt(full.slice(i, i + 2), 16) * factor),
  );
  return `#${channels.map((c) => c.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
};
```

- [ ] **Step 4: Run tests to verify they pass** — `npx vitest run src/lib/color.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(lib): add shade colour derivation helper"
```

---

## Task 6: `lib/patterns.ts` — procedural SVG pattern generators

Patterns are generated by function, never written circle by circle (SPEC §9), so swapping dots for stripes is swapping a function call.

**Files:**
- Create: `src/lib/patterns.ts`
- Test: `src/lib/patterns.test.tsx`

**Interfaces:**
- Produces:
```ts
import type { Box } from '../anchors'; // geometry types live with the anchors, not here
export const dots = (box: Box, color: string, options?: { radius?: number; spacing?: number }) => ReactNode;
export const stripes = (box: Box, color: string, options?: { width?: number; spacing?: number }) => ReactNode;
export const checks = (box: Box, color: string, options?: { size?: number }) => ReactNode;
```
Each returns a `<g>` of flat-filled primitives clipped to the box by construction (no `<clipPath>` — shapes are only emitted where they fit).

- [ ] **Step 1: Write the failing tests**

Render each generator inside an `<svg>` with `render()` from RTL and a fixed box such as `{ x: 288, y: 194, width: 104, height: 140 }`. Assert: `dots` emits the expected count for the given spacing and every `<circle>` centre lies inside the box; `stripes` emits `<rect>`s whose `x + width <= box.x + box.width`; `checks` alternates so that no two adjacent cells share a position; all three use the passed colour as `fill` and emit **no** `linearGradient`/`filter`.

- [ ] **Step 2: Run to verify failure.**
- [ ] **Step 3: Implement** the three generators with `Array.from` grids and stable React keys (`` `${cx}-${cy}` ``).
- [ ] **Step 4: Run tests to verify they pass.**
- [ ] **Step 5: Commit** — `feat(lib): add procedural svg pattern generators`

---

## Task 7: `lib/debounce.ts` and `lib/storage.ts`

**Files:**
- Create: `src/lib/debounce.ts`, `src/lib/storage.ts`, `src/model/defaults.ts`
- Test: `src/lib/debounce.test.ts`, `src/lib/storage.test.ts`

**Interfaces:**
- Produces:
```ts
export type Debounced<A extends unknown[]> = ((...args: A) => void) & { cancel: () => void; flush: () => void };
export const debounce = <A extends unknown[]>(fn: (...args: A) => void, ms: number): Debounced<A>;

export const CURRENT_LOOK_KEY = 'look:current';
export const loadLook: (storage?: Storage) => Look | null;   // null on absent/corrupt/unknown version
export const saveLook: (look: Look, storage?: Storage) => void;

export const DEFAULT_LOOK: Look;  // schemaVersion 1, skin PALETTES.skin[0], equipped {}
```
`storage.ts` deliberately knows nothing about the registry — reconciling against available parts is `model/sanitize.ts`'s job (Task 8). Passing `Storage` as an optional parameter keeps it injectable for tests (DIP) while defaulting to `localStorage`.

- [ ] **Step 1: Write the failing tests**

`debounce.test.ts` with `vi.useFakeTimers()`: not called before the delay; called once after; the last arguments win; `cancel()` prevents the call; `flush()` invokes it immediately and only once.
`storage.test.ts` against a fake `Storage` implementation: round-trips a valid `Look`; returns `null` for a missing key; returns `null` for invalid JSON; returns `null` for `schemaVersion: 2`; returns `null` when `skin` is missing or `equipped` is not an object; `saveLook` swallows a `QuotaExceededError` without throwing (SPEC §14 — data loss is a normal scenario).

- [ ] **Step 2: Run to verify failure.**
- [ ] **Step 3: Implement.** `loadLook` validates shape with a small `isLook` type guard — no schema library (YAGNI).
- [ ] **Step 4: Run tests to verify they pass.**
- [ ] **Step 5: Commit** — `feat(lib): add debounce helper and look persistence`

---

## Task 8: `model/sanitize.ts` and `model/reducer.ts`

**Files:**
- Create: `src/model/sanitize.ts`, `src/model/reducer.ts`
- Test: `src/model/sanitize.test.ts`, `src/model/reducer.test.ts`

**Interfaces:**
- Produces:
```ts
export type PartLookup = (slot: Slot, partId: string) => Part | undefined;
export const sanitizeLook: (look: Look, lookup: PartLookup) => Look;

export type LookAction =
  | { type: 'hydrate'; look: Look }
  | { type: 'setSkin'; color: string }
  | { type: 'applyPart'; part: Part; color: string }
  | { type: 'applyHair'; hair: HairStyle; color: string }
  | { type: 'setSlotColor'; slot: Slot; color: string };
export const lookReducer: (state: Look, action: LookAction) => Look;
```
`sanitizeLook` takes the lookup as a parameter rather than importing the registry — the model layer stays independent of the art layer (Dependency Inversion).

- [ ] **Step 1: Write the failing tests**

`sanitize.test.ts`: an equipped part missing from the lookup is dropped silently, the other slots survive, the returned object is a new reference, and a look with only known parts is returned structurally equal.
`reducer.test.ts`:
- `setSkin` changes `skin` and touches nothing else.
- `applyPart` writes `{ partId, color }` into `action.part.slot`.
- `applyPart` on a slot that already had a part **replaces** it.
- `applyHair` writes the **same** `partId` and the **same** colour into both `hairBack` and `hairFront` (SPEC §7).
- `setSlotColor` on an empty slot is a no-op (returns the same reference).
- `setSlotColor` on `hairFront` recolours **both** hair slots — the child sees one hairstyle with one colour.
- Every action returns a new object; the input state is never mutated (assert with a deep-frozen input).

- [ ] **Step 2: Run to verify failure.**
- [ ] **Step 3: Implement** as a pure `switch` with exhaustiveness via a `never` default.
- [ ] **Step 4: Run tests to verify they pass.**
- [ ] **Step 5: Commit** — `feat(model): add look reducer with paired hair slots`

---

## Task 9: `render/resolve.ts`, `Doll.tsx`, `Thumb.tsx`

**Files:**
- Create: `src/render/resolve.ts`, `src/render/Doll.tsx`, `src/render/Thumb.tsx`
- Test: `src/render/resolve.test.ts`, `src/render/Doll.test.tsx`, `src/render/Thumb.test.tsx`

**Interfaces:**
- Consumes: `Look`, `Slot`, `Z`, `RENDER_ORDER`, `PartLookup`, `VIEW_BOX_ATTR`, `ANCHORS`, the body part from Task 10 via injection.
- Produces:
```ts
export type ResolvedLayer = { slot: Slot; part: Part; color: string };
export const resolveLayers: (look: Look, lookup: PartLookup, body: Part) => ResolvedLayer[];

export const Doll: (props: { look: Look; lookup: PartLookup; body: Part; className?: string }) => JSX.Element;

/**
 * Thumb takes a render function rather than a Part, so it can show a HairStyle
 * half (which is not a Part) with the same component. One source of truth stays
 * the part's own render — Thumb only scales it.
 */
export const Thumb: (props: {
  render: (color: string) => ReactNode;
  color: string;
  focus: Box;
  label: string;
}) => JSX.Element;
```

- [ ] **Step 1: Write the failing tests for `resolveLayers` — this is the heart of the SPEC**

- Body is always present, always at `Z.body`, always coloured with `look.skin`, even when `equipped` is empty.
- Layers come back sorted ascending by `Z`.
- A part declaring `hides: ['bottom']` removes the `bottom` layer from the result **while `look.equipped.bottom` is untouched** — assert both.
- Replacing that dress with a plain top makes the previously equipped bottom reappear (the SPEC's exact scenario).
- `hides` can never remove `body`: a malicious `hides: ['body']` is ignored.
- An equipped `partId` absent from the lookup is skipped without throwing.
- Both hair slots resolve to their own halves of the same hairstyle.

- [ ] **Step 2: Run to verify failure.**

- [ ] **Step 3: Implement `resolve.ts`**

Order of operations, matching SPEC §7: collect equipped entries resolvable through `lookup` → union their `hides` (dropping `body` and each part's own slot) → filter → append the body layer → sort by `Z`.

- [ ] **Step 4: Implement `Doll.tsx`**

```tsx
<svg viewBox={VIEW_BOX_ATTR} width="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label={...}>
  {layers.map(({ slot, part, color }) => <g key={slot}>{part.render(color)}</g>)}
</svg>
```
The `aria-label` comes from i18n (Task 11 wires it; until then accept a `label` prop). No transition longer than 120 ms anywhere.

- [ ] **Step 5: Implement `Thumb.tsx`**

Same `viewBox`, the fragment rendered isolated inside a `<g transform={...}>` that scales and translates the region of interest to fill the thumbnail — so a shoe is not a dot in the corner. Add to `src/anchors.ts`:

```ts
export type Box = { x: number; y: number; width: number; height: number };
/** Region of the canvas a thumbnail zooms into, per tray. Derived from ANCHORS, no new magic numbers. */
export const THUMB_FOCUS: Record<TraySlot, Box>;
```

`Box` lives in `anchors.ts` (not `lib/patterns.ts`) so the geometry layer never depends on the pattern helpers; `patterns.ts` imports `Box` from `anchors.ts` instead of declaring its own `PatternBox`. Unit-test that every focus box sits inside the viewBox. There is still exactly one source of truth per part: its own `render`.

- [ ] **Step 6: Component tests** — `Doll.test.tsx` asserts the `viewBox` attribute is exactly `0 0 680 540` and that layers appear in DOM order back-to-front; `Thumb.test.tsx` asserts the same `viewBox` and that the accessible label is applied.

- [ ] **Step 7: Run tests, then commit** — `feat(render): add layer resolution and doll svg renderer`

*(Tasks 9 and 10 are mutually dependent on a body part existing; implement `resolve.ts` against a stub `Part` in its own tests, then wire the real body in Task 10.)*

---

## Task 10: Base body, registry, and the SPEC §12 contract test suite

This is the highest-leverage task in the plan: it turns the SPEC's per-part definition of done into a test that runs automatically against every part ever added, and it is what makes the 95% global coverage target reachable for art files.

**Files:**
- Create: `src/parts/body.tsx`, `src/parts/registry.ts`, `tests/contract/svgGeometry.ts`, `tests/contract/registry.test.tsx`
- Test: `tests/contract/svgGeometry.test.ts`, `src/parts/registry.test.ts`

**Interfaces:**
- Produces:
```ts
export const BODY: Part;                                   // slot 'body', palette 'skin', no hides
export const PARTS_BY_SLOT: Readonly<Record<Slot, readonly Part[]>>;
export const HAIR_STYLES: readonly HairStyle[];
export const findPart: PartLookup;                          // (slot, partId) => Part | undefined
export const findHairStyle: (id: string) => HairStyle | undefined;
```

- [ ] **Step 1: Install the geometry helper dependency**

```bash
npm install -D svg-path-bounds
```

- [ ] **Step 2: Write `tests/contract/svgGeometry.ts` and its unit test**

```ts
export type Bounds = { minX: number; minY: number; maxX: number; maxY: number };
/** Union bounding box of every geometric primitive inside `root`, in user units. */
export const boundsOf: (root: SVGSVGElement) => Bounds | null;
/** Every fill/stroke colour literal found under `root`, lower-cased. */
export const colorsOf: (root: SVGSVGElement) => string[];
```
`boundsOf` handles `path` (via `svg-path-bounds`), `rect`, `circle`, `ellipse`, `line`, `polygon`, `polyline`, and applies any ancestor `transform="translate(...) scale(...)"`. jsdom does not implement `getBBox`, which is exactly why this helper exists — state that in a comment.
Its unit test covers each primitive type plus the empty-root case.

- [ ] **Step 3: Write `tests/contract/registry.test.tsx` — one `describe.each` over every registered part**

For each `part` in every slot, and for each colour in `PALETTES[part.palette]`:

1. **Inside the viewBox.** `boundsOf` is within `0 ≤ x ≤ 680`, `0 ≤ y ≤ 540`, no negative coordinate. *(SPEC §12.1)*
2. **Anchored.** The part's bounds overlap the anchor rectangle declared for its slot in a `SLOT_ANCHOR_EXPECTATION` map in the test file (e.g. `top` must cover the shoulder line y 216 and the waist y 280; `shoes` must reach the sole y 494; hair must touch the skull top y 68). *(SPEC §12.2)*
3. **Recolourable.** Rendering with colour A and colour B produces different markup, and **every** `fill`/`stroke` literal that does not change between the two renders is a member of `FIXED_COLORS`. This is the mechanical form of "derives every tone through `shade`". *(SPEC §12.3, §12.4)*
4. **No forbidden features.** `querySelectorAll('linearGradient, radialGradient, filter, image, pattern, mask')` is empty, and no `style`/`filter` attribute contains `drop-shadow` or `blur`. *(SPEC §12.4)*
5. **Absolute path data only.** Every `d` attribute matches `/^[MLHVCSQTAZ0-9\s.,-]+$/` — no lowercase relative commands. This keeps `boundsOf` sound and is documented in `CLAUDE.md`.
6. **`hides` is honest.** If present, it never contains the part's own slot and never contains `body`. *(SPEC §12.6)*

Plus registry-wide invariants: part ids are unique and prefixed with their slot (`top.` for `top`); every `HairStyle` id is unique; `PARTS_BY_SLOT` has an entry for every `Slot`.

Because this suite renders every part in every palette colour, it drives the art files' coverage to 100% for free.

- [ ] **Step 4: Run to verify failure** — `npx vitest run tests/contract` → FAIL, registry not found.

- [ ] **Step 5: Implement `src/parts/body.tsx`**

One `Part` with `slot: 'body'`, `palette: 'skin'`, `render: (skin) => <>…</>` drawing, against the SPEC §8 anchors and using absolute path commands only:
head circle (340,130) r62; torso rounded rect x 288–392 y 194–334 rx 30; neck x 322–358 down to y 198; arms x 266–294 and x 386–414 over y 212–338; hands r16 at (280,344) and (400,344); legs x 306–336 and x 344–374 down to the ankle y 440 and the sole y 494; eyes at (318,136) and (362,136) filled `FIXED_COLORS.eye` with r4 highlights offset +3/−3; mouth at (340,166) in `FIXED_COLORS.mouth`; blush ellipses in `FIXED_COLORS.blush` at `BLUSH_OPACITY`. Every skin-derived tone through `shade(skin, FOLD)`.

- [ ] **Step 6: Implement `src/parts/registry.ts`**

The single import point for parts. It builds `PARTS_BY_SLOT` from explicit per-slot arrays (empty arrays for the Phase 2 slots), derives an id→part `Map` per slot for `findPart`, and exports `HAIR_STYLES` + `findHairStyle`. Adding a part = create the file + add one line here.

- [ ] **Step 7: Run the contract suite to verify it passes, then commit**

```bash
npx vitest run tests/contract src/parts
git add -A && git commit -m "feat(parts): add base body and registry contract tests"
```

---

## Tasks 11–14: One art part per slot, one part per task

SPEC §16 is explicit: request one part at a time; a batch generated in one go comes out inconsistent. Each of these four tasks is identical in shape, so the pattern is described once.

**Per-task shape:**
1. Create the part file under the slot directory.
2. Register it in `src/parts/registry.ts` (one line).
3. Run `npx vitest run tests/contract` — the suite from Task 10 now covers the new part automatically. No new test file is needed unless the part has behaviour beyond rendering (e.g. `hides`), in which case add a focused assertion.
4. Open `npm run dev` → `http://localhost:5173/#/dev/sheet` and confirm the part in all 4 skin tones and 6 fabric colours *(available from Task 18; before that, verify through the contract suite alone and revisit)*.
5. Commit with `feat(parts): add <name> <slot>`.

| Task | File | Part | Notes |
|---|---|---|---|
| 11 | `src/parts/hair/bobFringe.tsx` | `HairStyle` id `hair.bob-fringe` | Exports `back` and `front`; the back mass sits behind the head circle, the fringe crosses the skull top (340,68) and stops above the eye line y 136. Strand highlights: one or two paths at `shade(c, 1.28)` with `opacity: 0.55` (SPEC §9). |
| 12 | `src/parts/top/tShirt.tsx` | `Part` id `top.t-shirt`, palette `fabric`, no `hides` | Covers shoulders (282,216)/(398,216) down to the waist y 280; short sleeves ending mid-upper-arm. Bodice one tone up (`HIGHLIGHT`), hem one tone down (`FOLD`). White collar in `FIXED_COLORS.collarWhite`. |
| 13 | `src/parts/bottom/skirt.tsx` | `Part` id `bottom.skirt`, palette `fabric`, no `hides` | Waistband on the waist line y 280 (x 284–396, height 18); hem at the reference y 398, flaring within x 234–446. Pleats via `stripes()` from `lib/patterns.ts` at `FOLD` — never hand-written. |
| 14 | `src/parts/shoes/sneakers.tsx` | `Part` id `shoes.sneakers`, palette `fabric`, no `hides` | Left x 296–344 and right x 336–384, both y 464–494, soles flush with y 494. Sole in `shade(c, FOLD)`, laces in `FIXED_COLORS.collarWhite`. |

**Deliberately not built here:** a dress with `hides: ['bottom']`. The hides mechanism is fully covered by `resolve.test.ts` with a stub part, and SPEC §15 puts twelve parts in Phase 1 — the dress is the first entry in the `PROGRESS.md` backlog so it lands with a full session of attention.

---

## Task 15: i18n module (pt-BR)

**Files:**
- Create: `src/i18n/locales/ptBR.ts`, `src/i18n/types.ts`, `src/i18n/translator.ts`, `src/i18n/I18nContext.tsx`, `src/i18n/index.ts`
- Test: `src/i18n/translator.test.ts`, `tests/integration/i18n.test.tsx`

**Interfaces:**
- Produces:
```ts
export const DEFAULT_LOCALE = 'pt-BR';
export type MessageKey = keyof typeof ptBR;
export const translate: (catalogue: Record<string, string>, key: string, params?: Record<string, string | number>) => string;
export const I18nProvider: (props: { children: ReactNode; catalogue?: Record<MessageKey, string> }) => JSX.Element;
export const useTranslation: () => { t: (key: MessageKey, params?: Record<string, string | number>) => string; locale: string };
```
A ~60-line typed module, zero dependencies — chosen over `react-i18next` because the SPEC mandates a tiny fully-offline bundle and the child's UI carries no visible text.

- [ ] **Step 1: Write the failing tests**

`translator.test.ts`: returns the catalogue value for a known key; returns the key itself for an unknown key (never throws, never shows an error on screen — SPEC §4); substitutes `{name}` placeholders; leaves an unmatched placeholder untouched; handles a numeric parameter.
`tests/integration/i18n.test.tsx`: a component calling `useTranslation()` inside `<I18nProvider>` renders the pt-BR string; the same component **outside** the provider still renders (falls back to the default catalogue) rather than throwing.

- [ ] **Step 2: Run to verify failure.**

- [ ] **Step 3: Implement `src/i18n/locales/ptBR.ts` — the only file in the repo containing human-facing text**

Keys in English, values in Brazilian Portuguese. Minimum set:

```ts
export const ptBR = {
  'app.name': 'Mundo da Giovanna',
  'app.shortName': 'Giovanna',
  'app.description': 'Jogo de vestir personagens, para brincar offline no iPad.',
  'doll.label': 'Personagem montado',
  'slot.hair': 'Cabelo',
  'slot.top': 'Blusa',
  'slot.bottom': 'Saia e calça',
  'slot.shoes': 'Sapatos',
  'part.choose': 'Escolher {part}',
  'color.choose': 'Escolher a cor {color}',
  'skin.choose': 'Escolher o tom de pele',
  'dev.sheet.title': 'Folha de contato',
  'dev.sheet.slot': 'Slot',
  'dev.sheet.skinTone': 'Tom de pele',
  'dev.sheet.showAnchors': 'Mostrar âncoras',
  'dev.sheet.fabricRow': 'Mesma peça nas seis cores de tecido',
} as const;
```

- [ ] **Step 4: Implement `translator.ts`, `types.ts`, `I18nContext.tsx`, `index.ts`.**
- [ ] **Step 5: Run tests to verify they pass.**
- [ ] **Step 6: Commit** — `feat(i18n): add typed i18n module with pt-br default`

---

## Task 16: `state/LookContext.tsx` — reducer, hydration and debounced autosave

**Files:**
- Create: `src/state/LookContext.tsx`
- Test: `tests/integration/lookContext.test.tsx`

**Interfaces:**
- Consumes: `lookReducer`, `sanitizeLook`, `loadLook`, `saveLook`, `debounce`, `DEFAULT_LOOK`, `findPart`.
- Produces: `LookProvider`, `useLook(): { look: Look; dispatch: Dispatch<LookAction> }`.

- [ ] **Step 1: Write the failing integration tests**

With `vi.useFakeTimers()` and a fake `Storage` injected through a provider prop:
- On mount with empty storage, `look` equals `DEFAULT_LOOK`.
- On mount with a stored look referencing a part that no longer exists, that slot is dropped and the rest survives (`sanitizeLook` is applied on hydration).
- On mount with corrupt JSON, `look` equals `DEFAULT_LOOK` and **nothing is rendered as an error**.
- After a `setSkin` dispatch, storage is **not** written before 300 ms and **is** written exactly once at 300 ms.
- Three dispatches inside the window produce exactly one write, holding the final state.
- On unmount, the pending debounced write is flushed, not lost.

- [ ] **Step 2: Run to verify failure.**
- [ ] **Step 3: Implement** with `useReducer` + `useMemo` for the debounced saver + `useEffect` cleanup calling `flush()`. No Redux, no Zustand (SPEC §5).
- [ ] **Step 4: Run tests to verify they pass.**
- [ ] **Step 5: Commit** — `feat(state): wire look context with debounced autosave`

---

## Task 17: The child's UI — `SlotBar`, `PartTray`, `ColorTray`, `App` layout

**Files:**
- Create: `src/ui/SlotBar.tsx`, `src/ui/PartTray.tsx`, `src/ui/ColorTray.tsx` and a `.module.css` beside each
- Modify: `src/App.tsx`, `src/App.module.css`, `src/main.tsx` (wrap in `I18nProvider` + `LookProvider`)
- Test: `tests/integration/dressUp.test.tsx`, plus a focused test per component

**Interfaces:**
- Produces: `SlotBar({ active, onSelect })`, `PartTray({ slot })`, `ColorTray({ slot })`.

**Design rules to honour literally:** zero visible text — every control is a `<button>` whose content is a `<Thumb>` or a colour swatch and whose accessible name comes from `useTranslation()`. Minimum `60px × 60px` with `gap: 8px` (assert this in CSS and note it in the test as a comment; CSS is not asserted by jsdom). Pointer Events only — handlers are `onPointerDown`, never `onTouchStart`. One navigation level: `SlotBar`, `PartTray` and `ColorTray` are all on screen simultaneously; tapping a slot swaps the tray contents in place, no modal, no back button.

- [ ] **Step 1: Write the failing integration test — the whole child journey**

`tests/integration/dressUp.test.tsx`, using `userEvent` with `pointerEventsCheck` enabled:
1. Render the app. The doll `<svg>` is present with `viewBox="0 0 680 540"` and shows only the body.
2. Tap the hair slot → the hair tray lists `HAIR_STYLES`; tap the bob → both hair layers appear in the doll.
3. Tap a fabric colour in the `ColorTray` → the hair recolours; **both** hair slots share the new colour.
4. Tap the top slot → tap the t-shirt → the top layer appears above the body in DOM order.
5. Tap a skin swatch → the body recolours and the clothing colours are unchanged.
6. Advance timers 300 ms → `localStorage['look:current']` holds the assembled look.
7. Assert **no visible text nodes** inside the game region: every button has an `aria-label` and an empty `textContent`. This is the SPEC §17 "no word in the interface" criterion, mechanised.

- [ ] **Step 2: Run to verify failure.**
- [ ] **Step 3: Implement the three components and the `App` layout.**

`App.tsx` also owns the hidden dev route: if `window.location.hash` starts with `#/dev/sheet`, render `<Sheet />` instead of the game. Hash routing rather than a router because GitHub Pages cannot rewrite paths and SPEC §4 forbids navigation depth — no `react-router` dependency (YAGNI).

- [ ] **Step 4: Run tests to verify they pass, and confirm coverage is still ≥ 95%.**
- [ ] **Step 5: Commit** — `feat(ui): add slot, part and colour trays with pointer interaction`

---

## Task 18: `/dev/sheet` — the contact sheet quality tool

**Files:**
- Create: `src/dev/Sheet.tsx`, `src/dev/Sheet.module.css`, `src/dev/AnchorOverlay.tsx`
- Test: `tests/integration/devSheet.test.tsx`

**Interfaces:**
- Consumes: `PARTS_BY_SLOT`, `HAIR_STYLES`, `BODY`, `PALETTES`, `ANCHORS`, `Doll`, `useTranslation`.

Requirements from SPEC §11, all three mandatory:
- A slot selector and a skin-tone selector.
- Every part of the chosen slot rendered **over the same body, side by side, at the same scale**.
- One extra row showing the same part in all six `fabric` colours, to prove tone derivation works light and dark.
- A toggleable anchor overlay drawing crosses at every SPEC §8 point.

- [ ] **Step 1: Write the failing integration test**

Reached via `window.location.hash = '#/dev/sheet'`; renders one doll per part of the default slot; changing the skin selector recolours every doll; changing the slot selector swaps the set; the fabric row renders exactly 6 dolls; toggling the anchor overlay adds and removes the `<g data-testid="anchor-overlay">` and its cross count equals the number of anchor points.

- [ ] **Step 2: Run to verify failure.**
- [ ] **Step 3: Implement.** `AnchorOverlay` derives its crosses by iterating `ANCHORS` — no duplicated coordinate literals (DRY).
- [ ] **Step 4: Run tests to verify they pass.**
- [ ] **Step 5: Manually verify** — `npm run dev`, open `http://localhost:5173/#/dev/sheet`, check the four parts from Tasks 11–14 in all skin tones and all six fabric colours against SPEC §12.
- [ ] **Step 6: Commit** — `feat(dev): add contact sheet quality tool`

---

## Task 19: PWA — offline precache, manifest and iOS icons

**Files:**
- Create: `public/app-icon.svg`, `pwa-assets.config.ts`
- Modify: `vite.config.ts`, `index.html`
- Test: `tests/integration/pwaManifest.test.ts`

- [ ] **Step 1: Install**

```bash
npm install -D vite-plugin-pwa @vite-pwa/assets-generator
```

- [ ] **Step 2: Draw `public/app-icon.svg`**

A single flat-filled SVG (the doll's head silhouette on a `#7F77DD` field), obeying the same no-gradient/no-filter rule.

- [ ] **Step 3: Generate the icons**

```bash
npx pwa-assets-generator --preset minimal-2023 public/app-icon.svg
```
Expected output in `public/`: `apple-touch-icon-180x180.png`, `pwa-192x192.png`, `pwa-512x512.png`, `maskable-icon-512x512.png`. Update the `apple-touch-icon` href in `index.html` to match the generated filename, prefixed with `/giovanna_world/`.

- [ ] **Step 4: Configure `VitePWA` in `vite.config.ts`**

`registerType: 'autoUpdate'`; `workbox.globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}']` so the entire bundle is precached (SPEC §5); `manifest` with `start_url: '/giovanna_world/'`, `scope: '/giovanna_world/'`, `display: 'standalone'`, `orientation: 'any'`, `background_color`/`theme_color`, `lang: 'pt-BR'`, and the four icons. **Import `ptBR` from `src/i18n/locales/ptBR.ts` for `name`, `short_name` and `description`** — the catalogue stays the single source of user-facing text (rule 8, DRY).

- [ ] **Step 5: Write the test**

`tests/integration/pwaManifest.test.ts` imports `ptBR` and the manifest object exported from a small `src/pwa/manifest.ts` module (extracted so it is importable by both `vite.config.ts` and the test), asserting: `start_url` and `scope` are `/giovanna_world/`, `display` is `standalone`, `name === ptBR['app.name']`, and all four icon entries are present with correct `sizes`/`purpose`.

- [ ] **Step 6: Verify offline behaviour**

```bash
npm run build && npm run preview
```
Load the preview URL, then in DevTools → Application confirm the service worker is activated and the manifest parses; tick *Offline* and reload — the app must still render.

- [ ] **Step 7: Commit** — `feat(pwa): add offline precache, manifest and ios install metadata`

---

## Task 20: CI and GitHub Pages deployment

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write the workflow**

One file, three jobs. `quality` mirrors the pre-commit pipeline exactly (DRY: both call the same npm scripts). `deploy` runs only on `main`.

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run format:check
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:coverage
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: quality
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Enable Pages with the `gh` CLI**

The `deploy-pages` action fails unless the repository's Pages source is set to **GitHub Actions** first. The authenticated token carries the `repo` scope, which covers the Pages API on a repository the user owns:

```bash
gh api -X POST repos/fenrrir/giovanna_world/pages -f build_type=workflow
```

Expected: a JSON body with `"build_type": "workflow"`. If the site already exists the call returns HTTP 409 — switch it instead:

```bash
gh api -X PUT repos/fenrrir/giovanna_world/pages -f build_type=workflow
```

Verify:

```bash
gh api repos/fenrrir/giovanna_world/pages --jq '.build_type, .html_url'
```
Expected: `workflow` and `https://fenrrir.github.io/giovanna_world/`.

If the API returns 403 (token missing the required permission), fall back to the UI once: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

- [ ] **Step 3: Commit and push**

```bash
git add -A && git commit -m "ci: add quality pipeline and github pages deployment"
git push -u origin main
```

- [ ] **Step 4: Watch the run and confirm the deployment**

```bash
gh run watch --exit-status
```
Expected: `quality` passes all five gates, then `deploy` succeeds.

```bash
gh run view --log-failed   # only if the run fails
gh browse                  # repository
```

Confirm the published site is live and serving the correct base path:

```bash
gh api repos/fenrrir/giovanna_world/pages --jq '.status, .html_url'
```
Expected: `built` and `https://fenrrir.github.io/giovanna_world/`. Open that URL and confirm the doll renders and asset requests resolve under `/giovanna_world/assets/`.

---

## Task 21: Close the loop — progress record and acceptance review

**Files:**
- Modify: `PROGRESS.md`, `CLAUDE.md`, `README.md`

- [ ] **Step 1: Mark Tasks 1–20 done in `PROGRESS.md`** and set *Next up* to the first backlog part (`bottom.polka-dot-dress`, the one with `hides: ['bottom']`).
- [ ] **Step 2: Fill the part backlog** with the eight remaining Phase 1 parts, each as a paste-ready SPEC §16 prompt naming the slot, the one-sentence visual description and the relevant anchors.
- [ ] **Step 3: Walk the SPEC §17 acceptance checklist** and tick only what is genuinely verified, recording the untested boxes (the ones needing the physical iPad) as explicitly pending with the exact steps to check them.
- [ ] **Step 4: Add a `CLAUDE.md` "Adding a part" section** — create the file, add one line to `registry.ts`, run `npx vitest run tests/contract`, check `/#/dev/sheet`, commit as `feat(parts): add <name> <slot>`.
- [ ] **Step 5: Run the full pipeline one last time**

```bash
npm run verify
```

- [ ] **Step 6: Commit** — `docs: record mvp progress and remaining part backlog`

---

## Verification

**Automated, on every commit and in CI** (`npm run verify`):
1. `prettier --check .` — formatting.
2. `eslint .` — SOLID/clean-code rules, no `any`, no `fetch`, complexity ≤ 10, files ≤ 250 lines, a11y rules.
3. `tsc -b --noEmit` — strict types.
4. `vitest run --coverage` — unit + integration + contract suites, failing under 95% on any of the four metrics.
5. `vite build` — the bundle and PWA assets actually build.
   Plus `commitlint` on `commit-msg` rejecting non-conventional English messages.

After each push, confirm the remote run rather than assuming it passed:

```bash
gh run watch --exit-status
```

**Manual, once, at the end:**
- `npm run dev` → `http://localhost:5173/` — dress the doll by touch on a trackpad; reload and confirm the look survives.
- `http://localhost:5173/#/dev/sheet` — every part in 4 skin tones and 6 fabric colours, anchor overlay on: no floating hair, no sleeve missing the shoulder, no hem crossing the knee.
- `npm run build && npm run preview` → DevTools *Offline* → reload still renders (SPEC §17: works in aeroplane mode).
- Resize the browser 768 px → 1366 px: layout holds, every touch target still ≥ 60 px.
- On the iPad, once: Safari → `https://fenrrir.github.io/giovanna_world/` → Share → Add to Home Screen. Open from the home screen: full screen, no address bar; long-press the doll shows no context menu; double-tap does not zoom; aeroplane mode still works.

## Open decisions recorded, not blocking

- **`randomize` deferred.** SPEC §10's folder listing names it, but SPEC §15 puts the randomize button in Phase 2. YAGNI wins; it is in the `PROGRESS.md` backlog.
- **`look:saved` deferred.** SPEC §14 defines the key; SPEC §15 puts the saved-looks gallery in Phase 2. Only `look:current` is implemented.
- **`src/main.tsx` excluded from coverage** — it is `createRoot(...).render(...)` with no branch to assert. This is the only production file outside the 95% gate, and the exclusion is documented in `vitest.config.ts` and `CLAUDE.md`.
