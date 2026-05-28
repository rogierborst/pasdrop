# Plan: Add Tailwind CSS v4 to PassDrop

## Goal

Integrate Tailwind CSS v4 into the Ionic 8 + Capacitor + Vue 3 + Vite project without breaking Ionic's own styling, with working code-completion in PhpStorm.

## Why v4 (not v3)

- First-class `@tailwindcss/vite` plugin — no PostCSS config needed.
- CSS-native `@layer` cascade gives precise control over import order alongside Ionic's CSS.
- Faster builds (incremental rebuilds in microseconds).
- PhpStorm 2024.1+ detects v4 from the CSS import directly — no `tailwind.config.js` required.
- The project targets Android via Capacitor, so v4's browser baseline (Safari 16.4+, Chrome 111+) is not a concern.

---

## Steps

### 1. Install packages

```bash
npm install -D tailwindcss @tailwindcss/vite
```

No PostCSS dependencies are needed for v4 with the Vite plugin.

---

### 2. Update `vite.config.ts`

Add `tailwindcss()` to the plugins array **before** `legacy()`:

```typescript
/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    legacy()
  ],
  build: {
    cssMinify: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
```

---

### 3. Create `src/theme/tailwind.css`

**Do NOT use `@import "tailwindcss"` (the full shorthand).** That includes Preflight, which conflicts with Ionic's own normalize/structure resets and can break Ionic component layouts.

Instead, import only the theme tokens and utility classes:

```css
/* src/theme/tailwind.css */

/* Declare layer order so Tailwind utilities win over Ionic base styles */
@layer theme, base, components, utilities;

/* Theme tokens (CSS custom properties: --color-*, --font-*, --spacing-*, etc.) */
@import "tailwindcss/theme.css" layer(theme);

/* Utility classes — intentionally omitting preflight.css to avoid Ionic conflicts */
@import "tailwindcss/utilities.css" layer(utilities);

/* Platform-specific variants for conditional Ionic platform styling */
@custom-variant android (.md &);
@custom-variant ios (.ios &);

/*
 * Optional: map Ionic design tokens into Tailwind's theme so you can write
 * bg-primary, text-danger, etc. and they follow Ionic's theming / dark mode.
 *
 * @theme {
 *   --color-primary:   var(--ion-color-primary);
 *   --color-secondary: var(--ion-color-secondary);
 *   --color-success:   var(--ion-color-success);
 *   --color-warning:   var(--ion-color-warning);
 *   --color-danger:    var(--ion-color-danger);
 * }
 */
```

---

### 4. Update `src/main.ts`

Add the Tailwind import **last** — after all Ionic CSS and `variables.css`. This ensures Tailwind's utility layer overrides Ionic's optional utility classes when there is a specificity tie.

```typescript
// ... existing imports unchanged ...
import './theme/variables.css';
import 'vue-color/style.css';
import './theme/tailwind.css'; // <-- add here, last CSS import
```

---

### 5. (Optional) Create `tailwind.config.js` for older PhpStorm support

PhpStorm 2024.1+ detects Tailwind v4 automatically from the CSS import — no JS config needed. If autocomplete is not working (older PhpStorm version), create a minimal config and reference it:

**`tailwind.config.js`** (project root):
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{vue,ts,html}'],
  theme: { extend: {} },
  plugins: [],
}
```

**Add to `src/theme/tailwind.css`** (first line):
```css
@config "../../tailwind.config.js";
```

> Note: In v4, `corePlugins.preflight: false` is **not** supported in `tailwind.config.js`. Preflight is disabled by omitting it from CSS imports (already done in Step 3).

---

### 6. Verify PhpStorm code-completion

1. Settings → Plugins → confirm "Tailwind CSS" plugin is enabled (it's bundled since 2024.1).
2. Settings → Languages & Frameworks → Style Sheets → Tailwind CSS — PhpStorm should auto-detect the project.
3. Open any `.vue` file, type `class="` and check for Tailwind class suggestions.
4. Custom theme tokens defined in `@theme {}` blocks are also picked up automatically.

---

## Key constraints and gotchas

| Concern | Resolution |
|---|---|
| Preflight conflicts with Ionic | Import only `theme.css` + `utilities.css`, skip `preflight.css` |
| Ionic utility class names | All prefixed `ion-*` — no naming clash with Tailwind |
| Applying Tailwind to `ion-content` / `ion-page` | Apply to **inner wrapper divs**, not directly to Ionic components (Shadow DOM internals) |
| Dark mode | Both Ionic and Tailwind default to `.dark` class on `html` — fully compatible |
| CSS variable namespaces | Ionic uses `--ion-*`, Tailwind v4 uses `--color-*`/`--font-*`/`--spacing-*` — no overlap |
| Import order | Tailwind CSS must be imported **after** all Ionic CSS in `main.ts` |
| `@vitejs/plugin-legacy` | Compatible — keep `tailwindcss()` before `legacy()` in plugins array |

---

## Files changed

| File | Action |
|---|---|
| `package.json` | `tailwindcss` + `@tailwindcss/vite` added to devDependencies |
| `vite.config.ts` | Import + add `tailwindcss()` plugin |
| `src/theme/tailwind.css` | **New file** — selective Tailwind imports, custom variants |
| `src/main.ts` | Add `import './theme/tailwind.css'` as last import |
| `tailwind.config.js` | **Optional** — only needed for older PhpStorm versions |
