Got it — I’ll merge those **advanced features** directly into the master description so your AI has a single, complete spec for building the `Lightbox` component.

---

# Lightbox Component – AI Implementation Description (Extended)

## Purpose

A **Lightbox** is a modal overlay to showcase media (images, videos, or custom content) in a distraction-free way. It emphasizes the active item, dims the background, and provides intuitive navigation and controls.

---

## Core Features

1. **Overlay & Focus**
   - Semi-transparent backdrop covering viewport.
   - Content centered with scroll lock while active.

2. **Media Support**
   - Images, videos, and arbitrary children.
   - Mixed galleries (image + video).

3. **Navigation**
   - Previous/Next controls.
   - Keyboard (`←`, `→`, `Esc`) and swipe support.
   - Optional loop at edges.

4. **Controls**
   - Always-visible close button.
   - Optional captions, share, and download.
   - Configurable via props.

5. **Accessibility**
   - Focus trap, `aria-modal="true"`, `role="dialog"`.
   - Screen reader announcement of current item (“Image 2 of 5”).
   - Escape closes by default.

---

## Advanced Features

- **Thumbnails / Filmstrip**: optional preview strip for quick navigation.
- **Zoom & Pan**: pinch/scroll zoom, drag pan, double-tap reset.
- **Slideshow / Autoplay**: auto-advance with start/stop.
- **Lazy Load & Preload**: load current, preload prev/next.
- **Multi-Item Layout**: switch between single and grid view.
- **Gestures**: swipe left/right to change, swipe down to close (mobile).
- **Share & Download**: Web Share API, link copy, download with watermark support.
- **Animations**: morph from thumbnail to fullscreen, crossfade or slide transitions.
- **Multiple Instances**: independent galleries on one page.
- **Programmatic API**: expose `open(index)`, `close()`, `next()`, `prev()`.

---

## Props

- `isOpen: boolean` – controls visibility.
- `onClose: () => void` – close handler.
- `items?: Array<{ src: string; alt?: string; caption?: string; type?: "image" | "video" }>` – gallery items.
- `startIndex?: number` – initial item index.
- `showControls?: boolean` – toggle controls.
- `showCaptions?: boolean` – toggle captions.
- `loop?: boolean` – loop gallery navigation.
- `autoplay?: boolean` – enable auto slideshow.
- `thumbnails?: boolean` – show filmstrip navigation.
- `zoomable?: boolean` – enable zoom/pan.
- `className?: string` – extend styling.

---

## Visual & Motion Guidelines

- **Backdrop:** 60–80% black opacity.
- **Animation:** fade backdrop, scale/slide media (200–300ms).
- **Transitions:** configurable easing/duration.

---

## Variants

- **Default:** Image viewer with captions.
- **Minimal:** Only close button.
- **Media-Rich:** Mixed gallery.
- **Fullscreen:** 100% viewport expansion.
- **Filmstrip Mode:** with thumbnails.

---

## Testing Scenarios

- Open/close (click backdrop, close button, Esc).
- Navigation (keyboard, buttons, swipe).
- Loop on/off.
- Zoom/pan interactions.
- Autoplay start/stop.
- Accessibility (aria, focus trap, announcements).
- Responsiveness at 320px, 768px, 1200px, 3200px.

---

## Storybook Tests

- **Visual regression**: overlay, transitions, zoom.
- **Interaction**: navigation, autoplay, gestures.
- **Accessibility**: roles, aria, focus.

---

Do you want me to now **draft a `track.md` file for Lightbox** (Props, Lint, Type Errors, Testing Scenarios, Storybook Tests, Current plan) so you can plug it straight into your verification workflow?
