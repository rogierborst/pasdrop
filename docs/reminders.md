# Pass-expiry reminders

Reminders let a user get notified before (or after) a pass expires, so they can renew or replace it in time. This document describes how the feature works end-to-end.

## Data model

- `Pass.reminders?: number[]` (`src/stores/passes.ts`) — the list of "days-before-expiry" offsets the user picked for a given pass, e.g. `[1, 7]` means "1 day before" and "1 week before". Stored alongside the rest of the pass in `@capacitor/preferences`.
- `settings.reminderTime` (`src/stores/settings.ts`) — a single app-wide `HH:mm` time (default `00:00`) at which all reminders fire. There's no per-pass time, only per-pass offsets.
- Clearing a pass's `expires` date clears its `reminders` too (`stores/passes.ts`) — there's nothing left to count down to.

## Picking reminders (UI)

- `PassDetailsForm.vue` shows a row of toggleable "chips" built from `PRESET_REMINDER_DAYS` (`[1, 2, 3, 7, 14, 30]`) plus whatever offsets are already on the pass. An "Aangepast…" chip opens `CustomReminderModal.vue` for an arbitrary number of days/weeks, previewing the exact fire date live via `computeReminderFireDate`.
- Any offset whose fire date has already passed (`isReminderPastDue`) is shown dimmed with an explanatory note — it's kept selected but won't actually be scheduled.
- `SettingsPage.vue` lets the user change the global `reminderTime`.
- `PassDetailsCard.vue` lists each reminder's offset and computed fire date, read-only.

## Scheduling lifecycle

All of the actual notification work lives in `src/utils/reminders.ts` and is framework-agnostic (no Vue lifecycle assumptions), so it can be called from a Pinia store as easily as from a component:

- `usePassesStore` calls `scheduleReminders(pass, reminderTime)` after every create/update, and `cancelPassReminders(pass)` on delete.
- `scheduleReminders` always cancels a pass's previously-scheduled notifications first (safe to call on every save), then schedules one notification per non-past-due offset.
- Each notification gets a **deterministic integer id** hashed from `passId:offsetDays` (`notificationIdFor`), since `LocalNotifications` ids must be 32-bit ints. Snoozes use their own id namespace (`snooze:...`) so they never collide with the "real" scheduled reminders.
- `cancelPassReminders` cancels both the regular reminder ids *and* all possible snooze ids for that pass, so deleting/editing a pass can't leave a stray notification behind.

## Notification content, channel & actions

- All reminder/snooze notifications share the same title/body builder (`reminderNotificationContent`): *"Pas verloopt binnenkort" / "\<naam\> verloopt over \<duur\> (\<datum\>)"*.
- They're posted to a dedicated Android channel, **"Verloop herinneringen"** (`setupReminderNotifications`, created on every app launch — idempotent), configured as high-importance so it pops up as a heads-up banner with sound and vibration.
- Every notification also carries three **snooze action buttons** — `+1 dag` / `+3 dagen` / `+1 week` — registered once as a shared action type (`REMINDER_ACTION_TYPE_ID`). Labels are kept short on purpose: Android truncates action text when three buttons share one row.
- This channel/action setup, plus permission requests, are Android/iOS-app-only — nothing is scheduled on web (`Capacitor.getPlatform() === 'web'` short-circuits everything).

## Reacting to a tap (composable)

`src/composables/useReminderNotifications.ts` is the one piece of this feature that's actually Vue-lifecycle-bound. It's mounted once from `App.vue` and:

- Calls `setupReminderNotifications()` on mount.
- Listens for `localNotificationActionPerformed`, then branches on `actionId`:
  - **Plain tap** → deep-links straight to `/pass/:id`.
  - **Snooze action** (`+1 dag` etc.) → calls `snoozeReminder(pass, originalOffsetDays, snoozeDays, reminderTime)` to reschedule an identical-content notification for N days from now (at the configured `reminderTime`), navigates to the pass, and confirms with a toast + light haptic. Snoozing is allowed even past the pass's actual expiry date — an overdue pass still deserves a nudge.

Note: on Android, tapping *any* action button (not just the notification body) always briefly brings the app to the foreground to run this JS — there's no way to snooze silently in the background with this plugin.

## Permissions

- `ensureReminderPermission()` checks/requests the OS notification permission before every schedule/snooze call.
- If the user has picked reminders but permission isn't granted, `useReminderWarningToast` (used by `NewPassPage.vue` and `EditPassPage.vue` after saving) surfaces a warning toast explaining that nothing will pop up until they allow notifications.

## Key files

| File | Responsibility |
|---|---|
| `src/utils/reminders.ts` | Domain logic: fire-date math, scheduling/cancelling/snoozing, channel + action setup |
| `src/composables/useReminderNotifications.ts` | App-level wiring: reacts to notification taps/snoozes |
| `src/composables/useReminderWarningToast.ts` | Warns when reminders are set but permission is missing |
| `src/stores/passes.ts` | Triggers (re)scheduling/cancellation on pass create/update/delete |
| `src/stores/settings.ts` | Stores the global reminder fire time |
| `src/components/PassDetailsForm.vue` | Reminder offset picker (chips + custom modal) |
| `src/components/CustomReminderModal.vue` | Arbitrary days/weeks picker with live fire-date preview |
| `src/components/PassDetailsCard.vue` | Displays scheduled reminders (read-only) |
| `src/views/SettingsPage.vue` | Lets the user change the reminder fire time |
