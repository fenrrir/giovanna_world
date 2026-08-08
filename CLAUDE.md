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

## Adding a generated part

A part may also be a pure function `params → d` instead of hand-drawn artwork (SPEC §7a).
`src/parts/hair/custom/` is the pilot and the mould: `params.ts` (axes + a total repair function),
`geometry.ts` (the builders), `fringes.ts` (one discrete axis), `index.tsx` (the component).

Beyond the art contract above, five rules that are load-bearing rather than stylistic:

- **Emit only `M L C Z`, uppercase, and round every number.** The contract suite's absolute-path
  regex has no `e`, so an unrounded coordinate that stringifies with an exponent fails; and
  `is-svg-path` _throws_ on a `d` that ends in whitespace. Restricting to coordinate pairs is also
  what lets a test read the path back without a full path machine.
- **Control points count towards the bounds.** The suite measures the control-point hull, not the
  true curve extremes, so a handle that escapes the viewBox fails even when the curve does not.
- **Take the anchors as a parameter**, defaulted to `ANCHORS`. The anchor test shifts the body and
  requires the whole path to shift by exactly the same amount; nothing else proves rule 1 was kept.
- **Register one instance at its default axes.** The contract suite then covers it for free — but
  it only ever sees that one point, so sweep the parameter space in a test of your own.
- **Look at the extremes, not just the default.** `npx vitest run tests/tools` writes
  `preview/hair-*.svg` across every axis. Three defects in the first version of the generator passed
  1350 assertions and were obvious on sight.

## Adding a part

1. Create the file under `src/parts/<slot>/<name>.tsx`.
2. Register it in `src/parts/registry.ts` — one line. That file is the only import point for parts.
3. Run `npx vitest run tests/contract`. The contract suite validates the six criteria of SPEC §12
   against every registered part automatically; there is no new test file to write for pure artwork.
4. Check it visually at `http://localhost:5173/#/dev/sheet` across the 4 skin tones and the 6 fabric colours.
5. Commit as `feat(parts): add <name> <slot>`.

One part per session. A batch generated in one go comes out inconsistent between the parts (SPEC §16).

**Look at the artwork before you call a part done.** The contract suite proves a part is
anchored, in bounds and recolourable; it cannot tell you the piece looks right. Three defects in
the first four parts were invisible to every assertion and obvious on sight — arms merging into
the torso, two shoes reading as one platform, a sleeve leaving a sliver of skin at the shoulder.

Where no browser is available, `npx vitest run tests/tools` writes the doll to `preview/*.svg`,
and on macOS `qlmanage -t -s 680 -o preview preview/*.svg` turns those into images.

**Check `preview/holes.svg` for gaps.** It is the same doll on a magenta backdrop: any magenta
inside the silhouette is a place where one layer failed to meet the next. Skin showing between a
shoe and its sole, background showing through the shoulder — both were found this way and neither
was visible against the normal background. `preview/hair-*-holes.svg` does the same across the
axes of the generated hairstyle.

Two rules that follow from those bugs, and are worth checking before drawing:

- **A garment must cover the limb it sits on**, and its edge should be derived from that limb's
  anchor rather than chosen by eye. Cut past it and skin shows through.
- **A back layer needs no cut-out for the body.** `hairBack` renders behind the doll; the body
  already occludes it. Carving a notch to "let the neck show" duplicates the z-order, and wherever
  the notch is wider than the torso it becomes a hole.

## UX rules that outrank aesthetics

- **Zero visible text in the game.** Every control is a thumbnail or a colour swatch; its accessible
  name comes from `useTranslation()`, never from a visible label.
  The single exception is `HairParamsPanel` — the axes of a generated part, where a thumbnail cannot
  stand for a continuous slider (SPEC §4). It is scoped to that panel and an integration test pins
  both halves; do not widen it. Its strings still go through `src/i18n` like everything else.
- Touch targets ≥ 60×60 CSS px, ≥ 8 px apart.
- One level of navigation. No modal, no back button.
- No save button — autosave with a 300 ms debounce.
- **Pointer Events only** (`onPointerDown`), never Touch Events.
- No transition longer than 120 ms. `prefers-reduced-motion` respected. Visible keyboard focus.
- Layout works from 768 px to 1366 px.

## Engineering rules

- **Commits go through the commit skill.** Do not hand-write a `git commit -m` for substantive
  work — invoke the commit skill so the message is derived from the actual diff.
- **Conventional Commits, subject _and_ body written in English.** Enforced by commitlint on
  `commit-msg`. Types: `feat fix docs style refactor perf test build ci chore revert`.
  The body explains _why_, not what the diff already shows.
- **Name the model that actually wrote the commit.** The co-author trailer must be the real
  model for that session, never a default or placeholder:

  ```
  Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
  ```

  If a session runs on a different model, change the name to that model. An inaccurate trailer
  makes the history lie about its own provenance.

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
npm run dev:lan        # same, reachable from the iPad; vite prints the address
npm run verify         # format:check + lint + typecheck + test:coverage + build
npm run test:watch     # vitest in watch mode
npx vitest run tests/contract   # the SPEC §12 per-part gate
npx vitest run tests/tools      # writes preview/*.svg for a headless look
```

`dev:lan` is for iterating on the artwork and the interface against a real finger. It cannot
prove the offline criterion: a service worker needs HTTPS or `localhost`, so there is none over
`http://` on the LAN. Validate installing and running offline against the deployed URL.

`npm run verify` is exactly what the pre-commit hook and CI run. If it passes locally, CI passes.

## Deployment

GitHub Pages, public URL `https://fenrrir.github.io/giovanna_world/`.
Vite `base` is `/giovanna_world/` on build and `/` on dev. Pushing to `main` runs the quality
job and deploys. Watch a run with `gh run watch --exit-status`.
