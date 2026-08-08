# PROGRESS

The session entry point. Read this before anything else, act on **Next up**, update it before you stop.

## How to resume

1. Read [CLAUDE.md](CLAUDE.md) — the art and engineering contract.
2. Read **Next up** below.
3. Run `npm run verify` to confirm you are starting from a green tree.
4. Work the task, then update the **Status** table and **Next up** in the same commit.

## Next up

**Task 2 — Vite + React 18 + TypeScript strict scaffold.**
See `docs/plans/2026-08-08-paper-doll-mvp.md` for the step-by-step.

## Status

Plan: [docs/plans/2026-08-08-paper-doll-mvp.md](docs/plans/2026-08-08-paper-doll-mvp.md)

| #   | Task                                                                    | Status      |
| --- | ----------------------------------------------------------------------- | ----------- |
| 1   | Repository bootstrap and English documentation                          | in progress |
| 2   | Vite + React 18 + TypeScript strict scaffold                            | pending     |
| 3   | Quality pipeline (lint, format, tests, 95% coverage, husky, commitlint) | pending     |
| 4   | Domain model — slots, types, palettes, anchors                          | pending     |
| 5   | `lib/color.ts` — `shade` helper                                         | pending     |
| 6   | `lib/patterns.ts` — procedural SVG pattern generators                   | pending     |
| 7   | `lib/debounce.ts`, `lib/storage.ts`, `model/defaults.ts`                | pending     |
| 8   | `model/sanitize.ts` and `model/reducer.ts`                              | pending     |
| 9   | `render/resolve.ts`, `Doll.tsx`, `Thumb.tsx`                            | pending     |
| 10  | Base body, registry and SPEC §12 contract tests                         | pending     |
| 11  | Art part — `hair.bob-fringe`                                            | pending     |
| 12  | Art part — `top.t-shirt`                                                | pending     |
| 13  | Art part — `bottom.skirt`                                               | pending     |
| 14  | Art part — `shoes.sneakers`                                             | pending     |
| 15  | i18n module with pt-BR catalogue                                        | pending     |
| 16  | `state/LookContext` with debounced autosave                             | pending     |
| 17  | Child UI — `SlotBar`, `PartTray`, `ColorTray`, `App` layout             | pending     |
| 18  | `/dev/sheet` contact sheet quality tool                                 | pending     |
| 19  | PWA — offline precache, manifest and iOS icons                          | pending     |
| 20  | CI and GitHub Pages deployment                                          | pending     |
| 21  | Progress record and acceptance review                                   | pending     |

## Phase 1 part backlog

SPEC §15 puts **12 parts** in Phase 1. Tasks 11–14 build the first four (one per tray), leaving
the eight below. Build **one per session** — SPEC §16: a batch generated in one go comes out
inconsistent between the parts.

Paste-ready prompts:

1. **`bottom.polka-dot-dress`** — _build this one first; it is the only backlog part that exercises `hides`._

   > Create the part `top.polka-dot-dress` following `SPEC.md` sections 8 and 9.
   > Description: a sleeveless A-line dress with a fitted bodice and a flared skirt, covered in evenly spaced polka dots.
   > Relevant anchors: shoulders (282,216) and (398,216), waist y280, skirt hem y398 within x 234–446.
   > It must declare `hides: ['bottom']`. Dots come from `dots()` in `lib/patterns.ts`.
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
   > Stripes come from `stripes()` in `lib/patterns.ts`.
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

From SPEC §17. Tick only what has actually been verified.

- [ ] Installs from the iPad home screen and opens full screen, without an address bar.
- [ ] Works with the iPad in aeroplane mode, from load through to autosave.
- [ ] Not a single word in the game's interface.
- [ ] Every touch target is at least 60×60 px.
- [ ] No elastic overscroll bounce and no accidental double-tap zoom.
- [ ] Holding a finger on the doll does not open Safari's context menu.
- [ ] The 12 parts pass the 6 criteria from SPEC §12.
- [ ] Closing and reopening the app preserves the character.
- [ ] A six-year-old can change hair, clothes and colour with no verbal instruction.
