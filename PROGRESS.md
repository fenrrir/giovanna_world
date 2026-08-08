# PROGRESS

The session entry point. Read this before anything else, act on **Next up**, update it before you stop.

## How to resume

1. Read [CLAUDE.md](CLAUDE.md) — the art and engineering contract.
2. Read **Next up** below.
3. Run `npm run verify` to confirm you are starting from a green tree.
4. Work the task, then update the **Status** table and **Next up** in the same commit.

## Next up

**Phase 2 has started.** Randomise is done. The next item on the list below is drag and drop
(SPEC §13), which the long-press work already laid pointer groundwork for.

The iPad validation is still owed: four of the nine acceptance criteria in SPEC §17 are verified,
and of the five still open, four need the device and the last needs the child.

## Status

Plan: [docs/plans/2026-08-08-paper-doll-mvp.md](docs/plans/2026-08-08-paper-doll-mvp.md)

Phase 1 is complete: foundation, engine, interface, PWA, deployment and all twelve wearable
parts. The app is live at **https://fenrrir.github.io/giovanna_world/** with 565 tests and
100% line, statement and function coverage.

| #   | Task                                                                    | Status |
| --- | ----------------------------------------------------------------------- | ------ |
| 1   | Repository bootstrap and English documentation                          | done   |
| 2   | Vite + React 18 + TypeScript strict scaffold                            | done   |
| 3   | Quality pipeline (lint, format, tests, 95% coverage, husky, commitlint) | done   |
| 4   | Domain model — slots, types, palettes, anchors                          | done   |
| 5   | `lib/color.ts` — `shade` helper                                         | done   |
| 6   | `lib/patterns.ts` — procedural SVG pattern generators                   | done   |
| 7   | `lib/debounce.ts`, `lib/storage.ts`, `model/defaults.ts`                | done   |
| 8   | `model/sanitize.ts` and `model/reducer.ts`                              | done   |
| 9   | `render/resolve.ts`, `Doll.tsx`, `Thumb.tsx`                            | done   |
| 10  | Base body, registry and SPEC §12 contract tests                         | done   |
| 11  | Art part — `hair.bob-fringe`                                            | done   |
| 12  | Art part — `top.t-shirt`                                                | done   |
| 13  | Art part — `bottom.skirt`                                               | done   |
| 14  | Art part — `shoes.sneakers`                                             | done   |
| 15  | i18n module with pt-BR catalogue                                        | done   |
| 16  | `state/LookContext` with debounced autosave                             | done   |
| 17  | Child UI — `SlotBar`, `PartTray`, `ColorTray`, `App` layout             | done   |
| 18  | `/dev/sheet` contact sheet quality tool                                 | done   |
| 19  | PWA — offline precache, manifest and iOS icons                          | done   |
| 20  | CI and GitHub Pages deployment                                          | done   |
| 21  | Progress record and acceptance review                                   | done   |

### Decisions worth knowing

- **TypeScript is pinned to 5.9, not 7.** `typescript-eslint` supports `<6.1.0`, and type-aware
  linting is what enforces the SOLID and clean-code rules. Revisit when the plugin catches up.
- **ESLint is pinned to 9, not 10** — `eslint-plugin-jsx-a11y` does not support 10 yet.
- **`src/main.tsx` is the only production file outside the coverage gate.** It is
  `createRoot(...).render(...)` with no branch to assert.
- **No routing library.** The dev sheet lives at the `#/dev/sheet` hash, because GitHub Pages
  cannot rewrite paths and the game has exactly one level of navigation.

## Phase 1 parts

All twelve are drawn and registered. SPEC §16 asks for one per session, and that held: every
part below was drawn, rendered and looked at before the next was started.

| Tray   | Parts                                                          |
| ------ | -------------------------------------------------------------- |
| Hair   | `bob-fringe`, `long-wavy`, `twin-buns`                         |
| Top    | `t-shirt`, `polka-dot-dress`, `striped-sweatshirt`, `tank-top` |
| Bottom | `skirt`, `jeans`, `shorts`                                     |
| Shoes  | `sneakers`, `mary-janes`                                       |

`top.polka-dot-dress` is the only one that declares `hides`, so it is the part that exercises the
render's hiding rule end to end.

### What drawing them taught

Every visual defect in this project came from one of these, and none was caught by an assertion.
The contract suite proves a part is anchored, in bounds and recolourable; it cannot tell you the
piece looks right. Read these before drawing a new part:

- **Derive an edge from the anchor it has to meet, never by eye.** Skin showed four separate
  times — the shoe inner edge, the dress straps, the trouser hem, the hair temples — each time
  because a number was chosen to look right rather than computed from the leg, shoulder or skull
  it had to cover.
- **A back layer needs no cut-out for the body.** `hairBack` renders behind the doll, so the body
  already occludes it. A notch cut "for the neck" is duplicate work, and wherever it runs wider
  than the torso it becomes a hole.
- **Frame the face with one shape.** A thin fringe plus separate temple locks leaves the outer
  edge of the skull showing between them. Both long hairstyles ended up as a single horseshoe.
- **Two curves meeting at a point make a point.** A centre parting drawn as two sweeps converging
  on the crown gives a widow's peak whatever the curvature; the hairline has to be one arc.
- **Give a limb its own tone.** Arms and sleeves drawn in the body colour merge into the torso
  and the silhouette becomes one flat block.
- **Do not round all four corners of a garment edge.** `rx` on a `rect` curves the corner away
  from the limb underneath and opens a gap at the join.
- **Mirror by writing both sides out.** Parameterising the mirror with sign arithmetic produced
  geometry that silently collapsed, leaving the doll sleeveless while every assertion passed.

## Phase 2

**Done:** randomise. A long press on the die replaces the whole outfit — SPEC §4 requires a hold
rather than a tap for the one control that throws away what the child made. `useLongPress` is
reusable and is the pointer groundwork drag and drop will build on.

### Still deferred

Not built, deliberately. Each is real scope, recorded so nothing is lost — but no stub exists in the source.

| Item                                                                 | Where the spec puts it |
| -------------------------------------------------------------------- | ---------------------- |
| Drag and drop from tray to doll (`setPointerCapture`)                | SPEC §13, Phase 2      |
| `look:saved` — gallery of up to 12 saved looks                       | SPEC §14, Phase 2      |
| Optional WebAudio click with a persisted mute toggle                 | SPEC §13, Phase 2      |
| Slots `socks`, `outer`, `accessoryFace`, `accessoryHead`, `handheld` | SPEC §7, Phase 2       |
| Background scenes                                                    | SPEC §15, Phase 3      |
| PNG export                                                           | SPEC §15, Phase 3      |
| A second character in the same scene                                 | SPEC §15, Phase 3      |

The slot taxonomy and z-order already cover the Phase 2 slots (SPEC §7), so adding them later is
registering parts, not reshaping the model.

## MVP acceptance checklist

From SPEC §17. Ticked only where actually verified; the rest name the exact step still owed.

Four of the nine are done. The five open ones all need the iPad — install it from
https://fenrrir.github.io/giovanna_world/ and work down the list. `npm run dev:lan` is faster for
iterating but cannot answer the offline one; see the README for which criteria it can prove.

- [ ] **Installs from the iPad home screen and opens full screen, without an address bar.**
      Needs the iPad: Safari → https://fenrrir.github.io/giovanna_world/ → Share → Add to Home
      Screen, then open from the home screen. The manifest declares `display: standalone` and
      `start_url: /giovanna_world/`, and the iOS meta tags are in `index.html`.
- [ ] **Works with the iPad in aeroplane mode, from load through to autosave.**
      Verified on the live site that the service worker registers and reaches `activated`, and
      that its Workbox precache holds all 12 runtime entries — `index.html`, the JS bundle, the
      CSS, the manifest and every icon. Autosave was seen writing `look:current`. What is still
      untested is the last step: cut the network and reload.
- [x] **Not a single word in the game's interface.** Asserted mechanically: the dress-up
      integration test dresses the doll from every tray and then requires the whole rendered tree
      to contain no text at all, with every control named through `aria-label`.
- [x] **Every touch target is at least 60×60 px.** Measured on the live site in a real browser at
      both 1280×720 and 768×1024: all nine controls are 68×68 or 70×70, and the smallest gap
      between any two is 10 px. The layout also holds at both widths, covering the 768–1366 range.
- [ ] **No elastic overscroll bounce and no accidental double-tap zoom.** `overscroll-behavior:
none` and `touch-action: manipulation` are in `src/styles/global.css`; needs the iPad.
- [ ] **Holding a finger on the doll does not open Safari's context menu.**
      `-webkit-touch-callout: none` is set; needs the iPad.
- [x] **The 12 parts pass the 6 criteria from SPEC §12.** All twelve are built and checked
      automatically by `tests/contract/registry.test.tsx`, in every colour of their palette. The
      suite was verified to actually fail on a hardcoded tone, a coordinate outside the viewBox
      and a forbidden gradient, so a pass means something. Each was also looked at before being
      called done — see the list above for what that caught.
- [x] **Closing and reopening the app preserves the character.** Covered by the look-store
      integration tests: hydrate, reconcile against the registry, 300 ms debounced write, and a
      flush on unmount so the last change survives the app closing.
- [ ] **A six-year-old can change hair, clothes and colour with no verbal instruction.**
      Only the child can answer this one.
