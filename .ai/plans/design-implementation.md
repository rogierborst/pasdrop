# Plan: Implement Passify Design

Reference design: `.ai/design-bundle/passify/project/Passify.html`  
Decisions confirmed: bottom sheet detail, no header action buttons, Space Grotesk font, `expires` as card sub-line.

---

## Design overview

| Area | Design spec |
|---|---|
| Background | `oklch(10% 0.008 250)` ≈ `#0e0f14` |
| Sheet background | `oklch(13% 0.01 250)` ≈ `#141720` |
| Font | Space Grotesk (300–700) |
| Card aspect ratio | 1.586 (credit card) |
| Card peek offset | 62px — each card title peeks above the one in front |
| Card colors | Muted/desaturated: `#3d5248`, `#4a3629`, `#2e3542`, etc. |
| Card shadow | `0 10px 36px rgba(0,0,0,0.55)` |
| Card press | `scale(0.978)`, `transition 0.14s ease` |
| Grain texture | SVG `feTurbulence` overlay at 15% opacity |
| Tab active | White pill, dark text, `fontWeight 600` |
| Tab inactive | `rgba(255,255,255,0.07)` bg, `rgba(255,255,255,0.5)` text |
| FAB | 56×56 white rounded button, `"Add pass"` ghost label beside it |
| Detail sheet | `IonModal` sheet, `breakpoints=[0,1]`, `initialBreakpoint=1` |

---

## Files to create

| File | Purpose |
|---|---|
| `src/components/GrainOverlay.vue` | SVG feTurbulence noise texture — reused on every card |
| `src/components/PassCard.vue` | Single credit-card-ratio pass tile |
| `src/components/CardStack.vue` | Stacked layout + pointer-based drag-to-reorder |
| `src/components/PassDetailSheet.vue` | Bottom sheet: large barcode/QR, editable fields, delete |

## Files to modify

| File | Change |
|---|---|
| `index.html` | Add Space Grotesk Google Fonts `<link>` |
| `src/theme/tailwind.css` | Map design color tokens into `@theme {}` |
| `src/theme/variables.css` | Override `--ion-background-color` and `--ion-toolbar-background` to match dark theme |
| `src/views/PassesPage.vue` | Full layout redesign — header, tabs, CardStack, FAB, detail modal |
| `src/components/PassList/PassList.vue` | Will be superseded — leave in place but no longer imported |
| `src/components/PassList/PassListItem.vue` | Will be superseded — leave in place |

The `/pass/:id` route and `ShowPassPage.vue` stay in the router for now — they aren't deleted in this phase.

---

## Step 1 — Font

In `index.html`, add inside `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
```

In `src/theme/variables.css`, add globally:

```css
:root {
  --ion-font-family: 'Space Grotesk', sans-serif;
}
```

---

## Step 2 — Design tokens

In `src/theme/tailwind.css`, extend the `@theme {}` block (already started by the user):

```css
@theme {
  /* Design surface colors */
  --color-surface:       oklch(10% 0.008 250);   /* app bg */
  --color-surface-sheet: oklch(13% 0.01 250);    /* bottom sheet bg */
  --color-surface-raised: rgba(255,255,255,0.07); /* inactive tab bg */

  /* Text colors */
  --color-muted:         rgba(255,255,255,0.35);
  --color-subtle:        rgba(255,255,255,0.5);
  --color-faint:         rgba(255,255,255,0.25);

  /* Tab active */
  --color-tab-active-bg:   #ffffff;
  --color-tab-active-text: #0a0a0c;
}
```

In `src/theme/variables.css`, override Ionic's dark-mode background variables so `IonPage` and `IonToolbar` pick up the design colors:

```css
body.dark {
  --ion-background-color:          oklch(10% 0.008 250);
  --ion-background-color-rgb:      14,15,20;
  --ion-toolbar-background:        oklch(10% 0.008 250);
  --ion-item-background:           transparent;
  --ion-tab-bar-background:        oklch(10% 0.008 250);
}
```

---

## Step 3 — GrainOverlay component

`src/components/GrainOverlay.vue`

Thin wrapper around the SVG `feTurbulence` filter from the design. Positioned `absolute inset-0` so it layers over the card background without affecting layout.

```vue
<template>
  <svg class="absolute inset-0 w-full h-full opacity-15 pointer-events-none" aria-hidden="true">
    <filter :id="`grain-${id}`">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" :filter="`url(#grain-${id})`" />
  </svg>
</template>

<script setup lang="ts">
defineProps<{ id: string }>()
</script>
```

---

## Step 4 — PassCard component

`src/components/PassCard.vue`

**Props:** `pass: Pass`  
**Emits:** `tap`

Key design specs translated to Tailwind + inline styles:

```
aspect-ratio: 1.586  (no Tailwind shorthand → inline style or custom @theme --ratio-card)
border-radius: 20px   → rounded-[20px]
padding: 20px 22px 18px → custom inline
box-shadow: 0 10px 36px rgba(0,0,0,0.55) → shadow-[0_10px_36px_rgba(0,0,0,0.55)]
overflow: hidden → overflow-hidden
position: relative → relative
cursor: pointer → cursor-pointer
user-select: none → select-none
```

**Layout (flex column, space-between):**
- Top section: `pass.label` (22px / 700 / -0.025em) + `pass.expires` if set (12px / 500 / rgba(255,255,255,0.65))
- Middle: spacer (`flex-1`)
- Bottom: barcode strip 34px tall — render into a `<canvas>` using jsbarcode (format != QR_CODE) or qrcode (QR_CODE), tinted with `rgba(255,255,255,0.38)` fill color

**Barcode rendering on card:**
- For non-QR formats: use `JsBarcode(canvasRef.value, pass.data, { lineColor: 'rgba(255,255,255,0.38)', background: 'transparent', displayValue: false, height: 34 })` — render to a hidden canvas, display as `<img :src="dataUrl">`
- For QR_CODE: use `QRCode.toDataURL(pass.data, { color: { dark: '#ffffff61', light: '#00000000' }, width: 34, margin: 0 })` — display as 34×34 `<img>`

**Press animation:** `ref<boolean>(pressed)` toggled on `pointerdown/pointerup/pointerleave`, applied as `:style="{ transform: pressed ? 'scale(0.978)' : 'scale(1)', transition: 'transform 0.14s ease' }"`

---

## Step 5 — CardStack component

`src/components/CardStack.vue`

**Props:** `passes: Pass[]`  
**Emits:** `tap` (Pass)

### Stacking math

```
PEEK = 62          // px each card's top edge peeks above the card in front
totalHeight = cardHeight + (n - 1) * PEEK
cardHeight  = containerWidth / 1.586    // measured via ResizeObserver
```

Cards are `position: absolute` inside a container whose height is `totalHeight`. Card `i` (0 = back, n-1 = front) sits at `top: i * PEEK` with `z-index: i + 1`.

### ResizeObserver

Use `onMounted` + `ResizeObserver` on the container ref to keep `cardHeight` reactive. Clean up in `onUnmounted`.

### Drag-to-reorder

Use **pointer events** directly (not `createGesture` — that's for swipe navigation). Pattern from the design:

1. `onPointerDown` on a card wrapper: record `grabOffsetY`, add `pointermove`/`pointerup` listeners on `window`.
2. In `pointermove`: if displacement > 7px, enter drag mode. Compute `targetIdx = clamp(round((cardY + cardHeight/2) / PEEK), 0, n-1)`. Store in `dragState`.
3. In `pointerup`: if not dragging → `emit('tap', pass)`. If dragging → commit reorder via `setOrder()`. Clear `dragState`.
4. Non-dragged cards animate their `top` to `targetIdx * PEEK` using `transition: top 0.28s cubic-bezier(0.22,1,0.36,1)`.
5. Dragged card: elevated `z-index: n+1`, `scale(1.04)`, shadow `0 20px 50px rgba(0,0,0,0.7)`.
6. Set `touch-action: none` on the container to prevent scroll interference.

### Order state

`order` is a `ref<string[]>` (array of pass IDs). Initialized from `props.passes`. Watch `props.passes` (shallow) and reset order when tab switches.

### Empty state

When `passes.length === 0` render a centered placeholder (card icon + "No passes here yet") at 30% opacity.

---

## Step 6 — PassDetailSheet component

`src/components/PassDetailSheet.vue`

**Props:** `pass: Pass`, `isOpen: boolean`  
**Emits:** `close`, `update` (pass: Pass), `delete` (id: string)

### IonModal sheet setup

```vue
<IonModal
  :is-open="isOpen"
  :breakpoints="[0, 1]"
  :initial-breakpoint="1"
  :can-dismiss="true"
  @did-dismiss="$emit('close')"
>
```

`canDismiss: true` allows swipe-down to dismiss. No custom handle needed — IonModal renders one automatically when breakpoints are provided.

### Override IonModal styling (scoped CSS using `::part`)

```css
ion-modal::part(content) {
  border-radius: 28px 28px 0 0;
  background: oklch(13% 0.01 250);
}
```

### Sheet interior layout

1. **Header row:** pass label (17px / 700) on the left + "Edit" / "Save" toggle button on the right
   - Edit state: `rgba(255,255,255,0.08)` bg, `rgba(255,255,255,0.6)` text
   - Save state: white bg, `#000` text

2. **Barcode panel:** white rounded card (`bg-white rounded-[18px]`)
   - Label: "BARCODE" or "QR CODE" (10px / uppercase / 0.14em / 40% black)
   - Barcode: `JsBarcode` rendered at 260×110px for barcodes, `QRCode` at 200×200px for QR — color `#111`
   - Code value below: 12px / 0.18em letter-spacing / 35% black

3. **Editable fields** (name, notes, expires):
   - View mode: label (10px uppercase) + value (15px / 500 / white)
   - Edit mode: `<input>` styled with `bg-white/[0.08] border border-white/15 rounded-[10px]`

4. **Actions:**
   - "Done" button: `bg-white/[0.08]`, white text, `rounded-[14px]`, 14px → calls `$emit('close')`
   - "Remove Pass" button: transparent bg, `border border-red-500/25`, `text-red-400/70`, → confirmation alert → `$emit('delete', pass.id)`

### Edit logic

Local `draft` ref cloned from `pass` on open. On Save: emit `update` with draft fields. Parent (`PassesPage`) calls `passesStore.updatePass(id, fields)`.

---

## Step 7 — PassesPage redesign

`src/views/PassesPage.vue` — complete template rewrite using the new components.

### Layout structure

```
IonPage
  IonContent (fullscreen, scrollY=false)
    div.flex.flex-col.h-full (app bg: bg-surface)
      ── Header ───────────────────────── flex-shrink-0, px-6 pt-5
         "Your wallet" eyebrow text
         "Passify" title
      ── Category tabs ────────────────── flex-shrink-0, px-6 pb-1, gap-1.5, overflow-x-auto
         tab pill × (n categories + 1 "All" tab)
      ── Divider ──────────────────────── h-px bg-white/5
      ── CardStack ────────────────────── flex-1 overflow-y-auto, px-5 pt-5 pb-[100px]
         <CardStack :passes="filteredPasses" @tap="openDetail" />
      ── FAB ──────────────────────────── absolute bottom-6 right-5, flex items-center gap-2.5
         "Add pass" ghost label
         scan button (white 56×56 rounded-[18px])
    PassDetailSheet (:is-open="!!selectedPass" :pass="selectedPass" ...)
```

### Header markup

```html
<div class="px-6 pt-5 flex-shrink-0">
  <div class="text-[11px] uppercase tracking-[0.18em] font-medium text-white/35 mb-0.5">
    Your wallet
  </div>
  <div class="text-[26px] font-bold tracking-[-0.04em] text-white leading-none">
    Passify
  </div>
</div>
```

### Category tabs

- "All" tab → `categoriesStore.selectedCategoryId = null`
- Category tab → `categoriesStore.selectedCategoryId = category.id`
- Count badge shows pass count for that category (or total for "All")

Active pill classes:
```
bg-white text-[#0a0a0c] font-semibold
```
Inactive pill classes:
```
bg-white/[0.07] text-white/50 font-normal
```
Badge: active `bg-black/[0.12] text-black`, inactive `bg-white/10 text-white/40`

### FAB

```html
<div class="absolute bottom-6 right-5 flex items-center gap-2.5">
  <div class="bg-white/[0.06] border border-white/[0.08] rounded-2xl px-4 py-2.5
              text-white/50 text-xs font-medium tracking-[0.02em]">
    Add pass
  </div>
  <button @click="router.push('/add')"
          class="w-14 h-14 rounded-[18px] bg-white flex items-center justify-center
                 shadow-[0_8px_24px_rgba(0,0,0,0.5)] border-none">
    <!-- scan SVG icon -->
  </button>
</div>
```

### State

```typescript
const selectedPass = ref<Pass | null>(null)
const openDetail = (pass: Pass) => { selectedPass.value = pass }
const closeDetail = () => { selectedPass.value = null }
const handleUpdate = (updated: Pass) => passesStore.updatePass(updated.id!, updated)
const handleDelete = (id: string) => { passesStore.deletePass(id); closeDetail() }
```

---

## Step 8 — IonContent / IonPage dark background

To prevent the white flash on page load and ensure `IonContent` uses the design background:

```css
/* in variables.css dark block */
--ion-background-color: oklch(10% 0.008 250);
--ion-text-color: #ffffff;
```

And on `IonContent` in PassesPage, add `color-scheme: dark` and use `:style` or `--background` CSS variable:

```vue
<IonContent :style="{ '--background': 'oklch(10% 0.008 250)' }">
```

---

## Implementation order

1. `index.html` — Space Grotesk font link
2. `src/theme/variables.css` — font family + dark bg overrides
3. `src/theme/tailwind.css` — design tokens in `@theme {}`
4. `src/components/GrainOverlay.vue` — tiny, no dependencies
5. `src/components/PassCard.vue` — depends on GrainOverlay
6. `src/components/CardStack.vue` — depends on PassCard
7. `src/components/PassDetailSheet.vue` — depends on IonModal
8. `src/views/PassesPage.vue` — wires everything together

---

## Open questions / deferred

- **Drag reorder persistence**: CardStack manages display order locally. If we want the reordered order to survive page navigation, `passesStore` needs a `reorderPasses(categoryId, newOrder)` action. Deferred unless needed.
- **ShowPassPage.vue**: Remains in the router at `/pass/:id` but is visually outdated after this change. Can be redesigned or removed in a follow-up.
- **Add pass flow (`/add`)**: Not touched in this plan. The FAB links to the existing route.
- **Haptic feedback**: The design doesn't spec it, but per `CLAUDE.md` touch interactions should have haptics. Add `Haptics.impact()` on card tap and drag-start in a follow-up.
