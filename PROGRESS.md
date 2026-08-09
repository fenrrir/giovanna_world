# PROGRESS

The session entry point. Read this before anything else, act on **Next up**, update it before you stop.

## How to resume

1. Read [CLAUDE.md](CLAUDE.md) — the art and engineering contract.
2. Read **Next up** below.
3. Run `npm run verify` to confirm you are starting from a green tree.
4. Work the task, then update the **Status** table and **Next up** in the same commit.

## Next up

**Phase 4 in progress: the world.** Plan at
[docs/plans/2026-08-08-world.md](docs/plans/2026-08-08-world.md) — a map, locations holding several
environments each, and a doll you put inside one. **Tasks 1 to 4 are done.** The scene is a place
now, both dolls stand in rooms, and tapping one dresses her. Next is task 5, the map — the first
drawing the world asks for, and the thing that makes a location mean something on screen.

Read that plan before touching anything: it carries the one thing this repository could not have
told you, which is that **deleting a slot from the taxonomy crashes rather than repairing on read**
— see the section below.

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

**The iPad validation is closed. All nine acceptance criteria in SPEC §17 are verified**, the last
four on the device itself — installing to the home screen, aeroplane mode, the iOS gesture
hardening, and the child dressing the doll with nobody telling her how. Nothing in the MVP is owed
any more; what is left below is Phase 3 and the deferred list.

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

**Randomise builds on the current look**, not on the default. It undresses her first, then dresses
her again: skin and face are hers and stay, everything worn comes off and is decided afresh.

A tray declares how the dice treat it — `always` for the outfit, `sometimes` for a jacket, socks, a
bow, a bag, `never` for the face. `sometimes` is what makes an accessory able to come _off_: with
only "replace" and "leave alone" there was no roll that removed one, so a jacket worn once stayed on
for good.

**The dice roll a generated piece's axes too.** They used to skip generated pieces, and the reason
was sound then — landing on one could only have drawn it at its default axes, a fixed piece wearing
a disguise. Rolling the axes is what makes one worth landing on, and it is the only way a jacket can
appear at all, since the only jacket there is is generated.

The first version left the non-randomised trays alone instead of clearing them, which sounded like
the same thing and was not. Nothing the dice do not own could ever come _off_ — a jacket worn once
was on for good, through every roll, and dragging it off was the only way back. The rule that works
is not "leave what the dice do not own", it is **painted stays, worn goes**. Rebuilding from the default while skipping those trays would
have reset them without ever looking like a bug — the thing to check when adding a tray is which
side of that line it falls on.

**The tray bar scrolls** rather than wrapping, with chevrons at the ends. What exposed the bug that
made it necessary was the randomise button being clipped: a grid item will not shrink below its
content without `min-width: 0`, so the bar grew past the panel _and_ never overflowed inside itself,
which is the condition the chevrons look for. (It ran sideways until Phase 3 stood the controls on
their side; the same `ScrollRail` runs down the screen now.)

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

## Phase 3

**Background scenes.** `scene` is a slot at z -10, behind everything, with a meadow and a bedroom in
it. A further scene is one file and one registry line. It is a tray like any other, so choosing and recolouring came free.

It is the first part that is neither worn nor the doll, and that showed up in the contract. The
lateral margin is a rule about things worn on a doll; a backdrop that stopped at her shoulders would
be a poster she is standing next to. So `scene` is exempt from it, and owes the opposite instead —
`FILLS_CANVAS` in the contract suite holds it to covering the whole canvas, or the stage shows
through at an edge.

It still takes one colour like every other part: she picks the sky and the ground follows it down a
tone. That keeps a green afternoon and a violet evening in the same drawing, at the cost of a scene
reading close to monochrome. Worth revisiting only if a scene ever needs two unrelated colours.

**The second character is started: the model is done, the interface is not.**

Two decisions were taken and are settled. The backdrop belongs to the **stage**, not to either doll
— shared it belonged to neither, owned it meant switching dolls changed the sky. And she chooses who
she is dressing by **tapping that doll on the stage**, which needs no new control and reuses the hit
test the undressing drag already has.

`Stage` in `src/model/stage.ts` holds the pair, the backdrop and which one her taps dress. `Look` is
untouched by the move: it still describes one person from skin to bag, so the trays, the album, the
randomiser and the drag go on reading exactly what they read before. That is what keeps the
remaining work to the shell rather than through the whole app.

Stored at `stage:current`, schemaVersion 2. **A look from before is not migrated**, deliberately: one
look could have become the first doll, but the backdrop left the look in the same change, so a
migration would have to guess which of two dolls a sky belonged to. She loses one outfit, once.

`stageReducer` is done too, and it is where the shape of the rest was decided. Every action a tray
already dispatches arrives wrapped in `dress` and goes straight to `lookReducer`, unchanged, against
whichever doll she is dressing. `lookReducer` never learns there are two dolls and neither does
anything that dispatches to it. Only two actions are the stage's own — who she is dressing, and the
sky — because they are the two a `Look` cannot answer.

**Still to build**, all of it in the shell:

- `LookProvider` becomes a stage provider over `stageReducer`. `useLook()` keeps its shape and hands
  back the dressed doll, so nothing downstream changes. Watch for two things when doing it:
  `loadLook`/`saveLook` fall out of use and should go with it rather than linger, and the scene tray
  has to stop dispatching `applyPart` and start dispatching `setScene`.
- The stage renders the scene once, then both dolls side by side. Each doll needs its own transform
  — the canvas is one doll wide, so two of them need placing.
- Tapping a doll sets `dressing`. The mark on the active one has to be visible without being text.
- `scene` stops being read from `Look.equipped`; the scene tray writes `Stage.scene`.

**PNG export is out of the plan**, by decision rather than deferral — it is not waiting for a
session, it is not wanted. What closes Phase 3 is the second character's shell.

### The controls stand on their side now

The backdrop is what exposed the layout: two equal halves gave a scene the child chose at most half
the window. The trays and the pieces are vertical rails down the right-hand edge instead, and the
stage is everything left over — 1146 px of 1366 where it used to be 665.

**Only the stage is an explicit grid track.** `.app` is `grid-auto-flow: column` over a single
`minmax(0, 1fr)`, and every rail lands in an implicit `auto` column. That is the whole mechanism
behind the axes panel retracting: a column that is not rendered leaves no empty track and no gap
behind it, so the scene takes the width back the instant she stops shaping something. Declaring
three fixed columns and collapsing one to zero would have left its gap on screen for ever.

`PartTray` returns the axes and the pieces as a **fragment**, which is how both reach that grid as
sibling columns without a wrapper between them. It also meant `shaping` did not have to move: it
still lives in a component `App` keys by tray, which is what tells her tap from a roll of the dice.
The axes are emitted first, so the order she reads the columns in is the order a keyboard walks
them.

Three things fell out of it:

- **The colours belong with the pieces.** `ColorTray` moved from `App` into `PartTray`, at the foot
  of the rail it paints. The die stayed with the trays, because it replaces the whole outfit rather
  than the piece any one tray holds.
- **The narrow-screen stack is gone.** Two rails cost about 200 px at any width, which is less than
  stacking the panel under the doll ever cost, so the `max-width: 900px` case had nothing left to
  buy.
- **`scroll-padding` has to match the rail's padding.** With `scroll-snap-type` and 8 px of padding
  and no scroll padding, the first thumbnail can only snap into place 8 px down, so the rail never
  rests at zero and a chevron pointed at nothing whenever it was long enough to scroll. It was there
  horizontally too, unnoticed, and only became obvious once the rail was tall.

**The one thing this trades away is iPad portrait.** At 768×1024 the scene renders 532×422 against
roughly 744×591 under the old stack — the rails cost proportionally more of a narrow window than a
wide one. It is a landscape game and landscape is where the whole gain is; the portrait case is
still functional, with no overflow and every target over 60 px.

## Phase 4 — the world

**Repair on read was never total. It only looked that way.** SPEC §7a promises that a stored look is
repaired rather than rejected, and that held for a part leaving the registry. It did not hold for a
_slot_ leaving the taxonomy, which is the very next thing this project does to `scene`:

- `findPart` is `INDEX[slot].get(partId)`, and `INDEX` is built from the keys of `PARTS_BY_SLOT`.
  Drop a slot and `INDEX[slot]` is `undefined`, so `.get` throws.
- `noUncheckedIndexedAccess` does not catch it. It governs index signatures and arrays, not
  `Record<FiniteUnion, X>`, which TypeScript models as known properties — the compiler is certain
  the Map is there.
- What let a departed name reach the lookup was `Object.entries(look.equipped) as [Slot, …][]`, in
  both `sanitizeLook` and `equippedLayers`. `isLook` validates the values of `equipped` and never
  its keys, so a stored name sails through storage untouched.
- `sanitizeLook` runs inside the store's lazy initialiser, so the failure is a **white screen on the
  iPad, holding the outfit she was wearing** — and no suite here would have seen it, because they
  all start from empty storage.

`isSlot` closes it, and both casts are gone rather than narrowed: `Object.entries` now gives back
the strings the object really has. The lesson generalises past `scene` — **a cast over stored data
is a lie the type checker will help you tell**, so check the name before handing it to anything
indexed by it.

**The album keeps the doll, not the room.** That was the reported bug and it is fixed, but the
interesting half was underneath. `loadSavedLooks` knows nothing of the registry by design, so a kept
entry carried whatever an older version could wear; `replaceLook` returned it verbatim, putting the
dead key straight back into live state and into the next autosave. Two consequences worth
remembering:

- Wearing a kept outfit used to move her — the backdrop came back with the clothes. `inCurrentScene`
  is what keeps the outfit hers and the room the stage's.
- Identity of a look is `canonicalJson`, not `JSON.stringify`. Once the album sanitises on read, the
  same outfit reaches the comparison spelled two ways — `sanitizeLook` rebuilds `equipped` in
  iteration order and fills the painted slots in last, while the reducer writes each piece as she
  puts it on. Compared raw, those are two outfits: the kept one never showed as worn and the star
  kept adding twins she could not tell apart.

`src/model/look.ts` is deliberately temporary. When `scene` leaves `Look` in task 4 of the plan it
is deleted, not rewritten — `sanitizeLook` will do the same job by itself. It has one caller outside
the album now, the migration in `openingWorld`; that call goes at the same time.

### `World` absorbed `Stage`, and three things were settled doing it

`Stage` was complete, tested and wired to nothing. It is now `World`, and `stage.ts`,
`stageReducer.ts` and their `stage:current` trio are gone. The wrapper it proved is kept whole: a
tray action arrives as `{ type: 'dress' }` and goes straight to `lookReducer`, which still has no
idea there is a world above it.

- **A place is one name, not two.** `here` is an `EnvironmentId` and the location is derived with
  `locationOf`. The plan had `{ locationId, environmentId }`, and two copies of one fact can
  disagree — this one is read on every tap, so the copy went.
- **`dressing` and `placements` are independent.** Dressing a doll is "whose taps land on her", not
  "who is standing here", so a doll can be dressed before she is ever put in a room. The single
  coupling is that **going anywhere stops the dressing**, which is also what makes the room
  thumbnail the way out of the wardrobe without a control of its own.
- **The stored shape is not the model shape**, and `StoredWorld` says so in the type system. `isWorld`
  checks that a world is a world; `repairWorld` checks that the rooms it names still exist. Splitting
  them is what lets a name from a later version cost her a backdrop instead of the whole world —
  and it keeps the compiler from calling the check unnecessary, which is how the task 1 bug hid.

`schemaVersion` is 3. Two was `Stage`'s and never shipped, so the gap is a number nobody has to
migrate from. `look:current` **is** migrated, once, into the first doll: the earlier decision not to
migrate it turned on having to guess which doll a sky belonged to, and the sky now belongs to
neither.

### `src/world/` is the art layer, and a place is not a part

`world/registry.ts` is to places what `parts/registry.ts` is to parts: the only import point, one
line per room. An `Environment` carries its artwork, the `floor` a doll stands on and the colour it
opens in — and it is deliberately **not** a `Part`. A part is worn and owes the lateral margin; a
place is where the doll is and owes the opposite. That is what lets `Slot` shed `scene` in the next
task instead of carrying a member that breaks every rule the others keep.

`ENVIRONMENTS_BY_ID` is keyed by `EnvironmentId`, so **naming a room in the taxonomy is a compile
error until it has something to draw**. It is the mechanism behind holding `house.livingRoom` back
until its own session.

The two backdrops that predate the world are borrowed rather than copied — one import line each from
`parts/scene/`, which is not deleted yet. Deleting it while `scene` is still a slot would leave the
tray empty for one commit and take her backdrops away; the artwork moves in whole when the slot goes.

**`x` runs over where her centre may be, not across the canvas.** That one choice in
`dollTransform` is what keeps the clamp honest at any size: a plain 0..1 across the canvas leaves
half of her outside it at either end, and the room would have to know how wide she is. At 0 her
declared bounds land exactly on the left edge, at 1 exactly on the right, at every scale — a test
pins it, and it is what makes the per-part lateral-margin rule mean something once a doll can be
stood in a corner.

**What looking at it showed.** `preview/place-*.svg` puts three dolls in a room at x 0, 0.5 and 1,
which answers the floor line, the size and the clamp in one image. Both inherited rooms are exactly
as they were — and that is the finding: **at scale 1 she is a giant standing in the meadow**, head
above the horizon. Correct, inherited, and left alone on purpose; the room drawn _for_ the world will
ask for a smaller scale, and that is the session to revisit these two in.

The dev sheet was deliberately left blind to places. It is built around `TraySlot` and `trayItems`,
and what can be wrong with a room — feet sunk into the floor, a head out of the ceiling, two dolls
overlapping — is a doll-and-room question the previews answer and a side-by-side contact sheet does
not. Revisit it the day places need comparing against each other rather than against a doll.

### The shell runs on the world, and task 4 was split to prove it

The plan said task 4 must not be split because the app is broken between the two providers. That
turned out not to be true, and the reason is the thing worth keeping: **`useLook()` kept its exact
shape**. It hands back the dressed doll and a dispatch that wraps every `LookAction` in
`{ type: 'dress' }`, so all seven of its consumers — `SlotBar`, `PartTray`, `ColorTray`,
`ParamsPanel`, `SavedTray`, `RandomButton`, `DraggableDoll` — are untouched, and the app on the
world looks pixel for pixel like the app on a single `Look`. That made a commit that changes nothing
visible possible, and it is worth having on its own: the mechanical half (seventeen test files
changing provider) is separated from the behavioural half that follows.

`useLook()` throws when nobody is being dressed rather than falling back to the first doll. A
fallback would let a tray silently recolour the wrong one with nothing on screen to say so.

**`WorldProvider` takes an injected world.** Every integration test mounts it to reach one screen,
and without a way in each of them would have to walk there first — turning every test of a tray into
a test of navigation too. The precedent was already there: it takes an injected `storage` and
`lookup` for the same reason.

**What running it caught.** The migration was written to strip the backdrop out of the look on its
way into the first doll. Reading it back in a real browser showed that is a commit too early: while
`scene` is still a slot there is nowhere else to stand, so it only cost her a sky for no benefit.
The migration now carries the look across whole, and the backdrop falls away on read with everything
else the moment the slot goes. It also settles the general rule — **a migration moves data, it does
not edit it**; the repair belongs where every other repair already is.

### The scene became a place, and the rest followed from it

`scene` is gone from `Slot`, `Z`, `TraySlot` and the registry; `src/parts/scene/` moved whole into
`src/world/locations/`; `src/model/look.ts` was deleted, because `sanitizeLook` now does by itself
what `withoutScene` stood in for — **a slot this version does not have is not a slot**, and it falls
away on read with every other piece that has left.

Three shapes came out of it:

- **`DollLayers` is the doll without a canvas.** The `<svg>` used to be hers, and a place cannot be
  inside the doll standing in it. `Doll` is still the whole of what a thumbnail and the album need;
  `Scene` owns the canvas a room and its dolls share.
- **The place carries no `data-slot`.** That is what stops the drag that undresses from getting hold
  of the wallpaper — the old backdrop was a layer of the doll and could be pulled off her. `data-doll`
  is its counterpart, and how a tap knows who it landed on.
- **`App` is a switch and nothing else.** `modeOf` was deleted with it: the shell branches on `here`
  and `dressing` directly, which TypeScript narrows for free, and a helper returning a string the
  shell then has to re-narrow from is worse than the branch it replaces.

**The dolls rail was not in the plan, and a test is what asked for it.** Going to the meadow left her
in an empty room with no way to put anybody in it — she could look at a place she used to be able to
stand in, which is a thing taken away rather than given. So place mode got the tap half of the
placing gesture now: tap a doll who is not here to stand her here, tap one who is to dress her.
Choosing _where_ she stands is still the drag, and so is taking her out — that is how a garment
already comes off.

That second tap is also the only keyboard path into the wardrobe. Tapping her on the stage is a
per-pixel hit test with no key to press, exactly like the drag that undresses, so the way in could
not be that gesture alone.

**What looking at it showed.** The loop holds: wardrobe → room → another room → put a doll down →
tap her → wardrobe, with the room she is in always at the head of the tray rail. Two things worth
carrying: at the inherited scale of 1 the dolls fill a room, which is the same finding the previews
gave and the same answer — the room drawn for the world will ask for less. And a doll placed alone
lands at a quarter across rather than in the middle, because a quarter and three quarters is the only
pair that does not overlap at that scale; the drag will let her put them where she likes.

### Still deferred

Not built, deliberately. Each is real scope, recorded so nothing is lost — but no stub exists in the source.

| Item                                                 | Where the spec puts it |
| ---------------------------------------------------- | ---------------------- |
| `look:saved` — gallery of up to 12 saved looks       | SPEC §14, Phase 2      |
| Optional WebAudio click with a persisted mute toggle | SPEC §13, Phase 2      |
| Slots `socks`, `outer`, `accessoryFace`, `handheld`  | SPEC §7, Phase 2       |
| Background scenes                                    | SPEC §15, Phase 3      |
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

**Built.** The album is a tray: a star to keep the doll as she stands, then every kept look as a
whole small doll. Tapping one puts it back on, and the one she is wearing is the one marked.

It does _not_ go through `TrayItem`, and that was the right call rather than a shortcut. That type
carries a slot and a colour; an outfit has neither, and forcing it through would have cost both of
them their meaning. `SavedTray` is its own component, and `App` holds `TraySlot | 'saved'` so the
colour row goes away with it — there is nothing in an outfit to recolour.

The star is not the save button SPEC §4 rules out. The current look is already saved, always; this
is her saying she wants to find this one again.

### Decisions closed

- **The free colour picker stays as it is.** On iOS it opens a modal sheet with words in it, which
  makes it and the axes panel the only text in the game. Weighed and accepted: any colour at all is
  worth more here than the last of the no-words rule.
- **`PROMPT-*.md` is not versioned.** Working notes live beside the repo, not in it; `.gitignore`
  covers the pattern.

## MVP acceptance checklist

From SPEC §17. Ticked only where actually verified; the rest name the exact step still owed.

**All nine are done.** The last four were answered on the iPad itself, installed from
https://fenrrir.github.io/giovanna_world/ — including the one no test could ever have reached, the
child using it without being told how.

Keep this list honest as the app changes: the four mechanical criteria are re-checked by the suite
on every commit, but the five device ones are only ever as current as the last time someone held
the iPad. `npm run dev:lan` is faster for iterating and cannot answer the offline one; see the
README for which criteria it can prove.

- [x] **Installs from the iPad home screen and opens full screen, without an address bar.**
      Done on the device: Safari → Share → Add to Home Screen, and opening from the icon gives
      full screen with no Safari chrome at all. The manifest declares `display: standalone` and
      `start_url: /giovanna_world/`, and the iOS meta tags are in `index.html`.
- [x] **Works with the iPad in aeroplane mode, from load through to autosave.**
      Done on the device, which was the last step this was waiting on. Already known before that:
      the service worker registers and reaches `activated`, its Workbox precache holds all runtime
      entries — `index.html`, the JS bundle, the CSS, the manifest and every icon — and autosave
      was seen writing `look:current`.
- [x] **Not a single word in the game's interface.** Asserted mechanically: the dress-up
      integration test dresses the doll from every tray and then requires the whole rendered tree
      to contain no text at all, with every control named through `aria-label`.
- [x] **Every touch target is at least 60×60 px.** Re-measured in a real browser after the rails
      went vertical, at both 1366×800 and 768×1024: every thumbnail is 70×70, both colour pickers
      68×68, the chevrons 68×60 and the sliders 60 tall, with 10 px between neighbours in a rail.
      Neither width overflows horizontally, which covers the 768–1366 range.
- [x] **No elastic overscroll bounce and no accidental double-tap zoom.** Done on the device, with
      the vertical rails tested specifically: they are scroll containers of their own and carry no
      `overscroll-behavior` of their own, so rolling one past its end could have chained to the
      document — it does not. `overscroll-behavior: none` and `touch-action: manipulation` on
      `html, body` in `src/styles/global.css` are holding. Worth re-testing the day a third scroll
      container appears; `overscroll-behavior: contain` on the rails is the fix if one ever chains.
- [x] **Holding a finger on the doll does not open Safari's context menu.** Done on the device: a
      long press on the artwork offers nothing. `-webkit-touch-callout: none` is set.
- [x] **The 12 parts pass the 6 criteria from SPEC §12.** All twelve are built and checked
      automatically by `tests/contract/registry.test.tsx`, in every colour of their palette. The
      suite was verified to actually fail on a hardcoded tone, a coordinate outside the viewBox
      and a forbidden gradient, so a pass means something. Each was also looked at before being
      called done — see the list above for what that caught.
- [x] **Closing and reopening the app preserves the character.** Covered by the look-store
      integration tests: hydrate, reconcile against the registry, 300 ms debounced write, and a
      flush on unmount so the last change survives the app closing.
- [x] **A six-year-old can change hair, clothes and colour with no verbal instruction.**
      Answered by the child, which is the only way it could be. This is the criterion the whole
      no-words rule was for, and it is the one no suite in this repository could ever have reached.
