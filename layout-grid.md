# Adaptive Video Player Layout

A CSS-first adaptive layout prototype for a video player page. Uses a **mobile-first** approach with shared SCSS breakpoint mixins to handle all screen sizes from mobile to ultrawide — no JavaScript layout detection needed.

## Development Server

```bash
ng serve
```

Open `http://localhost:4200/` in your browser.

## Architecture

### Mobile-First Breakpoint System

Shared breakpoint mixins live in `src/styles/_breakpoints.scss` and are available to all components via `@use 'breakpoints' as bp`. The cascade order is:

1. **Base** — Mobile portrait (no media query)
2. **Tablet** — `min-width: 769px`
3. **Desktop** — `min-width: 1180px`
4. **Ultrawide** — `min-aspect-ratio: 2/1` + `min-width: 1180px`
5. **Mobile landscape** — `max-height: 480px` + `orientation: landscape` (last, so it overrides all width-based breakpoints)

### CSS Custom Property Chain

All layout dimensions derive from a single input: `--video-width` (set via `AsyncPipe` binding from `ResizeService.videoWidth$`). CSS computes a single derived property:

```
--video-width (input from ResizeService observable)
  → --actual-video-width = min(
      video-width,
      100% - 600px,
      (100vh - nav-height - min-grid-height) * 16/9
    )
```

Width calculations use `100%` (container width), not `100vw`, because the grid lives inside `mat-sidenav-content` — not the full viewport. This correctly accounts for the 200px sidenav.

The video element uses `aspect-ratio: 16 / 9` to derive its height from the width. The `min()` function guarantees:

- Video never exceeds the user-requested width
- Video leaves at least 600px for panels + gutter horizontally (`100% - 600px`)
- Video height never pushes grid-bottom below its minimum (`$min-grid-height`)
- No JavaScript layout detection or per-device breakpoints needed

### Grid Structure

The page uses a flat CSS Grid with 9 direct children:

```
┌────────────────┬──────────────────┬─────────────────┬────────┐
│                │ upper-middle-1   │ upper-right-1   │        │
│                ├──────────────────┼─────────────────┤        │
│     video      │ upper-middle-2   │ upper-right-2   │ gutter │
│                ├──────────────────┼─────────────────┤        │
│                │ upper-middle-3   │ upper-right-3   │        │
├────────────────┴──────────────────┴─────────────────┴────────┤
│                         grid-bottom                          │
└──────────────────────────────────────────────────────────────┘
```

- `gutter` is a narrow 40px column spanning all 3 panel rows (contains close and settings icons)

Grid areas are reassigned via `grid-template-areas` in each media query — the HTML never changes.

## Layout Modes

### 1. Mobile Portrait (base — no media query)

- Single column layout
- Video on top at full width, height derived from `aspect-ratio: 16/9`
- Grid-bottom fills remaining space below
- All panels and gutter are hidden (`display: none`)

```
┌──────────────────┐
│      video       │
├──────────────────┤
│                  │
│   grid-bottom    │
│                  │
└──────────────────┘
```

### 2. Mobile Landscape

**Media query:** `(max-height: 480px) and (orientation: landscape)`

- Video fills the entire viewport (`100vh`)
- All panels, grid-bottom, and resizer are hidden
- Navigation toolbar is also hidden (via nav component media query)
- Page height is `100vh` (not `100vh - nav-height`) since toolbar is gone

```
┌──────────────────────────┐
│                          │
│          video           │
│                          │
└──────────────────────────┘
```

### 3. Tablet

**Media query:** `(min-width: 769px)`

- Video spans full width at top
- All upper panels hidden (same as mobile portrait)
- Grid-bottom fills remaining space below
- Gutter and resizer hidden

```
┌──────────────────┐
│      video       │
├──────────────────┤
│                  │
│   grid-bottom    │
│                  │
└──────────────────┘
Columns: 1fr
Rows: auto minmax(200px, 1fr)
```

### 4. Desktop

**Media query:** `(min-width: 1180px)`

- 4-column grid: video | upper-middle panels (minmax 360px–1fr) | upper-right panels (200px) | gutter (40px)
- Video spans 3 rows on the left, sized by `--actual-video-width` with `aspect-ratio: 16/9`
- 4th row (`minmax($min-grid-height, 1fr)`) is grid-bottom spanning full width
- Video width is user-resizable via drag handle
- Height is constrained so grid-bottom always has at least 200px

```
Columns: [actual-video-width] [minmax(360px, 1fr)] [200px] [40px]
Rows:    [60px] [60px] [auto] [minmax(200px, 1fr)]
```

### 5. Ultrawide

**Media query:** `(min-aspect-ratio: 2/1) and (min-width: 1180px)`

- Video takes full page height (`--actual-video-width` = `(100vh - nav) * 16/9`)
- Grid-bottom moves beside the video in the 4th row instead of below it
- Panels stack in 3 rows to the right of the video
- Grid-bottom shares the bottom row with the video

```
┌────────────────┬──────────────────┬─────────────────┬────────┐
│                │ upper-middle-1   │ upper-right-1   │        │
│                ├──────────────────┼─────────────────┤        │
│     video      │ upper-middle-2   │ upper-right-2   │ gutter │
│                ├──────────────────┼─────────────────┤        │
│                │ upper-middle-3   │ upper-right-3   │        │
│                ├──────────────────┴─────────────────┴────────┤
│                │          grid-bottom                        │
└────────────────┴─────────────────────────────────────────────┘
```

## Files

| File                                            | Purpose                                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| `src/styles/_breakpoints.scss`                  | Shared breakpoint mixins and layout constants                                        |
| `src/app/components/layout-one/grid.scss`       | Grid definitions, CSS custom properties, all 5 layout modes (mobile-first)           |
| `src/app/components/layout-one/layout-one.scss` | Video section styling, resizer handle, video-size overlay, gutter                   |
| `src/app/components/layout-one/layout-one.html` | Flat grid structure with 9 children, `--video-width` binding, S/M/L/* size toggles  |
| `src/app/components/layout-one/layout-one.ts`   | Resize drag handling via Renderer2, ResizeObserver for dimensions, size presets      |
| `src/app/components/layout-one/resize.service.ts` | `videoWidth$` BehaviorSubject (observable), `customWidth` for `*` preset           |
| `src/app/components/nav/nav.component.scss`     | Toolbar hidden in mobile landscape (uses shared mixin)                               |

## Video Resize

The video section has a drag handle on its right edge. Dragging updates `ResizeService.videoWidth$`, which flows into the `--video-width` CSS custom property. `--actual-video-width` recalculates automatically via `min()` — no JavaScript dimension logic needed.

- Minimum width: 200px (enforced in ResizeService)
- Maximum width: constrained by `min()` to `100% - 600px` (container-relative, accounts for sidenav)
- Maximum height: constrained by `min()` to `(100vh - nav - min-grid-height) * 16/9`, ensuring grid-bottom has space

### Size Presets (S / M / L / *)

The `upper-right-1` panel contains a `mat-button-toggle-group` with four presets:

| Button | Behavior                                                                                    |
| ------ | ------------------------------------------------------------------------------------------- |
| `S`    | 50% of `maxVideoWidth` (computed from window dimensions)                                    |
| `M`    | 75% of `maxVideoWidth`                                                                      |
| `L`    | Full `window.innerWidth` (effectively the CSS `min()` cap)                                  |
| `*`    | Restores the last custom drag width saved by `saveCustomWidth()`, or no-op if none saved    |

`maxVideoWidth` is computed as `min(window.innerWidth - 600, (window.innerHeight - 38 - 200) * 16/9)`, mirroring the CSS `min()` constraint in JavaScript. Dragging the resizer sets `selectedSize = '*'` and calls `saveCustomWidth()` on mouse-up.

## Video Dimensions Overlay

A `ResizeObserver` watches the `.video` section element. On every resize it updates `renderedWidth` and `renderedHeight` (rounded integers), which are displayed in an overlay badge (`position: absolute; top-right`) formatted as `W x H`. This reflects the actual rendered pixel size after CSS constraints are applied.

## Video Element

The video section contains an `<img>` placeholder with `object-fit: contain`, ensuring the content scales within its grid cell without cropping while maintaining its native aspect ratio.

## Container Queries

The grid-bottom section is configured as a container query context (`container-type: size`, `container-name: playgrid`). These are ready to be populated with content adaptation rules (compact rows, hidden controls, etc.) when real content is added.

## Testing in DevTools

All layout modes use CSS media queries on **viewport dimensions**, not `screen.width/screen.height`. This means every layout mode can be validated in Chrome DevTools responsive mode:

| Layout           | DevTools Dimensions                                        |
| ---------------- | ---------------------------------------------------------- |
| Mobile Portrait  | 375 x 812 (or any width < 769px, portrait)                |
| Mobile Landscape | 812 x 375 (or any height < 480px, landscape)              |
| Tablet           | 820 x 1180 (or any width 769–1179px)                      |
| Desktop          | 1920 x 1080                                               |
| Ultrawide        | 2560 x 1080 (or any width:height > 2:1 and width > 1180px)|
| Edge: 1024 x 450 | Mobile landscape wins (fullscreen video)                  |

## Configuration

SCSS variables in `src/styles/_breakpoints.scss`:

| Variable           | Default  | Purpose                                   |
| ------------------ | -------- | ----------------------------------------- |
| `$nav-height`      | `38px`   | Height of the navigation toolbar          |
| `$min-grid-height` | `200px`  | Minimum guaranteed height for grid-bottom |
| `$gap`             | `0px`    | Gap between grid cells                    |
| `$desktop-min-width` | `1180px` | Desktop/ultrawide breakpoint threshold  |
| `$tablet-min-width`  | `769px`  | Tablet breakpoint threshold             |
