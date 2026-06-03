# PassDrop — CLAUDE.md

Mobile app for managing barcodes/QR codes ("passes"). Built with Vue 3 + Ionic + Capacitor, targeting Android primarily with web preview support.

## Stack

- **Vue 3** — Composition API, `<script setup lang="ts">` only
- **TypeScript 5.9** — strict mode enabled
- **Ionic Vue 8** — UI framework, routing via `@ionic/vue-router`
- **Pinia 3** — state management, setup-style stores
- **Vite 5** — build tool, path alias `@` → `./src`
- **Capacitor 7** — native bridge for Android
- **Storage** — `@capacitor/preferences` (native key-value store)
- **Barcode libs** — `jsbarcode` (render), `qrcode` (render), `@zxing/browser` (scan in browser), `@capacitor/barcode-scanner` (native scan)

## Project Structure

```
src/
  components/     # Reusable UI (PascalCase, group related in subdirs)
    CodeViewer/
    PassList/
    NativeScanner.vue
    WebScanner.vue
  composables/    # Stateful shared logic (use* prefix)
  router/         # Vue Router config
  stores/         # Pinia stores
  types/          # Shared TypeScript interfaces
  utils/          # Pure functions
  views/          # Page components (*Page.vue suffix)
```

## Core Types

```typescript
interface Pass {
  format: string;   // barcode format (e.g. "QR_CODE", "EAN_13")
  data: string;     // raw barcode value
  label: string;    // user-defined display name
  color: string;    // hex background color
  id?: string;      // timestamp + random suffix
  timestamp?: number;
  expires: string;  // ISO date string or empty
}

interface ScanResult {
  data: string;
  dataType: string; // barcode format
}
```

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `PassEditor.vue` |
| Views (pages) | PascalCase + `Page` suffix | `PassesPage.vue` |
| Stores | `use` prefix + `Store` suffix | `usePassesStore` |
| Composables | `use` prefix | `useSwipeToPage` |
| Utils | camelCase | `textColorForBackground` |

## Component Patterns

```vue
<script setup lang="ts">
// Props — typed generics
const props = defineProps<{ pass: Pass }>()

// Events — typed generics
const emit = defineEmits<{ save: [pass: Pass]; cancel: [] }>()

// Two-way binding
const model = defineModel<Pass>()

// Avoid mutating props directly — clone first
const local = ref(structuredClone(toRaw(props.pass)))
</script>

<style scoped>
/* Always scoped */
</style>
```

## Store Pattern

```typescript
export const usePassesStore = defineStore('passes', () => {
  const passes = ref<Pass[]>([]);

  const saveToStorage = async (data: Pass[]) => { /* private */ };

  const addPass = async (...) => { /* public action */ };

  return { passes, addPass, ... };
});
```

## Composable Patterns

- **`usePageRefresh`** — provides/injects a refresh signal to work around Ionic page caching. Use `onIonViewWillEnter` at the page level, `inject` in children.
- **`useSwipeToPage`** — wraps `createGesture` (Ionic) for swipe navigation. Always clean up gestures on unmount.

## Ionic-Specific

- Always use `IonPage` > `IonHeader` > `IonToolbar` > `IonContent` layout structure.
- Prefer `onIonViewWillEnter` / `onIonViewDidEnter` over `onMounted` for page-level side effects (Ionic caches page components).
- Use `createGesture` from `@ionic/vue` for custom touch gestures.
- Dynamic pass background colors: bind via `:style`, compute text color with `textColorForBackground()` (luminance-based contrast).

## Commands

```bash
npm run dev          # Vite dev server (browser preview)
npm run build        # vue-tsc type check + vite build
npm run typecheck    # type check only (vue-tsc)
npm run lint         # ESLint
npm run test:unit    # Vitest
npm run test:e2e     # Cypress (requires dev server running)

ionic serve          # Ionic dev server
npx cap sync android # Sync web build → Android
ionic cap run android -l --external  # Live reload on device (needs JAVA_HOME)
```

## ESLint Config

- Vue 3 essential + recommended + TypeScript recommended
- `@typescript-eslint/no-explicit-any` — **disabled**
- `vue/no-deprecated-slot-attribute` — disabled
- console/debugger warnings in production only

## Styling

- Prefer Tailwind utility classes over scoped CSS, and scoped CSS over inline `style` attributes. Only use `:style` bindings for values that are truly dynamic (e.g. computed colors).
- Tailwind utilities are imported **without** `layer()` in `src/theme/tailwind.css` so they are unlayered CSS and win over Ionic's unlayered stylesheet via class-selector specificity (0,1,0 beats element selectors 0,0,1). This means Tailwind works reliably on `button`, `input`, and all other elements — do not work around it with scoped CSS or inline styles. The only case where scoped CSS is still needed is when Ionic uses a more specific selector than a single class (e.g. `ion-content button {}`), which is rare.

## Naming Style

- Avoid single-letter variable names. Use descriptive names that make intent clear.
- Exception: universally understood single-letter conventions are fine — `i` in loops, `e` for events, `a`/`b` in sort comparators.

## Key Constraints

- **Mobile-first**: interactions must work with touch; add haptic feedback (`@capacitor/haptics`) for important actions.
- **No direct DOM mutation** for pass state — always go through the Pinia store.
- **Persistence**: the store auto-saves to `@capacitor/preferences` on every mutation; don't call storage APIs directly from components.
- **ID generation**: `Date.now() + '-' + Math.random().toString(36).slice(2)`.
- **Structured clone**: when copying a reactive `Pass` object use `structuredClone(toRaw(obj))`.
