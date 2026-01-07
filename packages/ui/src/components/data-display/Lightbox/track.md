# Lightbox — `track.md`

**Component**: `Lightbox`
**Category**: `data-display` (modal media viewer)
**Status**: completed [omega-9004]
**Current (BRT)**: 2025-09-12 23:55

---

## 1) Props

| Prop           | Type                                                                                | Required | Default | Notes                                                                     |
| -------------- | ----------------------------------------------------------------------------------- | -------: | ------- | ------------------------------------------------------------------------- |
| `isOpen`       | `boolean`                                                                           |        ✓ | `false` | Controls visibility; must lock body scroll when `true`.                   |
| `onClose`      | `() => void`                                                                        |        ✓ | —       | Fired on close button, backdrop click, `Esc`, and swipe-down (mobile).    |
| `items`        | `Array<{ src: string; alt?: string; caption?: string; type?: "image" \| "video" }>` |          | `[]`    | Gallery items; mixed media supported.                                     |
| `startIndex`   | `number`                                                                            |          | `0`     | Initial active item index (clamped to bounds).                            |
| `showControls` | `boolean`                                                                           |          | `true`  | Toggles Next/Prev controls and keyboard arrows.                           |
| `showCaptions` | `boolean`                                                                           |          | `true`  | Renders `caption` below media if present.                                 |
| `loop`         | `boolean`                                                                           |          | `false` | Wrap navigation at edges.                                                 |
| `autoplay`     | `boolean \| { interval?: number }`                                                  |          | `false` | Auto-advance; default interval 4000ms when `true`. Pauses on hover/focus. |
| `thumbnails`   | `boolean`                                                                           |          | `false` | Shows filmstrip for quick navigation.                                     |
| `zoomable`     | `boolean`                                                                           |          | `true`  | Enable pinch/scroll zoom, drag pan, double-tap reset.                     |
| `className`    | `string`                                                                            |          | —       | Style extension hook for container.                                       |

**A11y (built-in):**

- `role="dialog"`, `aria-modal="true"`, labelled by visually hidden title (`Lightbox` or current item `alt`).
- Focus trap; initial focus on close button; shift-tab cycles.
- Announce “Item X of N” for screen readers.
- `Esc` closes.

---

## 2) Lint

- From repo root:

  ```bash
  cd packages/ui
  pnpm check:component data-display Lightbox
  ```

- Must be clean for: **ESLint**, **TypeScript**, **format** (Prettier), **storybook stories build**.

---

## 3) Type Errors

- Build types:

  ```bash
  pnpm -w build:types && pnpm -w tsc -p packages/ui/tsconfig.json --noEmit
  ```

- Zero TS errors. Public types for props exported from `index.ts`.

---

## 4) Testing Scenarios

**Open/Close**

- Open via external trigger; close via: close button, backdrop click, `Esc`, swipe-down (mobile).
- Body scroll locked when open; restored on close.

**Navigation**

- Buttons, keyboard arrows, swipe left/right.
- `loop: false` stops at edges; `loop: true` wraps.

**Autoplay**

- Starts when enabled, pauses on hover/focus/zoomed state, resumes on blur/unzoom.
- Resets timer after manual nav.

**Zoom & Pan**

- Scroll (desktop) / pinch (mobile) to zoom; drag to pan; double-click/tap to reset.
- Zoom disabled for videos.

**Thumbnails / Filmstrip**

- Click thumbnail changes active item; active state highlighted; horizontal scroll with many items.

**Mixed Media**

- Image → video → image transitions are smooth; video preserves play/pause state per item (do not autoplay with sound).

**A11y**

- Focus trap cycling; `Tab` order deterministic.
- SR announcements: current index, caption readout if present.
- All controls have accessible labels.

**Responsiveness**

- 320, 768, 1200, 1920, **3200** px layouts validated.
- Content scales; filmstrip collapses to swipeable row on small screens.

**Performance**

- Lazy-load current; preload prev/next; no layout shift > 0.1 CLS when navigating.

**Multiple Instances**

- Two lightboxes on same page operate independently (namespaced events/ids).

**Programmatic API**

- Imperative handle: `open(index)`, `close()`, `next()`, `prev()` works from parent refs.

---

## 5) Storybook Tests

**Stories**

- `DataDisplay/Lightbox/Default`
- `DataDisplay/Lightbox/SingleImage`
- `DataDisplay/Lightbox/WithFilmstrip`
- `DataDisplay/Lightbox/Autoplay`
- `DataDisplay/Lightbox/CustomAutoplayInterval`
- `DataDisplay/Lightbox/WithLoop`
- `DataDisplay/Lightbox/NoControls`
- `DataDisplay/Lightbox/NoCaptions`
- `DataDisplay/Lightbox/MixedMedia`
- `DataDisplay/Lightbox/NotZoomable`
- `DataDisplay/Lightbox/StartAtIndex`
- `DataDisplay/Lightbox/FullFeatured`
- `DataDisplay/Lightbox/DarkMode`
- `DataDisplay/Lightbox/MobileResponsive`
- `DataDisplay/Lightbox/AllVariants`
- `DataDisplay/Lightbox/AllSizes`
- `DataDisplay/Lightbox/AllStates`
- `DataDisplay/Lightbox/InteractiveStates`
- `DataDisplay/Lightbox/Responsive`

**Autotests (collocated)**

- Visual: backdrop opacity; transition enter/exit; crossfade between items.
- Interaction: open/close paths; next/prev; arrows; swipe; zoom/pan; filmstrip click.
- A11y: `role`, `aria-modal`, focus trap, SR announcements.
- Performance smoke: image preloading hook invoked; no console errors.

**Progress Board**

- planned
- working
- completed
- error

| Test                     | Status  | Notes |
| ------------------------ | ------- | ----- |
| Open/close (all paths)   | planned |       |
| Keyboard nav & `Esc`     | planned |       |
| Swipe left/right/down    | planned |       |
| Loop on/off edges        | planned |       |
| Autoplay pause/resume    | planned |       |
| Zoom/pan/restore         | planned |       |
| Filmstrip interactions   | planned |       |
| Mixed media transitions  | planned |       |
| A11y roles & focus trap  | planned |       |
| Responsive @320→3200     | planned |       |
| Multi-instance isolation | planned |       |
| Preload prev/next        | planned |       |

---

## 6) Current Plan

1. Scaffold component + stories (`DataDisplay/Lightbox/*`).
2. Implement overlay, focus trap, scroll-lock, close paths.
3. Add gallery navigation (buttons, keys, swipe) with loop toggle.
4. Integrate lazy-load + preload hooks; mixed media container.
5. Add zoom/pan (images only) with gesture handling.
6. Filmstrip thumbnails with virtualization for large sets.
7. Autoplay controller with pause/resume heuristics.
8. A11y pass (labels, announcements, roving focus in filmstrip).
9. Storybook tests: interaction + a11y + visual regression.
10. `pnpm check:component data-display Lightbox` → clean; DOD.

**Owner**: _assign here_
**Links**: _PR/issue links here_

---

## 7) Definition of Done (DOD)

- All **props typed & documented**; zero ESLint/TS errors.
- **All test scenarios** above automated and passing in Storybook.
- **A11y validated** (keyboard-only usable, SR friendly).
- **No memory leaks**; removing component restores body scroll & listeners.
- **Bundle size** within target for overlays; no heavy deps added.
- Included in **component index** and **usage docs** with examples.

---

## 8) Known Edge Cases

- Very tall images → max-height containment with pan.
- Portrait vs landscape videos → letterbox with background fill.
- Missing `alt` → use generic label (“Media item”).
- Huge galleries (1000+) → filmstrip virtualization + item prefetch window.

---

## 9) Notes for Implementers

- Prefer CSS transforms for animations (GPU-friendly).
- Disable wheel-to-zoom when modifier keys indicate page zoom conflicts.
- Trap focus using a minimal util (no new dependency).
- Ensure event listeners are passive where appropriate; clean up on unmount.
- Keep gesture logic isolated for testability.
