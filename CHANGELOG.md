# Changelog

User-facing history of PassDrop, curated from the git history (internal refactors, build/tooling, and docs-only commits are omitted). Newest first.

## 2026-08-25 — Expiry reminders & empty-state polish

- Added expiry notifications, with the ability to snooze from the notification itself and preview a reminder via double-tap.
- Added an expired-pass badge and clearer guidance when a category (or the whole list) has no passes yet.
- Improved theming consistency around expiry indicators (light/dark).

## 2026-06-07 — Structure & interaction refactor

- Converted main sheets to full pages for clearer navigation.
- Improved pass dragging: drag only by a dedicated handle, added haptic feedback, smoother reordering.
- Internal refactor of the card stack and fullscreen code viewer (no user-facing change, but unlocked the above).

## 2026-06-03 — Polish pass

- Re-enabled re-scanning a pass's code after creation.
- Improved the color picker.
- Multi-line notes are now displayed with line breaks preserved.
- Full Dutch translation pass.

## 2026-05-28 — Rename to PasD'rop & release prep

- Renamed the app to PasD'rop; new icons, feature graphics, Play Store assets.
- Added a privacy policy and semantic versioning for releases.
- Fixed pass sort-order not being remembered reliably.

## 2026-05-09 — Visual redesign

- Redesigned the pass list as stacked cards with a bottom sheet.
- Added a fullscreen barcode/QR viewer.
- Color and expiry date became editable directly; card text color now auto-adjusts for contrast against the background.

## 2026-04-08 — Gestures & categories

- Added pinch-to-zoom and rotate gestures in the fullscreen viewer.
- Categories can now be reordered by dragging and deleted.
- Extracted the app menu into its own component; back button now exits from the home screen instead of navigating further back.

## 2026-03-26 — Categories, expiry, notes

- Added categories, expiration dates, and free-text notes on passes.
- Added a delete confirmation step.
- Began Dutch localization.

## 2026-01-22 — Core data layer

- Migrated pass storage to a Pinia store (previously ad hoc).
- Added the editing flow for existing passes.
- Added swipe-to-navigate and the `usePageRefresh` composable to work around Ionic page caching.

## 2025-11-15 — Initial prototype

- First working scanner (web + native) for barcodes and QR codes.
- Basic pass list with add/detail pages and local storage.
