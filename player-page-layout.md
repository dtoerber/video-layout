# Player Page Layout System

This document describes the adaptive layout system for the video player page, designed to work across different monitor sizes from 1080p to ultrawide to 4K.

## Problem Statement

The original layout used fixed viewport-width percentages (45vw, 60vw, 80vw) for video sizing without considering:
- Screen height (1080p has much less vertical space than 4K)
- Monitor aspect ratio (ultrawide 21:9 vs standard 16:9)
- The play-grid getting squeezed when video is large on smaller monitors

On a 1080p monitor with an 80vw video:
- Width: 80% of 1920px = 1536px
- Height: 1536px × 9/16 = 864px (due to 16:9 aspect ratio)
- Remaining for play-grid: ~200px (unusable)

## Solution Overview

The solution consists of three phases:

1. **Phase 1**: Height constraints to guarantee minimum play-grid space
2. **Phase 2**: Horizontal layout mode for ultrawide monitors
3. **Phase 3**: Container queries for play-grid component adaptation

---

## Phase 1: Height Constraints

**Files Modified:**
- `src/app/new-video/components/player-page/player-page.component.scss`

### Approach

Added CSS variables that calculate maximum video height based on available space:

```scss
$header-height: 42px;
$min-playgrid-height: 280px;  // Guarantees ~6 visible rows
$grid-header-height: 90px;    // Space for header/filters
$available-height: calc(100vh - #{$header-height});
$max-video-height: calc(#{$available-height} - #{$min-playgrid-height} - #{$grid-header-height});
```

### Implementation

1. **Video container max-height**: Prevents video from exceeding calculated maximum
   ```scss
   .video-player-container {
     max-height: $max-video-height;
   }
   ```

2. **Grid column width constraint**: Uses `min()` to respect both width preference and height constraint
   ```scss
   grid-template-columns: min(#{$video-size-large}, calc(#{$max-video-height} * 16 / 9)) ...;
   ```

### Result

| Monitor | Before | After |
|---------|--------|-------|
| 1080p + Large video | Play-grid ~200px | Play-grid ≥280px guaranteed |
| 4K | Works fine | No change (height not constraining) |

---

## Phase 2: Horizontal Layout Mode

**Files Modified:**
- `src/app/new-video/components/player-page/player-page.component.ts`
- `src/app/new-video/components/player-page/player-page.component.html`
- `src/app/new-video/components/player-page/player-page.component.scss`

### Approach

Detects monitor aspect ratio and switches between vertical and horizontal layouts:

```typescript
enum LayoutMode {
  VERTICAL = 'vertical',    // Video above, grid below
  HORIZONTAL = 'horizontal' // Video left, grid right
}
```

### Detection Logic

Uses `screen.width / screen.height` to measure the actual monitor aspect ratio. This is intentional — the previous implementation used `window.innerWidth / window.innerHeight` (viewport ratio), which was inflated by display scaling and browser chrome, causing standard 16:9 monitors like 2560x1440 at 125% scaling to be misidentified as ultrawide.

**Why `screen` instead of `window.inner*`:**

| API | What it measures | Affected by scaling? | Affected by browser chrome? |
|-----|-----------------|---------------------|-----------------------------|
| `screen.width / screen.height` | Monitor aspect ratio | No (preserves true ratio) | No |
| `window.innerWidth / window.innerHeight` | Viewport aspect ratio | Yes (reduces CSS pixels) | Yes (subtracts toolbars from height only) |

On a 2560x1440 monitor at 125% scaling, `window.innerWidth / window.innerHeight` reports ~2048/1000 = 2.05 (falsely exceeds 2.0), while `screen.width / screen.height` correctly reports 2048/1152 = 1.78.

```typescript
private updateLayoutMode(): void {
  const screenAspectRatio = screen.width / screen.height;

  // 21:9 ultrawide = 2.33, 16:9 standard = 1.78
  if (screenAspectRatio > 2.0) {
    this.layoutMode = LayoutMode.HORIZONTAL;
  } else {
    this.layoutMode = LayoutMode.VERTICAL;
  }
}
```

### Layout Structures

**Vertical Layout (Standard Monitors)**
```
┌─────────────────────────────────────┐
│           Video Player              │
├──────────────┬──────────┬───────────┤
│ Header/Filters │ Controls │  Gutter  │
├──────────────┴──────────┴───────────┤
│            Play-Grid                │
└─────────────────────────────────────┘
```

**Horizontal Layout (Ultrawide Monitors)**
```
┌──────────────┬──────────────────┬─────────┬───┐
│              │                  │FullScrn │ G │
│              │  Header/Filters  ├─────────┤ u │
│    Video     │                  │  Sizes  │ t │
│    Player    ├──────────────────┼─────────┤ t │
│              │     Roster       │  Views  │ r │
│              ├──────────────────┴─────────┴───┤
│              │           Play-Grid            │
└──────────────┴────────────────────────────────┘
```
Note: Gutter (settings icon) only spans top rows; play-grid extends to edge.

### Horizontal Mode Grid Structure

```scss
&.layout-horizontal {
  // Row heights: auto for content-sized rows, 1fr for play-grid
  // Using 'auto' prevents excessive whitespace above roster on tall screens
  grid-template-rows: auto auto auto 1fr;

  // Gutter only spans top rows; play-grid extends to right edge
  // Fullscreen button (right-0) in its normal position above size controls
  grid-template-areas:
    'left upper-middle right-0 right-gutter'
    'left upper-middle right-1 right-gutter'
    'left lower-middle right-2 right-gutter'
    'left bottom bottom bottom';

  // Size-specific column widths (video | content | controls | gutter)
  &.size-small  { grid-template-columns: 35% minmax(100px, 1fr) 170px 40px; }
  &.size-medium { grid-template-columns: 45% minmax(100px, 1fr) 170px 40px; }
  &.size-large  { grid-template-columns: 55% minmax(100px, 1fr) 170px 40px; }
  &.size-xlarge { grid-template-columns: 65% 1fr auto 40px; }
}
```

### Row Sizing Strategy

The horizontal layout uses `auto auto 1fr` for row heights:

- **Row 1 (auto)**: Header/Filters - sized by content
- **Row 2 (auto)**: Roster - sized by content
- **Row 3 (1fr)**: Play-grid - takes all remaining space

This ensures:
- No excessive whitespace above the roster on tall/wide screens
- The video panel fills available height without pushing rows
- The play-grid maximizes its available space

### Controls in Horizontal Mode

All control sections remain in their normal positions in horizontal mode:
- **right-section-0**: Fullscreen toggle button
- **right-section-1**: Video size controls (S/M/L/X)
- **right-section-2**: XOS buttons and play views
- **right-gutter**: Settings icon only (spans top rows, not full height)

---

## Phase 3: Container Queries

**Files Modified:**
- `src/app/new-video/components/play-grid/play-grid.component.scss`
- `src/app/new-video/components/play-grid/play-grid.component.html`

### Approach

Uses CSS Container Queries to adapt the play-grid based on its actual container size, not the viewport. This is critical because in horizontal mode, the play-grid might be narrow even on a wide screen.

### Container Setup

```scss
:host {
  display: block;
  height: 100%;
  container-type: size;
  container-name: playgrid;
}
```

### Breakpoints

| Container Size | Adaptations |
|----------------|-------------|
| **Height < 400px** | Compact rows (32px), smaller buttons |
| **Height < 300px** | Very compact rows (28px), hide cutup name |
| **Width < 600px** | Stack button row vertically |
| **Width < 450px** | Hide secondary buttons, narrower search |
| **Width > 1200px** | Wider description column, larger search |
| **Width < 500px AND Height < 350px** | Hide button row entirely |

### Example Container Query

```scss
@container playgrid (max-height: 400px) {
  mat-header-row, mat-row {
    min-height: 32px;
  }

  .button-row {
    min-height: 36px;

    button {
      padding: 0 4px;
      font-size: 12px;
    }
  }
}
```

---

## Video Player Size Options

The user can select from four video sizes (S, M, L, X) which work in both layout modes:

| Size | Vertical Mode | Horizontal Mode |
|------|---------------|-----------------|
| **Small** | 45vw (height-constrained) | 35% of width |
| **Medium** | 60vw (height-constrained) | 45% of width |
| **Large** | 80vw (height-constrained) | 55% of width |
| **XLarge** | Full width, controls below | 65% of width |

---

## Key CSS Properties

### Vertical Mode - Video Constraints

```scss
.video-player-container {
  width: 100%;
  aspect-ratio: 16 / 9;
  // Height constraint ensures minimum play-grid space
  max-height: $max-video-height;
}
```

### Horizontal Mode - Video Constraints

```scss
.layout-horizontal .left-panel {
  overflow: hidden;
  min-height: 0;
  align-self: stretch;  // Fill available height without pushing rows

  .video-player-container {
    width: 100%;         // Fill column width
    height: auto;        // Height from aspect ratio
    max-height: 100%;    // Don't exceed panel bounds
    aspect-ratio: 16 / 9;
  }
}

### Ensuring Play-Grid Fills Space

```scss
.bottom-section {
  grid-area: bottom;
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
```

---

## Browser Support

- **CSS Container Queries**: Supported in Chrome 105+, Firefox 110+, Safari 16+
- **CSS `min()` function**: Supported in all modern browsers
- **CSS Grid**: Supported in all modern browsers
- **aspect-ratio property**: Supported in Chrome 88+, Firefox 89+, Safari 15+

---

## Validation by Device / Resolution

The layout should be validated across the following device classes. For each, verify the expected layout mode, that the play-grid has usable space, and that all controls are accessible.

### Device Reference

| Device | Native Resolution | Typical Scaling | CSS Screen Size | Screen Ratio | Expected Layout |
|--------|-------------------|-----------------|-----------------|--------------|-----------------|
| **Surface Pro** | 2880×1920 | 200% | 1440×960 | 1.50 | Vertical |
| **Surface Laptop** | 2256×1504 | 150% | 1504×1003 | 1.50 | Vertical |
| **1080p Monitor** | 1920×1080 | 100% | 1920×1080 | 1.78 | Vertical |
| **1440p Monitor** | 2560×1440 | 100% | 2560×1440 | 1.78 | Vertical |
| **1440p Monitor** | 2560×1440 | 125% | 2048×1152 | 1.78 | Vertical |
| **1440p Monitor** | 2560×1440 | 150% | 1707×960 | 1.78 | Vertical |
| **4K Monitor** | 3840×2160 | 150% | 2560×1440 | 1.78 | Vertical |
| **Ultrawide** | 2560×1080 | 100% | 2560×1080 | 2.37 | Horizontal |
| **Ultrawide** | 3440×1440 | 100% | 3440×1440 | 2.39 | Horizontal |
| **Super Ultrawide** | 5120×1440 | 100% | 5120×1440 | 3.56 | Horizontal |

### Checklist Per Device

1. **Layout mode** — Confirm the correct layout mode is active (vertical or horizontal)
2. **Play-grid visibility** — At least 280px of vertical space for the play-grid in vertical mode
3. **Video sizing** — All size options (S/M/L/X) render the video without overflow or clipping
4. **Controls** — Size buttons, fullscreen toggle, settings gutter, and roster are all accessible
5. **Container query adaptation** — Play-grid adapts row height and button visibility to available space

### DevTools Limitations

Chrome DevTools responsive mode overrides both `window.innerWidth/innerHeight` and `screen.width/screen.height` to the same custom dimensions. This means:

- You **cannot** simulate the difference between screen and viewport dimensions in DevTools
- To test layout mode switching in DevTools, enter the **screen dimensions** (CSS pixels after scaling), not the viewport dimensions
- Example: for a 2560x1440 monitor at 125% scaling, enter **2048x1152** (not 2048x1000)
- For ultrawide testing, enter **3440x1440** or **2560x1080**

For accurate validation of the `screen.width / screen.height` detection, test on actual hardware or use remote debugging with physical devices.

---

## File Reference

| File | Purpose |
|------|---------|
| `player-page.component.ts` | Layout mode detection, resize handling |
| `player-page.component.html` | Grid structure, layout mode classes |
| `player-page.component.scss` | Grid definitions, responsive rules |
| `play-grid.component.scss` | Container queries for grid adaptation |
| `play-grid.component.html` | Wrapper structure for container queries |
