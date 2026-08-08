# PROGRESS

The session entry point. Read this before anything else, act on **Next up**, update it before you stop.

## How to resume

1. Read [CLAUDE.md](CLAUDE.md) — the art and engineering contract.
2. Read **Next up** below.
3. Run `npm run verify` to confirm you are starting from a green tree.
4. Work the task, then update the **Status** table and **Next up** in the same commit.

## Next up

**Phase 2 in progress.** Randomise, drag-and-drop, taking a piece off, the zoom slider, the
scrolling tray bar, the free colour picker, `accessoryHead` (one bow), the face — eyebrows, mouth
and cheeks — and the **parametric hair generator** are done. Next on the list below: the three
remaining Phase 2 slots (`socks`, `outer`, `handheld`), which need artwork, or the saved-looks
gallery, which needs a design decision first — see the note there.

**Three parametric slots now: the hairstyle, the jacket and the socks.** The jacket is reachable — its own tray,
its own axes, and the panel that shapes it is the same component the hairstyle uses.

**What the second slot revealed.** Not a shared params type: the two modules came out the same
shape without sharing a line, and the only genuinely common thing is repairing whatever storage
handed back — four lines either side, not worth a type. What did want extracting is `ShapedFamily`
in `src/ui/shaped.tsx`: a family named by its axis _names_, never by the shape of its params. The
panel typed to `HairParams` could only ever have served hair; the jacket would have needed a second
panel identical but for three words.

The geometry builders were left alone on purpose, and that still looks right — nothing above them
needs to know what an axis means in user units.

Adding a parametric slot is now: a params module, a geometry module, one `ShapedFamily`, one tray
entry. The socks were built that way and `ShapedFamily` needed no change at all, which is the first
evidence the shape is right rather than merely fitting two cases.

The socks also showed that `choice` earns its place: a pattern has no order to slide along, so a
slider between dots and stripes would have to stop somewhere in the middle and draw nothing. Their
print comes from `lib/patterns`, which emits a shape only where one fits — wind them down to the
ankle and they print fewer stripes rather than spilling onto the shin. The labels in a family are spelled out rather than built from the axis name, so a
missing catalogue entry is a compile error instead of a key printed on screen.

Two things that only bite in this slot: `outer` paints at z 60, over the body, so **no collar may
rise above the jaw** or it covers her face — the hood is a roll lying back on the shoulders, and a
test holds all three collars below the chin. And the outer tray is off the dice, because its only
piece is one she shapes and the randomiser never lands on those; turn `randomised` on the day a
ready-made jacket joins it.

The generator is the mould for the second parametric slot, and the second slot is what will reveal
the right abstraction. Deliberately nothing generic was built for it: `hair.custom` is hair and
nothing else. When the time comes, the pieces that will want generalising are `TrayItem.shaped`
and `HairParamsPanel`, not the builders.

The iPad validation is still owed: four of the nine acceptance criteria in SPEC §17 are verified,
and of the five still open, four need the device and the last needs the child.

## Status

Plan: [docs/plans/2026-08-08-paper-doll-mvp.md](docs/plans/2026-08-08-paper-doll-mvp.md)

Phase 1 is complete: foundation, engine, interface, PWA, deployment and all twelve wearable
parts. The app is live at **https://fenrrir.github.io/giovanna_world/** with 1740 tests and
100% line and function coverage.

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

**Randomise.** A long press on the die replaces the whole outfit — SPEC §4 requires a hold rather
than a tap for the one control that throws away what the child made.

**Drag and drop.** A piece can be dragged from the tray onto the doll, or still just tapped. The
pointer is captured on the way down so the piece keeps following the finger off the button, and
the drop target is the whole stage rather than the piece's own region — a six-year-old aiming a
sleeve at a shoulder would miss every time. A piece released short of the stage fades back inside
the 120 ms the spec allows.

The piece is applied on release, not on press. Applying on press would have made the drag
decorative: the piece would already be on the doll before the child had moved it anywhere.

**Taking a piece off.** Drag it off the doll and let go outside the stage. Until this there was no
way to undress at all — every tray swapped one piece for another, so a shoe once put on could only
be exchanged for a different shoe.

Which piece comes off is decided by the browser's own hit test, so it is per-pixel: the child has
to touch painted artwork, not merely the piece's bounding box. That is the right behaviour — the
hairstyles are horseshoes, and the middle of their box is the face — but it is worth watching on
the iPad with a real finger, on the thinner pieces especially.

Two known limits, recorded rather than hidden. Removal is drag-only, so there is no keyboard path
to it, unlike every other control. And the randomiser always fills every tray, so it can never
produce a doll that is deliberately barefoot — now that accessories are trays too, every random
look also arrives wearing a bow.

**Zooming.** A slider under the doll crops the canvas toward the doll's own width. The lateral
margin the art contract insists on (SPEC §8) is what made the drawing small on a tall stage; the
zoom takes that margin back without touching the artwork. Full height is kept at every setting, so
the doll is never cropped, and the closest setting is exactly the doll's width rather than a number
chosen to feel right.

It is deliberately not saved. `Look` is fixed at schemaVersion 1 by SPEC §7 and zoom is not part of
an outfit, so it resets on reload rather than earning a second storage key.

**`accessoryHead` — the first Phase 2 slot.** Adding it cost one line in the registry, one entry in
the tray table and one anchor band in the contract suite. Worth knowing for the four still to come:
the tray table is keyed by tray, so a new tray is a compile error until it is defined, and the
contract suite picks the artwork up with no test written for it.

**The face.** Eyebrows, mouth and cheeks are parts in their own slots, in the gap the spec left
above the body: over the skin so they show, under the fringe so a hairstyle covers the brows. They
sit in a fourth palette, `makeup`, and `FIXED_COLORS` now holds only what the child never picks.

They are _painted_, not worn — `PAINTED_SLOTS` in the slot model names the idea, and the drag that
undresses, the sanitiser and the default look all read it. A doll with no mouth reads as broken
rather than as undressed, so a stored look missing one gets it back silently instead of the schema
being bumped and her outfit discarded.

**Randomise builds on the current look**, not on the default, and replaces only the outfit trays.
Skin, face and accessories are hers. Rebuilding from the default while skipping those trays would
have reset them without ever looking like a bug — the thing to check when adding a tray is which
side of that line it falls on.

**The tray bar scrolls sideways** rather than wrapping, with chevrons at the ends. What exposed the
bug that made it necessary was the randomise button being clipped: a grid item will not shrink below
its content without `min-width: 0`, so the bar grew past the panel _and_ never overflowed inside
itself, which is the condition the chevrons look for.

**Colours are a free picker now**, not six swatches — the platform's own, for the skin and for the
open tray. The palettes stay as what a new piece arrives wearing and what the randomiser draws from.
The cost, accepted deliberately: on iOS that picker is a modal sheet with words in it, and it is the
only text in the game.

**The parametric hair generator.** The last entry of the hair tray is not a hairstyle but a family:
pure builders turn four axes — length, volume, wave, fringe — into path data, with every coordinate
derived from `anchors.ts`. Choosing it dresses the doll and opens the sliders that shape it. The
full contract is SPEC §7a; what is worth carrying forward:

- **The axes ride in `Look`**, as an optional `params` on the equipped entry, and reach the artwork
  through `PartLookup` — the one seam both `sanitizeLook` and `resolveLayers` already funnel
  everything through. `Part.render` is untouched, so no other layer learned that parametric pieces
  exist, and `sanitize.ts` needed no change at all: it already copies each entry wholesale.
- **`schemaVersion` stays 1.** The field is purely additive, so a look stored before the generator
  existed reads back unchanged. A bump would have thrown away the outfit she is wearing.
- **`findPart` builds from params only when params arrive.** A paramless lookup falls through to
  the index, because the contract suite asserts `findPart(slot, id)` is the very object
  `PARTS_BY_SLOT` holds, and a part rebuilt per call could never satisfy that.
- **The panel has no open state.** It is on screen exactly while the generated hairstyle is worn.
  That is not a shortcut — it is what keeps a second surface inside SPEC §4's one level of
  navigation, with no modal and nothing to go back from.
- **It is the only place in the game with words**, by decision (SPEC §4). Three unlabelled sliders
  are indistinguishable to a non-reader. A test pins the exception at exactly its granted size.
- **The dice do not touch it.** `randomLook` draws from `trayItems`, so without the `shaped` flag a
  roll would open an editor she never asked for — and having no axes to offer, it could only ever
  draw the piece at its defaults.
- **The hair tray can no longer be empty.** The generated hairstyle needs no artwork, so it exists
  with the registry stripped bare. Two tests that used hair as the example of an empty tray now use
  `accessoryHead`.

What the drawing taught, on top of the Phase 1 list — all three passed 1350 assertions and were
obvious the moment the doll was rendered:

- **A face opening must stay open at the jaw.** Running the inner edge back to the outer one closed
  the shape across the chin and both cheeks vanished under the hair.
- **One `Z` can only shut one foot.** With two side strands, closing the path once left them
  different shapes. Mirroring has to be written out, again.
- **An axis has to taper as it grows.** Held at full width all the way down, long hair at full
  volume stopped reading as hair and became a slab with the doll sitting inside it.

`tests/tools/renderAxes.test.tsx` writes `preview/hair-*.svg` across every axis. The tray and
`/dev/sheet` only ever show the single point of the parameter space she is wearing; nothing else
would have put the extremes in front of a pair of eyes.

### Still deferred

Not built, deliberately. Each is real scope, recorded so nothing is lost — but no stub exists in the source.

| Item                                                 | Where the spec puts it |
| ---------------------------------------------------- | ---------------------- |
| `look:saved` — gallery of up to 12 saved looks       | SPEC §14, Phase 2      |
| Optional WebAudio click with a persisted mute toggle | SPEC §13, Phase 2      |
| Slots `socks`, `outer`, `accessoryFace`, `handheld`  | SPEC §7, Phase 2       |
| Background scenes                                    | SPEC §15, Phase 3      |
| PNG export                                           | SPEC §15, Phase 3      |
| A second character in the same scene                 | SPEC §15, Phase 3      |

The slot taxonomy and z-order already cover the Phase 2 slots (SPEC §7), so adding them later is
registering parts, not reshaping the model.

**The gallery's design decision is settled, and the scrolling tray bar is what settled it.** A
list of saved looks wanted to be a second surface; it does not have to be one. The album is simply
another tray. Tap it and the piece row shows her saved looks instead of pieces; tap one and she
wears it. Same mechanism as everything else, exactly one level, no modal — the rule did not have
to move.

The storage half is done: `look:saved`, twelve slots, newest first, in `lib/storage.ts` with
`withSavedLook` pure beside it. Two behaviours worth knowing, both tested:

- Keeping the same look twice only moves it to the front. Twelve slots are too few to spend two on
  one outfit, and a child pressing the button again is not asking for a duplicate.
- A stored entry that no longer parses costs her that entry, not the album. `loadLook` returns null
  for the whole of `look:current` when it is unreadable; an album must not lose eleven good outfits
  over one bad one.

Past twelve the oldest falls off the end, which is deliberately why there is no delete: the album
empties itself, and a delete gesture is one more thing to explain to someone who cannot read.

**Still to build:** the tray itself — a `saved` tray whose items are looks rather than parts, and
the gesture that keeps one. `TrayItem` assumes a part today, so that is the join to look at. The
keep gesture should be a thumbnail inside that tray, not a button elsewhere; it is not the save
button SPEC §4 forbids, which is about the current look needing to be saved at all.

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
