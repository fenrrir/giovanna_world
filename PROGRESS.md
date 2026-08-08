# PROGRESS

The session entry point. Read this before anything else, act on **Next up**, update it before you stop.

## How to resume

1. Read [CLAUDE.md](CLAUDE.md) — the art and engineering contract.
2. Read **Next up** below.
3. Run `npm run verify` to confirm you are starting from a green tree.
4. Work the task, then update the **Status** table and **Next up** in the same commit.

## Next up

**Draw `top.polka-dot-dress`** — the first part in the backlog below, and the only one that
exercises `hides`. One part per session (SPEC §16).

## Status

Plan: [docs/plans/2026-08-08-paper-doll-mvp.md](docs/plans/2026-08-08-paper-doll-mvp.md)

Foundation, engine, interface, PWA and deployment are done. The app is live at
**https://fenrrir.github.io/giovanna_world/** with 349 tests and 100% coverage.

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

## Phase 1 part backlog

SPEC §15 puts **12 parts** in Phase 1. Four are built — one per tray — leaving the eight below.
Build **one per session**: SPEC §16 warns that a batch generated in one go comes out inconsistent
between the parts.

The contract suite in `tests/contract/registry.test.tsx` checks every new part automatically
against the six criteria of SPEC §12, so a new piece of artwork needs no test of its own. It has
been verified to actually fail on a hardcoded tone, a coordinate outside the viewBox, and a
forbidden gradient.

Paste-ready prompts:

1. **`top.polka-dot-dress`** — _build this one first; it is the only backlog part that exercises `hides`._

   > Create the part `top.polka-dot-dress` following `SPEC.md` sections 8 and 9.
   > Description: a sleeveless A-line dress with a fitted bodice and a flared skirt, covered in evenly spaced polka dots.
   > Relevant anchors: shoulders (282,216) and (398,216), waist y280, skirt hem y398 within x 234–446.
   > It must declare `hides: ['bottom']`. Dots come from `dots()` in `lib/patterns.tsx`.
   > Register it in `parts/registry.ts` and show it to me in `/dev/sheet`.

2. **`hair.long-wavy`**

   > Create the part `hair.long-wavy` following `SPEC.md` sections 8 and 9.
   > Description: long wavy hair falling past the shoulders, with a centre parting.
   > Relevant anchors: skull top (340,68), head centre (340,130) r62, shoulders (282,216) and (398,216).
   > Register it in `parts/registry.ts` and show it to me in `/dev/sheet`.

3. **`hair.twin-buns`**

   > Create the part `hair.twin-buns` following `SPEC.md` sections 8 and 9.
   > Description: two round buns high on the head with a soft fringe.
   > Relevant anchors: skull top (340,68), head centre (340,130) r62, centre head-accessory mount (340,66).
   > Register it in `parts/registry.ts` and show it to me in `/dev/sheet`.

4. **`top.striped-sweatshirt`**

   > Create the part `top.striped-sweatshirt` following `SPEC.md` sections 8 and 9.
   > Description: a loose long-sleeved sweatshirt with horizontal stripes and a ribbed hem.
   > Relevant anchors: shoulders (282,216) and (398,216), arms x266–294 and x386–414 down to y338, waist y280.
   > Stripes come from `stripes()` in `lib/patterns.tsx`.
   > Register it in `parts/registry.ts` and show it to me in `/dev/sheet`.

5. **`top.tank-top`**

   > Create the part `top.tank-top` following `SPEC.md` sections 8 and 9.
   > Description: a fitted sleeveless tank top with narrow straps.
   > Relevant anchors: neck base y198 x322–358, shoulders (282,216) and (398,216), waist y280.
   > Register it in `parts/registry.ts` and show it to me in `/dev/sheet`.

6. **`bottom.jeans`**

   > Create the part `bottom.jeans` following `SPEC.md` sections 8 and 9.
   > Description: full-length trousers with a waistband, a centre seam and turned-up cuffs.
   > Relevant anchors: waist y280 (band x284–396 h18), hip y330, legs x306–336 and x344–374, ankle y440.
   > Register it in `parts/registry.ts` and show it to me in `/dev/sheet`.

7. **`bottom.shorts`**

   > Create the part `bottom.shorts` following `SPEC.md` sections 8 and 9.
   > Description: mid-thigh shorts with a waistband and a soft fold at each hem.
   > Relevant anchors: waist y280, hip y330, legs x306–336 and x344–374, hem around y390.
   > Register it in `parts/registry.ts` and show it to me in `/dev/sheet`.

8. **`shoes.mary-janes`**
   > Create the part `shoes.mary-janes` following `SPEC.md` sections 8 and 9.
   > Description: rounded flat shoes with a single strap across the instep and a small buckle.
   > Relevant anchors: left shoe x296–344 y464–494, right shoe x336–384 y464–494, sole y494.
   > The two shoe boxes overlap by 8 px; pull each shoe back from the centre line or the pair
   > reads as one wide platform.
   > Register it in `parts/registry.ts` and show it to me in `/dev/sheet`.

## Deferred by YAGNI

Not built, deliberately. Each is real scope, recorded so nothing is lost — but no stub exists in the source.

| Item                                                                 | Where the spec puts it |
| -------------------------------------------------------------------- | ---------------------- |
| Drag and drop from tray to doll (`setPointerCapture`)                | SPEC §13, Phase 2      |
| `look:saved` — gallery of up to 12 saved looks                       | SPEC §14, Phase 2      |
| `randomize` reducer action and its long-press button                 | SPEC §4 / §15, Phase 2 |
| Optional WebAudio click with a persisted mute toggle                 | SPEC §13, Phase 2      |
| Slots `socks`, `outer`, `accessoryFace`, `accessoryHead`, `handheld` | SPEC §7, Phase 2       |
| Background scenes                                                    | SPEC §15, Phase 3      |
| PNG export                                                           | SPEC §15, Phase 3      |
| A second character in the same scene                                 | SPEC §15, Phase 3      |

The slot taxonomy and z-order already cover the Phase 2 slots (SPEC §7), so adding them later is
registering parts, not reshaping the model.

## MVP acceptance checklist

From SPEC §17. Ticked only where actually verified; the rest name the exact step still owed.

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
- [ ] **The 12 parts pass the 6 criteria from SPEC §12.** 4 of 12 built, all passing the contract
      suite. Eight remain in the backlog above.
- [x] **Closing and reopening the app preserves the character.** Covered by the look-store
      integration tests: hydrate, reconcile against the registry, 300 ms debounced write, and a
      flush on unmount so the last change survives the app closing.
- [ ] **A six-year-old can change hair, clothes and colour with no verbal instruction.**
      Only the child can answer this one.
