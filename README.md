# Adaptive Video Player Layout

A CSS-first adaptive layout prototype for a video player page. Designed to handle all screen sizes from mobile to ultrawide with a single set of CSS custom properties — no JavaScript layout detection needed.

## Development Server

```bash
ng serve
```

Open `http://localhost:4200/` in your browser.

## Architecture

### CSS Custom Property Chain

All layout dimensions derive from a single input: `--video-width` (set via Angular signal binding). CSS computes a single derived property:

```
--video-width (input from ResizeService signal)
  → --actual-video-width = min(
      video-width,
      100vw - 200px,
      (100vh - nav-height - min-grid-height) * 16/9
    )
```

The video element uses `aspect-ratio: 16 / 9` to derive its height from the width. The `min()` function guarantees:

- Video never exceeds the user-requested width
- Video leaves at least 200px for panels horizontally (`100vw - 200px`)
- Video height never pushes grid-bottom below its minimum (`$min-grid-height`)
- No JavaScript layout detection or per-device breakpoints needed

### Grid Structure

The page uses a flat CSS Grid with 8 direct children:

```
┌────────────────┬──────────────────┬─────────────────┬────────┐
│                │ upper-middle-1   │ upper-right-1   │        │
│                ├──────────────────┼─────────────────┤        │
│     video      │ upper-middle-2   │ upper-right-2   │ gutter │
│                ├──────────────────┤                 │        │
│                │ upper-middle-3   │                 │        │
├────────────────┴──────────────────┴─────────────────┴────────┤
│                         grid-bottom                          │
└──────────────────────────────────────────────────────────────┘
```

- `upper-right-2` spans rows 2–3
- `gutter` is a narrow 50px column spanning all 3 panel rows (contains a close icon)

Grid areas are reassigned via `grid-template-areas` in each media query — the HTML never changes.

## Layout Modes

### 1. Standard Desktop (default)

**No media query — this is the base layout.**

- 4-column grid: video | upper-middle panels (fluid) | upper-right panels (200px) | gutter (50px)
- Video spans 3 rows on the left, sized by `--actual-video-width` with `aspect-ratio: 16/9`
- 4th row (`minmax($min-grid-height, 1fr)`) is grid-bottom spanning full width
- Video width is user-resizable via drag handle
- Height is constrained so grid-bottom always has at least 200px

```
Columns: [actual-video-width] [1fr] [200px] [50px]
Rows:    [auto] [auto] [auto] [minmax(200px, 1fr)]
```

### 2. Ultrawide

**Media query:** `(min-aspect-ratio: 2/1) and (min-width: 1200px)`

- Video takes full page height (`--actual-video-width` = `(100vh - nav) * 16/9`)
- Grid-bottom moves beside the video in the 4th row instead of below it
- Panels stack in 3 rows to the right of the video
- Grid-bottom shares the bottom row with the video
- Gutter column is not used in this layout

```
┌────────────────┬──────────────────┬─────────────────┐
│                │ upper-middle-1   │ upper-right-1   │
│                ├──────────────────┼─────────────────┤
│     video      │ upper-middle-2   │ upper-right-2   │
│                ├──────────────────┼─────────────────┤
│                │ upper-middle-3   │ upper-right-3   │
│                ├──────────────────┴─────────────────┤
│                │          grid-bottom               │
└────────────────┴────────────────────────────────────┘
```

### 3. Mobile Portrait

**Media query:** `(max-width: 768px) and (orientation: portrait)`

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

### 4. Mobile Landscape

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

## Files

| File                                            | Purpose                                                                                   |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `src/app/components/layout-one/grid.scss`       | Grid definitions, CSS custom properties, all 4 layout modes, container query placeholders |
| `src/app/components/layout-one/layout-one.scss` | Video section styling, resizer handle                                                     |
| `src/app/components/layout-one/layout-one.html` | Flat grid structure with 8 children, `--video-width` binding                              |
| `src/app/components/layout-one/layout-one.ts`   | Resize drag handling via Renderer2, injects ResizeService                                 |
| `src/app/services/resize.service.ts`            | `videoWidth` signal (input), `videoHeight` computed signal                                |
| `src/app/components/nav/nav.component.scss`     | Toolbar hidden in mobile landscape                                                        |

## Video Resize

The video section has a drag handle on its right edge. Dragging updates `ResizeService.videoWidth`, which flows into the `--video-width` CSS custom property. `--actual-video-width` recalculates automatically via `min()` — no JavaScript dimension logic needed.

- Minimum width: 200px (enforced in ResizeService)
- Maximum width: constrained by `min()` to `100vw - 200px`, ensuring panels remain visible
- Maximum height: constrained by `min()` to `(100vh - nav - min-grid-height) * 16/9`, ensuring grid-bottom has space

## Video Element

The video section contains an HTML5 `<video>` element with `object-fit: contain`, ensuring the video scales within its grid cell without cropping while maintaining its native aspect ratio.

## Container Queries

The grid-bottom section is configured as a container query context (`container-type: size`, `container-name: playgrid`). Breakpoint placeholders exist for:

- `max-height: 300px` — compact mode for limited vertical space
- `max-width: 500px` — narrow mode for limited horizontal space

These are ready to be populated with content adaptation rules (compact rows, hidden controls, etc.) when real content is added.

## Testing in DevTools

All layout modes use CSS media queries on **viewport dimensions**, not `screen.width/screen.height`. This means every layout mode can be validated in Chrome DevTools responsive mode:

| Layout           | DevTools Dimensions                                        |
| ---------------- | ---------------------------------------------------------- |
| Standard Desktop | 1920 x 1080                                                |
| Ultrawide        | 2560 x 1080 (or any width:height > 2:1 and width > 1200px) |
| Mobile Portrait  | 375 x 812 (or any width < 768px, portrait)                 |
| Mobile Landscape | 812 x 375 (or any height < 480px, landscape)               |

## Configuration

SCSS variables at the top of `grid.scss`:

| Variable           | Default | Purpose                                   |
| ------------------ | ------- | ----------------------------------------- |
| `$nav-height`      | `64px`  | Height of the navigation toolbar          |
| `$min-grid-height` | `200px` | Minimum guaranteed height for grid-bottom |
| `$gap`             | `0px`   | Gap between grid cells                    |
