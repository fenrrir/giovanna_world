# Spec — dress-up character game (web/PWA, iPad)

Reference document for the scaffold and for the following Claude Code sessions.
Written to be read by an agent: it contains contracts, coordinates and acceptance criteria, not long justifications.

---

## 1. Context and goal

A paper-doll dress-up game for a child, running on the household iPad, offline, without an app store.
The child assembles the character by choosing skin tone, hair, clothes, footwear and accessories, and recolours each part.

Genre reference: Avatar World, Toca Boca. **Reference, not a model to copy** — see section 3.

The project's success is measured by one thing only: the child being able to open it and play alone, without reading anything and without adult help.

## 2. Non-goals

Permanently out of scope:

- Accounts, login, profiles, cloud, synchronisation.
- Any network call at runtime. The app runs 100% offline after the first load.
- Ads, purchases, telemetry, analytics.
- Chat, free text, social sharing.
- Backend. There is no server; the deployment is static.

Out of scope for the MVP, but anticipated in the architecture: background scenes, image export, multiple characters in the same scene.

## 3. Intellectual property constraints

- All artwork is original, generated as SVG in this repository.
- Copying, tracing over or reproducing assets from Avatar World (Pazu), Toca Boca or any commercial game is forbidden.
- If raster art (backgrounds, textures) is ever introduced, only from CC0 sources — Kenney.nl, OpenGameArt with a verified licence, itch.io with an explicit commercial licence. Record origin and licence in `assets/CREDITS.md`.

## 4. Audience and UX principles

Rules that outweigh any aesthetic preference:

- **Zero text in the interface.** Icons, silhouettes and colours. The child does not read. Slot labels are thumbnails of the part itself, not words.
- **Touch targets ≥ 60×60 px** (CSS px), with at least 8 px of separation.
- **One level of navigation.** Slots visible on the main screen; tapping a slot makes that slot's parts appear on the same screen. No stacked modals, no "back".
- **No save button.** Autosave with a 300 ms debounce.
- **No destructive error state.** There is no "erase everything" other than a single randomise/reset button confirmed by a long press.
- **No timer, score, progression or lock.** It is a toy, not a game with an objective.
- Immediate tactile-visual feedback: the selected part gains an outline; the swap on the doll is instantaneous (no transition longer than 120 ms).
- Quality floor: visible keyboard focus, `prefers-reduced-motion` respected, layout functional from 768 px (iPad portrait) to 1366 px.

## 5. Stack

| Layer | Choice |
|---|---|
| Build | Vite |
| UI | React 18 + TypeScript (strict) |
| Styling | CSS modules or plain CSS. No UI framework. |
| State | `useReducer` + Context. No Redux, no Zustand. |
| Persistence | `localStorage` |
| PWA | `vite-plugin-pwa` (Workbox), precache strategy over the whole bundle |
| Tests | Vitest for the pure functions (colour, serialisation, hides). No E2E in the MVP. |

No Tailwind: the UI surface is small and the CSS here is almost entirely grid layout and large targets.

### Deployment

A service worker requires HTTPS. Serving from the Mac mini over `http://` on the LAN **does not work** for an installed PWA.
Deploy to Cloudflare Pages or GitHub Pages (automatic HTTPS), static build, via push.
Local development with `vite dev` works normally on `localhost` (secure-origin exception).

### Installing on the iPad

There is no install prompt on iOS. The flow is manual and done once by an adult:
Safari → Share → **Add to Home Screen**.
After that the app opens full screen, without an address bar.

Configuring **Guided Access** is recommended (Settings → Accessibility → Guided Access). Three clicks of the side button lock the iPad into the app.

## 6. Mandatory iOS configuration

`index.html`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/icon-180.png">
```

Global CSS:

```css
html, body {
  overscroll-behavior: none;
  touch-action: manipulation;
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
  margin: 0;
  height: 100%;
}
#root {
  padding:
    env(safe-area-inset-top) env(safe-area-inset-right)
    env(safe-area-inset-bottom) env(safe-area-inset-left);
}
```

`touch-action: manipulation` removes the 300 ms delay and double-tap zoom.
`-webkit-touch-callout: none` prevents the "copy image" menu when holding a finger on the doll.

## 7. Paper-doll architecture

### Slots and stacking order

Every part belongs to a slot. The renderer sorts by `z`. Fixed values, with gaps between them for future insertions:

| Slot | z | Note |
|---|---|---|
| `hairBack` | 0 | back layer of the hair |
| `body` | 10 | body, legs, arms, head, face. Always present. |
| `socks` | 20 | |
| `shoes` | 30 | |
| `bottom` | 40 | trousers, skirt, shorts |
| `top` | 50 | t-shirt, dress, sweatshirt (includes sleeves) |
| `outer` | 60 | coat, waistcoat |
| `hairFront` | 70 | fringe and front strands |
| `accessoryFace` | 75 | glasses |
| `accessoryHead` | 80 | bow, tiara, hat |
| `handheld` | 90 | object in the hand |

### Types

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

export type Palette = 'skin' | 'hair' | 'fabric';

export type Part = {
  id: string;                    // 'top.polka-dot-dress'
  slot: Slot;
  palette: Palette;
  hides?: Slot[];                // dress: ['bottom']
  render: (color: string) => ReactNode;   // SVG fragment, without an outer <svg>
};
```

### Hair is a pair, not a single part

A hairstyle occupies two slots (`hairBack` and `hairFront`) but is **a single choice** for the child and **a single colour**.
Model this explicitly, otherwise the UI leaks the implementation:

```ts
export type HairStyle = {
  id: string;
  back: (color: string) => ReactNode;
  front: (color: string) => ReactNode;
};
```

When applying a `HairStyle`, the reducer writes into both slots with the same colour.

### State

```ts
export type Look = {
  schemaVersion: 1;
  skin: string;                                  // skin tone hex
  equipped: Partial<Record<Slot, { partId: string; color: string }>>;
};
```

Render resolution rules:

1. Collect the equipped slots.
2. Apply `hides`: if any equipped part declares `hides: ['bottom']`, the `bottom` slot is omitted from the render — **but stays in the state**. When the dress is swapped for a t-shirt, the previous trousers reappear.
3. Sort by `Z` and concatenate the fragments inside a single `<svg>`.

The body (`body`) is not optional and has no part variants in the MVP — it varies only by `skin`. A facial expression is prepared as a future variant.

## 8. Canvas contract — anchors

**`viewBox="0 0 680 540"`. This number is contractual; no part may change it.**
The doll occupies x 234–446. The lateral margin is intentional: a flared skirt, open arms, wings and wide accessories need room without overflowing the viewBox.

Render: `<svg viewBox="0 0 680 540" width="100%" preserveAspectRatio="xMidYMid meet">`.

Every new part is drawn against these coordinates:

| Anchor | Coordinate |
|---|---|
| Top of the skull | (340, 68) |
| Centre of the head | (340, 130), radius 62 |
| Eye line | y = 136 (eyes at x = 318 and x = 362) |
| Chin | (340, 192) |
| Base of the neck / collar | y = 198, x 322–358 |
| Centre of the left shoulder | (282, 216) |
| Centre of the right shoulder | (398, 216) |
| Left arm | x 266–294, y 212–338 |
| Right arm | x 386–414, y 212–338 |
| Left hand | (280, 344), radius 16 |
| Right hand | (400, 344), radius 16 |
| Torso | x 288–392, y 194–334, rx 30 |
| Waistline | y = 280 (band: x 284–396, height 18) |
| Hip / top of the legs | y = 330 |
| Left leg | x 306–336 |
| Right leg | x 344–374 |
| Ankle | y = 440 |
| Sole / base of the foot | y = 494 |
| Left shoe | x 296–344, y 464–494 |
| Right shoe | x 336–384, y 464–494 |
| Skirt hem (reference) | y ≈ 398, width x 234–446 |
| Side head-accessory mount | (406, 87) |
| Centre head-accessory mount | (340, 66) |

Parts that overflow the viewBox or disregard an anchor are rejected in review (see section 12).

## 9. Palettes and art rules

### Palettes

```ts
export const PALETTES: Record<Palette, string[]> = {
  skin:   ['#F7DCC3', '#F2C9A8', '#C68A5E', '#8A5A38'],
  hair:   ['#6B3A1F', '#111111', '#C97B2E', '#8A3A2A', '#4A2C1A', '#D4537E'],
  fabric: ['#7F77DD', '#1D9E75', '#D4537E', '#EF9F27', '#378ADD', '#E24B4A'],
};
```

Fixed, non-recolourable colours: eye `#3B2418`, eye highlight `#FBFBF9`, mouth `#C24A6B`, blush `#F0997B` at 45% opacity, white collar `#FBFBF9`.

### Tone derivation

A part receives **one** colour and derives the rest. Single helper in `lib/color.ts`:

```ts
export const shade = (hex: string, f: number): string => { /* multiplies each channel by f */ };
// fold/shadow: shade(c, 0.78)
// highlight:   shade(c, 1.10)
```

Never hardcode the dark variation of a recolourable colour — it has to come out of `shade`, otherwise the part breaks when the child changes the colour.

### Drawing rules

These are the ones that produce the difference between "stick figure" and illustration:

- Hair strand: one or two `<path>` with `shade(c, 1.28)` at `opacity: 0.55` over the hair mass.
- Eye highlight: white circle of radius 4, offset 3 px above and to the right of the pupil centre.
- Clothing with volume: bodice one tone above the base, hem/fold one tone below. Two layers are enough.
- Patterns (polka dots, stripes) are **generated by a function**, never written circle by circle by hand. Swapping polka dots for stripes becomes swapping the function.
- Blush and shadow always via `opacity`, never via a new colour.

Forbidden: `<linearGradient>`, `<filter>`, external `<image>`, `drop-shadow`, `blur`. Everything is `<path>`, `<rect>`, `<circle>`, `<ellipse>` with flat fill. Reason: file size, render predictability in Safari and trivial recolouring.

## 10. Folder structure

```
src/
  main.tsx
  App.tsx
  anchors.ts           # anchor constants from section 8
  lib/
    color.ts           # shade()
    storage.ts         # load/save Look, debounce
    patterns.ts        # polka dot, stripe, check generators
  model/
    slots.ts           # Slot, Z
    types.ts           # Part, HairStyle, Look
    reducer.ts         # applyPart, applyHair, setSkin, randomize
  parts/
    body.tsx
    hair/              # each file exports a HairStyle
    top/
    bottom/
    shoes/
    accessory/
    registry.ts        # single index: every part, grouped by slot
  render/
    Doll.tsx           # assembles the <svg>, resolves hides, sorts by Z
    Thumb.tsx          # thumbnail of a single part
  ui/
    SlotBar.tsx
    PartTray.tsx
    ColorTray.tsx
  dev/
    Sheet.tsx          # contact sheet (section 11)
```

`registry.ts` is the only import point for parts. Adding a part = creating the file + registering it here.

### Thumbnails

There is no thumbnail file. The thumbnail is the part itself rendered in isolation, in an `<svg>` with the same `viewBox` and a scaling `transform`. A single source of truth.

## 11. Development tool: `/dev/sheet`

A hidden route (outside the child's flow) that renders, for a chosen slot, **every part of that slot over the same body**, side by side, at the same scale.

It is the project's quality-control instrument: an anchor error — a sleeve that does not meet the shoulder, hair floating above the skull, a skirt hem cutting through the knee — is invisible when looking at a single part and obvious on the contact sheet.

Requirements:
- A slot selector and a skin-tone selector.
- An extra row showing the same part in the 6 `fabric` colours, to validate that tone derivation works both light and dark.
- An optional anchor overlay (crosses at the points from section 8) with a toggle.

## 12. Definition of done, per part

A part only enters the `registry` if:

1. It renders inside `viewBox 0 0 680 540`, with no negative coordinate.
2. It fits the anchors relevant to its slot (shoulder, waist, ankle, skull).
3. It accepts `color` and derives every other tone via `shade`.
4. It uses no gradient, filter, external image or hardcoded fabric colour.
5. It appears correctly across the 4 skin tones and the 6 fabric colours in `/dev/sheet`.
6. If it hides another slot, it declares `hides` explicitly.

## 13. Interaction

- Use **Pointer Events** (`pointerdown`/`pointermove`/`pointerup`), never Touch Events. A single event for finger and mouse; it allows testing on the desktop without a simulator.
- MVP: selection by a simple tap on the part tray.
- Phase 2: dragging the part from the tray onto the doll. Implement with `setPointerCapture`, a generous drop target (the doll's whole silhouette, not the exact region of the part), and the part returning to the tray with a short animation if dropped outside.
- Sound: optional, a short click via WebAudio on a part swap. Only after the user's first gesture (Safari autoplay policy) and with a persisted mute toggle.

## 14. Persistence

- Key `look:current` — the active `Look`, written with a 300 ms debounce.
- Key `look:saved` — an array of up to 12 `Look`s, for the child to keep finished outfits.
- Always validate `schemaVersion` on read. An unknown version or invalid JSON → discard and start from the default, with no error on screen.
- A referenced part that no longer exists in the registry → silently ignore that slot.
- In a PWA installed on the home screen, `localStorage` is not subject to ITP's 7-day expiry. Even so, treat data loss as a normal scenario: the app returns to the default character and nothing breaks.

## 15. Phases

**Phase 1 — MVP.** Body + 4 skin tones; slots `hairBack/hairFront`, `top`, `bottom`, `shoes`; 12 parts in total; selection by tap; recolouring; autosave; installable and offline PWA; `/dev/sheet`.

**Phase 2.** Drag and drop; `socks`, `outer`, `accessoryHead`, `accessoryFace`, `handheld`; a gallery of saved looks; a randomise button; optional sound.

**Phase 3.** Background scenes; PNG export (serialise the SVG → `Blob` → `drawImage` onto a `<canvas>` → `toDataURL`); a second character in the same scene.

## 16. How to ask Claude Code for a new part

Prompt template for the following sessions:

> Create the part `<slot>.<id>` following `SPEC.md` sections 8 and 9.
> Description: `<one-sentence visual description>`.
> Relevant anchors: `<list them>`.
> Register it in `parts/registry.ts` and show it to me in `/dev/sheet`.

Ask for one at a time. A batch of parts generated in one go comes out inconsistent between the parts.

## 17. MVP acceptance criteria

- [ ] Installs from the iPad home screen and opens full screen, without an address bar.
- [ ] Works with the iPad in aeroplane mode, from load through to autosave.
- [ ] Not a single word in the game's interface.
- [ ] Every touch target is at least 60×60 px.
- [ ] No elastic overscroll bounce and no accidental double-tap zoom.
- [ ] Holding a finger on the doll does not open Safari's context menu.
- [ ] The 12 parts pass the 6 criteria from section 12.
- [ ] Closing and reopening the app preserves the character.
- [ ] A six-year-old can change hair, clothes and colour with no verbal instruction.

---

## Appendix — suggested excerpt for `CLAUDE.md`

Paste into the repository root, to avoid reloading the whole spec every session:

```md
# Art contract — dress-up game

viewBox of EVERY part: 0 0 680 540. Never change it.
The doll occupies x 234–446. The lateral margin is deliberate.

Anchors: skull (340,68) · head (340,130) r62 · chin (340,192)
· neck y198 x322–358 · shoulders (282,216) and (398,216)
· arms x266–294 and x386–414, y212–338 · hands (280,344) and (400,344) r16
· torso x288–392 y194–334 rx30 · waist y280 · hip y330
· legs x306–336 and x344–374 · ankle y440 · sole y494
· head accessory: side (406,87), centre (340,66)

A part receives ONE colour and derives the rest with shade(c, 0.78) for a fold
and shade(c, 1.10) for a highlight. Never hardcode a variation of a recolourable colour.

Forbidden: gradient, filter, <image>, drop-shadow, blur.
Patterns (polka dot, stripe) come from lib/patterns.ts, never written by hand.

Every new part is registered in parts/registry.ts and validated in /dev/sheet
across the 4 skin tones and the 6 fabric colours.
```
