# Replace bottom sheets with full-page navigation for Pass Detail and Add Flow

Ionic's partial-height `IonModal` with breakpoints creates an unresolvable gesture conflict: scrolling up in the sheet and swiping down to dismiss are the same gesture, so the sheet dismisses unpredictably when users try to scroll back up through tall content.

We chose full-page navigation (pushing a route) over keeping sheets because pages use the native Android back stack, which has no gesture ambiguity — back is always a system-level swipe from the left edge or the hardware button, never a downward drag within the content. The trade-off is that transitions feel slightly heavier than a sliding sheet, but the interaction is reliable.

## Consequences

- `/pass/:id` — Detail Page (view, delete, tap barcode to open Fullscreen Viewer)
- `/pass/:id/edit` — Edit page for a single pass
- `/passes/new` — Add Flow page; scan result is passed via router state from the FAB, never via URL params
- `PassDetailSheet.vue` and `NewPassSheet.vue` are removed once pages reach feature parity
- `ShowPassPage.vue` is kept and brought to full parity (the route existed but was unused)
