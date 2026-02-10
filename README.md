# Adaptive Video Player Layout

A CSS-first adaptive layout prototype for a video player page. Designed to handle all screen sizes from mobile to ultrawide with a single set of CSS custom properties — no JavaScript layout detection needed.

## Development Server

```bash
ng serve
```

Open `http://localhost:4200/` in your browser.

## Architecture

### CSS Custom Property Chain

All layout dimensions derive from a single input: `--video-width` (set via Angular signal binding). CSS computes everything else:

```
--video-width (input from ResizeService signal)
  → --video-height          = video-width * 9 / 16
  → --max-video-height      = 100vh - nav - min-grid-height
  → --max-video-width       = 100vw - 200px
  → --actual-video-height   = min(video-height, max-video-height)
  → --actual-video-width    = min(actual-video-height * 16/9, max-video-width)
  → --panel-row-height      = actual-video-height / 3
```

This chain guarantees:
- Video always maintains 16:9 aspect ratio
- Grid-bottom always gets at least `$min-grid-height` (200px) of vertical space
- Panels always get at least 200px of combined horizontal space (100px each column)
- No JavaScript layout detection or per-device breakpoints needed

### Grid Structure

The page uses a flat CSS Grid with 8 direct children:

```
┌────────────┬──────────┬──────────┐
│            │  um-1    │  ur-1    │
│            ├──────────┼──────────┤
│   video    │  um-2    │  ur-2    │
│            ├──────────┼──────────┤
│            │  um-3    │  ur-3    │
├────────────┴──────────┴──────────┤
│          grid-bottom             │
└──────────────────────────────────┘
```

Grid areas are reassigned via `grid-template-areas` in each media query — the HTML never changes.

## Layout Modes

### 1. Standard Desktop (default)

**No media query — this is the base layout.**

- 3-column grid: video | upper-middle panels | upper-right panels
- Video spans 3 rows on the left, sized by CSS custom properties
- 4th row (`1fr`) is grid-bottom spanning full width
- Video width is user-resizable via drag handle
- Height is constrained so grid-bottom always has at least 200px

```
Columns: [actual-video-width] [1fr] [1fr]
Rows:    [panel-row-height] [panel-row-height] [panel-row-height] [1fr]
```

### 2. Ultrawide

**Media query:** `(min-aspect-ratio: 2/1) and (min-width: 1200px)`

- Video takes full page height (no height constraint)
- Grid-bottom moves beside the video in the 4th row instead of below it
- Panels stack in 3 rows to the right of the video
- Grid-bottom shares the bottom row with the video

```
┌────────────┬──────────┬──────────┐
│            │  um-1    │  ur-1    │
│            ├──────────┼──────────┤
│   video    │  um-2    │  ur-2    │
│            ├──────────┼──────────┤
│            │  um-3    │  ur-3    │
│            ├──────────┴──────────┤
│            │     grid-bottom     │
└────────────┴─────────────────────┘
```

### 3. Mobile Portrait

**Media query:** `(max-width: 768px) and (orientation: portrait)`

- Single column layout
- Video on top, sized to `min(100vw * 9/16, 40vh)` to preserve 16:9 while capping at 40% of viewport height
- Grid-bottom fills remaining space below
- All 6 panels are hidden (`display: none`)

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

| File | Purpose |
|------|---------|
| `src/app/components/layout-one/layout-one.scss` | Grid definitions, CSS custom properties, all 4 layout modes, container query placeholders |
| `src/app/components/layout-one/layout-one.html` | Flat grid structure with 8 children, `--video-width` binding |
| `src/app/components/layout-one/layout-one.ts` | Resize drag handling via Renderer2, injects ResizeService |
| `src/app/services/resize.service.ts` | `videoWidth` signal (input), `videoHeight` computed signal |
| `src/app/components/nav/nav.component.scss` | Toolbar hidden in mobile landscape |

## Video Resize

The video section has a drag handle on its right edge. Dragging updates `ResizeService.videoWidth`, which flows into the `--video-width` CSS custom property. The entire CSS custom property chain recalculates automatically — no JavaScript dimension logic needed.

- Minimum width: 200px (enforced in ResizeService)
- Maximum width: constrained by `--max-video-width` (`100vw - 200px`) to ensure panels remain visible
- Maximum height: constrained by `--max-video-height` to ensure grid-bottom has space

## Video Element

The video section contains an HTML5 `<video>` element with `object-fit: contain`, ensuring the video scales within its grid cell without cropping while maintaining its native aspect ratio.

## Container Queries

The grid-bottom section is configured as a container query context (`container-type: size`, `container-name: playgrid`). Breakpoint placeholders exist for:

- `max-height: 300px` — compact mode for limited vertical space
- `max-width: 500px` — narrow mode for limited horizontal space

These are ready to be populated with content adaptation rules (compact rows, hidden controls, etc.) when real content is added.

## Testing in DevTools

All layout modes use CSS media queries on **viewport dimensions**, not `screen.width/screen.height`. This means every layout mode can be validated in Chrome DevTools responsive mode:

| Layout | DevTools Dimensions |
|--------|-------------------|
| Standard Desktop | 1920 x 1080 |
| Ultrawide | 2560 x 1080 (or any width:height > 2:1 and width > 1200px) |
| Mobile Portrait | 375 x 812 (or any width < 768px, portrait) |
| Mobile Landscape | 812 x 375 (or any height < 480px, landscape) |

## Configuration

SCSS variables at the top of `layout-one.scss`:

| Variable | Default | Purpose |
|----------|---------|---------|
| `$nav-height` | `64px` | Height of the navigation toolbar |
| `$min-grid-height` | `200px` | Minimum guaranteed height for grid-bottom |
| `$gap` | `0px` | Gap between grid cells |
