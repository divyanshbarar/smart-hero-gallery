# Smart Hero Gallery (Alive)

Used Expo SDK 54.
A horizontally scrollable, performance-optimised hero gallery that fetches media from backend api, applies smart layout, and supports full-screen viewing with zoom.

---
<img src="/ss1.jpg" width="280" height="580"/>


## Setup & Running

**Prerequisites**
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator / Android Emulator, or a physical device with Expo Go

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```
---

## Tech Stack & Dependencies

| Package | Version | Purpose |
|---|---|---|
| `expo` | ~54.0.33 | Expo SDK |
| `expo-router` | ~6.0.23 | File-based navigation |
| `expo-video` | ~3.0.16 | High-performance video playback |
| `expo-image` | ~3.0.11 | Optimised image rendering + `Image.prefetch` |
| `expo-splash-screen` | ~31.0.13 | Custom splash screen |
| `react-native-gesture-handler` | ~2.28.0 | Pinch and double-tap zoom gestures |
| `react-native-reanimated` | ~4.1.1 | Smooth animated zoom transforms |
| `react-native-safe-area-context` | ~5.6.0 | Safe area insets (notch/home bar) |
| `@react-navigation/native` | ^7.1.8 | Navigation theming |

---

## Project Structure

```
smart-gallery-alive/
├── app/
│   ├── _layout.tsx          # Root layout: GestureHandlerRootView, SplashScreen, Navigation stack
│   └── index.tsx            # Entry screen — renders SmartHeroGallery inside SafeAreaView
│
├── components/
│   ├── SmartHeroGallery.tsx # Top-level gallery: FlatList of pages, nudge, dots, modal trigger
│   ├── GalleryPage.tsx      # Single page: 2-column layout (hero left + 2 stacked right)
│   ├── GalleryTile.tsx      # Single tile: TouchableOpacity wrapper around MediaTile
│   ├── MediaTile.tsx        # Renders image or video with progressive loading + playback
│   ├── FullScreenGallery.tsx# Full-screen modal: carousel + video player + close button
│   ├── ZoomableImage.tsx    # Zoomable image: double-tap + pinch with pan support
│   └── ScrollNudge.tsx      # Chevron button shown on page 1 to hint more content
│
├── hooks/
│   └── useGallery.ts        # Fetches API, stores items, runs buildPages via useMemo
│
├── utils/
│   ├── buildPages.ts        # Core deterministic page-building logic
│   └── galleryUtils.ts      # CDN URL builders for images, videos, and posters
│
└── constants/
    └── gallery.ts           # Types (GalleryItem, PageLayout), CDN constants, API URL
```

---

## Data Flow

```
API
 └─▶ useGallery (fetch + state)
       └─▶ buildPages (useMemo — runs once on items change)
             └─▶ SmartHeroGallery (FlatList of PageLayout[])
                   ├─▶ GalleryPage (2-col layout per page)
                   │     ├─▶ GalleryTile (left / rightTop / rightBottom)
                   │     │     └─▶ MediaTile (image or video rendering)
                   │     └─▶ (repeat for other tiles)
                   ├─▶ ScrollNudge (page 1 only)
                   ├─▶ Dots Indicator
                   └─▶ FullScreenGallery Modal (when tile pressed)
                         └─▶ ZoomableImage (for image items)
```

---

## CDN URL Rules

Defined in `constants/gallery.ts` and built in `utils/galleryUtils.ts`.

```
CDN_BASE             = https://cdn.iamalive.app
PROCESSED_MOBILE_PREFIX = /processed/mobile/
PREVIEW_PREFIX       = /processed/preview/
```

| Asset | Preview | Processed | Original |
|---|---|---|---|
| Image | `CDN_BASE + /processed/preview/ + src` | `CDN_BASE + /processed/mobile/ + src` | `CDN_BASE/ + src` |
| Video | — | `CDN_BASE + /processed/mobile/ + src` | `CDN_BASE/ + src` |
| Video Poster | `CDN_BASE + /processed/preview/ + src.webp` | `CDN_BASE + /processed/mobile/ + src.webp` | `CDN_BASE/ + src.webp` |

---

## buildPages Logic

**File**: `utils/buildPages.ts`  
**Signature**: `buildPages(items: GalleryItem[], opts?: { lookahead?: number }): PageLayout[]`

Each call to `buildPages` is pure and deterministic — the same input always produces the same output.

### How a page is built

Each page needs exactly 3 tiles: `left` (hero), `rightTop`, `rightBottom`.

**Step 1 — Video selection (lookahead)**  
A lookahead window of 12 items is taken from the start of `remaining[]`. All videos in that window are scored by `|aspectRatio - 0.5625|` (closeness to 9:16). The video with the lowest score is selected. Tie-breaker: earlier index wins.

**Step 2 — Preferred fill**  
If a video was found, the algorithm tries to find 2 images anywhere in `remaining[]` (outside the selected video index). If 2 images are available:
- `left` = video, `rightTop` + `rightBottom` = the 2 images (in original API order)
- All 3 items are removed from `remaining[]` by descending index to avoid shifting

**Step 3 — Fallback fill**  
If no video was found, or there are fewer than 2 images available, a simple greedy fill is used: iterate `remaining[]` and grab the next 3 items, allowing at most 1 video. If the 3 items contain a video, it is placed on the left; otherwise order is preserved.

**Step 4 — Repeat**  
Loop continues until fewer than 3 items remain (incomplete pages are dropped).

### Order preservation

The API order is preserved as the primary constraint. Items are only reordered when:
1. A video selected from position N needs to be placed at `left` while images from positions earlier than N fill `rightTop`/`rightBottom` — this is the only reorder that happens.
2. The lookahead window is bounded (default 12) to limit how far out of order a video can travel.

---

## Progressive Media Loading & Fallbacks

**File**: `components/MediaTile.tsx`

### Images

A `sourceType` state cycles through `'preview' → 'processed' → 'original'`:

1. The `<Image>` component attempts to load the **preview** URL (small blur placeholder from CDN).
2. On `onError`, `sourceType` advances to `'processed'` (optimised mobile image).
3. On another `onError`, it falls back to `'original'` (full-resolution direct URL).
4. If `'original'` also fails, an error indicator (`!`) is shown.

No HEAD requests are made — errors are handled reactively via `onError`.

### Videos

`expo-video`'s `useVideoPlayer` is used. The video tile:
1. Shows the **preview poster** (`src.webp` from the preview CDN path) while the video loads.
2. Video autoplays when the page is visible (`isVisible` prop), and pauses when scrolled away.
3. Video is muted in the gallery tile.
4. If playback fails, a **"Tap to retry"** overlay appears over the poster image.
5. A transparent `TouchableOpacity` overlay sits on top of the `VideoView` to intercept tap events (since `VideoView` swallows native touches).

---

## Full-Screen Experience

**File**: `components/FullScreenGallery.tsx`

- Opens as a `Modal` with `animationType="fade"` and `statusBarTranslucent` for edge-to-edge coverage.
- `GestureHandlerRootView` is placed **inside** the Modal — required on Android because a Modal creates a new native window outside the app's root gesture context.
- A single `useVideoPlayer` instance is shared at the modal level and swaps the video source as the user swipes.  Calling `player.pause()` in `handleClose()` before `onClose()` prevents a native crash when the player is destroyed mid-playback.
- On close (X button or hardware back button), the player is paused then the modal is dismissed.

**File**: `components/ZoomableImage.tsx`

- `Gesture.Tap().numberOfTaps(2)` handles double-tap to zoom in (2.5×) or reset.
- `Gesture.Pinch()` handles pinch-to-zoom.
- `Gesture.Pan()` handles drag when zoomed in.
- `panGesture.requireExternalGestureToFail(doubleTapGesture)` is the critical fix — without it, Pan activates on first touch movement and steals the second tap before the double-tap gesture can complete.
- Composed as `Simultaneous(doubleTapGesture, pinchGesture, panGesture)` using `react-native-reanimated` shared values for smooth transform animations.

---

## Performance

**FlatList configuration** (`SmartHeroGallery.tsx`)
- `horizontal` + `pagingEnabled` — snaps cleanly to each page.
- `getItemLayout` provided — removes the need for dynamic measurement on every item.
- `showsHorizontalScrollIndicator={false}` — removes UI noise.
- `keyExtractor` uses a stable string (`page-${index}`) to avoid unnecessary re-renders.

**Memoisation**
- `GalleryPage` and `GalleryTile` are wrapped in `React.memo`.
- `renderPage`, `handleNudgePress`, `handleTilePress` are wrapped in `useCallback`.
- `buildPages` is called inside `useMemo` in `useGallery` — re-computation only happens when the `items` array reference changes (i.e., on API fetch).
- `onViewableItemsChanged` is stored in a `useRef` to guarantee a stable reference across renders.

**Video management**
- `useEffect` in `MediaTile` plays/pauses the video player based on the `isVisible` prop.
- `isVisible` is derived from `onViewableItemsChanged` in `SmartHeroGallery` which tracks the current page index.
- When a tile is tapped and the full-screen modal opens, `selectedItemId` becomes non-null. `renderPage` checks `isVisible={visibleIndices.includes(index) && selectedItemId === null}` — this immediately pauses all gallery tile videos the moment the modal opens, preventing two videos playing simultaneously.
- Videos on non-visible pages are paused, preventing background audio and unnecessary decoding.

**Prefetching**
- Every time the user scrolls to a new page (tracked by `onViewableItemsChanged`), `expo-image`'s `Image.prefetch()` is called for pages `N+1` and `N+2`.
- Images prefetch the processed mobile URL.
- Videos prefetch only the poster thumbnail (`.webp`), not the full video file (which would be wasteful on mobile data).

---

## Page Indicator

A row of dots rendered absolutely at the bottom of the gallery. The active page's dot is white and slightly wider (`width: 12`) vs inactive dots which are semi-transparent (`rgba(255,255,255,0.3)`). Updated via `visibleIndices` state from `onViewableItemsChanged`.

---

## Scroll Nudge

A circular chevron button (`ScrollNudge.tsx`) positioned at the right-centre edge of the gallery on Page 1 only. On press it calls `FlatList.scrollToIndex({ index: 1, animated: true })` and hides itself. It also hides automatically as soon as the user scrolls past Page 1 (`!indices.includes(0)`).

---

## Smart Cover Rule (Cropping Approach)

All tiles use `resizeMode="cover"` (React Native `Image`) or `contentFit="cover"` (expo-video `VideoView`). Cover ensures the media always fills its container with no empty space. Cropping is proportional — because the tile dimension closest to the media's native aspect ratio will require no cropping, while the other axis is cropped symmetrically. This means portrait content in a portrait-ish tile crops very little, while a landscape image in a portrait tile only crops the sides. The result is predominantly single-axis cropping rather than cropping on both axes.

In full-screen, `resizeMode="contain"` is used instead so the entire media is visible with no cropping at all.

---

## What I Would Improve With More Time

1. **Smooth zoom reset on swipe** — Currently zooming then swiping to the next item leaves the zoom state on the previous image. Resetting zoom on item change would feel more polished.
2. **Video error handling in full-screen** — The full-screen `VideoView` doesn't yet show a retry overlay if the original URL fails.
3. **Suspense-style skeleton loaders** — Replace the single `ActivityIndicator` with per-tile shimmer placeholders so the layout is visible while media loads.
4. **Accessibility** — Add `accessibilityLabel` using `alt` from the API, `accessibilityRole="image"` / `"button"` on tiles.
5. **Video sound toggle** — Muted autoplay is correct UX for a gallery, but a tap-to-unmute option in the full-screen modal would complete the experience.
6. **Infinite/paginated API** — Currently all items are fetched in one call. For truly large galleries a paginated fetch with `onEndReached` would be needed.
7. **Gesture cancel on scroll** — Swiping the modal carousel while pinch-zoomed on an image can conflict. A scroll lock when `scale > 1` would fix this.
8. **Unit tests for `buildPages`** — The function is pure and deterministic making it an ideal candidate for a full test suite covering edge cases (all videos, all images, one item pages, etc.).
