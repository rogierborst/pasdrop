import { addDays, format, isAfter, parseISO, subDays } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import type { Pass } from '@/stores/passes';

/** Quick-pick reminder offsets, in days-before-expiry. */
export const PRESET_REMINDER_DAYS = [1, 2, 3, 7, 14, 30];

/** Android notification channel used for all pass-expiry reminders (high importance = heads-up popup). */
const REMINDER_CHANNEL_ID = 'pass-reminders';

/** Shared action type registered once at startup, giving reminder notifications their snooze buttons. */
export const REMINDER_ACTION_TYPE_ID = 'reminder-actions';

/** Snooze offsets (in days) offered as notification action buttons. */
export const SNOOZE_DAYS = [1, 3, 7];

/** Prefix used for snooze action ids, e.g. `snooze:3`. */
const SNOOZE_ACTION_PREFIX = 'snooze:';
export const snoozeActionId = (days: number): string => `${SNOOZE_ACTION_PREFIX}${days}`;
export const parseSnoozeActionId = (actionId: string): number | null => {
    if (!actionId.startsWith(SNOOZE_ACTION_PREFIX)) return null;
    const days = Number(actionId.slice(SNOOZE_ACTION_PREFIX.length));
    return Number.isFinite(days) ? days : null;
};

/**
 * Creates the "Verloop herinneringen" notification channel and registers the snooze action
 * buttons. Safe to call on every app launch — both operations are idempotent on Android.
 */
export const setupReminderNotifications = async (): Promise<void> => {
    if (!isSupported()) return;

    await LocalNotifications.createChannel({
        id: REMINDER_CHANNEL_ID,
        name: 'Verloop herinneringen',
        description: 'Meldingen wanneer een pas binnenkort verloopt.',
        importance: 4, // IMPORTANCE_HIGH — heads-up popup with sound and vibration.
        visibility: 1,
        vibration: true,
    });

    await LocalNotifications.registerActionTypes({
        types: [{
            id: REMINDER_ACTION_TYPE_ID,
            actions: SNOOZE_DAYS.map(days => ({
                id: snoozeActionId(days),
                // Kept short on purpose: Android truncates action button labels when three
                // buttons share the row, and a longer "Uitstellen: ..." prefix got clipped.
                title: `+${reminderDurationLabel(days)}`,
            })),
        }],
    });
};

/** Renders a days-before offset as a short Dutch duration, e.g. "1 week". */
export const reminderDurationLabel = (days: number): string => {
    if (days % 30 === 0 && days >= 30) {
        const months = days / 30;
        return months === 1 ? '1 maand' : `${months} maanden`;
    }
    if (days % 7 === 0 && days >= 7) {
        const weeks = days / 7;
        return weeks === 1 ? '1 week' : `${weeks} weken`;
    }
    return days === 1 ? '1 dag' : `${days} dagen`;
};

/** Computes the exact moment a reminder should fire, or null if the expiry date is invalid. */
export const computeReminderFireDate = (expires: string, offsetDays: number, reminderTime: string): Date | null => {
    const expiryDate = parseISO(expires);
    if (isNaN(expiryDate.getTime())) return null;

    const [hours, minutes] = reminderTime.split(':').map(Number);
    const fireDate = subDays(expiryDate, offsetDays);
    fireDate.setHours(hours || 0, minutes || 0, 0, 0);
    return fireDate;
};

export const isReminderPastDue = (expires: string, offsetDays: number, reminderTime: string): boolean => {
    const fireDate = computeReminderFireDate(expires, offsetDays, reminderTime);
    return !fireDate || !isAfter(fireDate, new Date());
};

/** Computes when a snoozed reminder should fire: N days from now, at the user's configured reminder time. */
const computeSnoozeFireDate = (snoozeDays: number, reminderTime: string): Date => {
    const [hours, minutes] = reminderTime.split(':').map(Number);
    const fireDate = addDays(new Date(), snoozeDays);
    fireDate.setHours(hours || 0, minutes || 0, 0, 0);
    return fireDate;
};

/** Deterministic 32-bit id derived from the pass id + offset, needed since LocalNotifications ids must be integers. */
const notificationIdFor = (passId: string, offsetDays: number): number => {
    const key = `${passId}:${offsetDays}`;
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = (hash * 31 + key.charCodeAt(i)) | 0;
    }
    return Math.abs(hash) || 1;
};

const isSupported = () => Capacitor.getPlatform() !== 'web';

/** Builds the title/body/visual styling shown for a pass's expiry reminder. */
const reminderNotificationContent = (pass: Pass, days: number) => ({
    title: 'Pas verloopt binnenkort',
    body: `${pass.label} verloopt over ${reminderDurationLabel(days)} (${format(parseISO(pass.expires), 'd MMMM yyyy', { locale: nl })})`,
    channelId: REMINDER_CHANNEL_ID,
    actionTypeId: REMINDER_ACTION_TYPE_ID,
});

/** Id reserved for snoozed reminders, kept distinct from regular reminder ids. */
const snoozeNotificationIdFor = (passId: string, snoozeDays: number): number => notificationIdFor(`snooze:${passId}`, snoozeDays);

export const ensureReminderPermission = async (): Promise<boolean> => {
    if (!isSupported()) return false;
    const current = await LocalNotifications.checkPermissions();
    if (current.display === 'granted') return true;
    const requested = await LocalNotifications.requestPermissions();
    return requested.display === 'granted';
};

/** Cancels every currently-scheduled reminder notification for a pass, including any pending snoozes. */
export const cancelPassReminders = async (pass: Pass): Promise<void> => {
    if (!isSupported() || !pass.id) return;

    const notifications = [
        ...(pass.reminders ?? []).map(days => ({ id: notificationIdFor(pass.id!, days) })),
        ...SNOOZE_DAYS.map(days => ({ id: snoozeNotificationIdFor(pass.id!, days) })),
    ];
    if (notifications.length) await LocalNotifications.cancel({ notifications });
};

export interface ScheduleRemindersResult {
    /** Whether notification permission is currently granted (always false on web). */
    permissionGranted: boolean;
    /** How many reminders were actually scheduled (past-due offsets are skipped). */
    scheduledCount: number;
}

/**
 * Reschedules all reminders for a pass based on its current `expires` date and `reminders` offsets.
 * Always cancels previously scheduled notifications first, so this is safe to call on every save.
 */
export const scheduleReminders = async (pass: Pass, reminderTime: string): Promise<ScheduleRemindersResult> => {
    await cancelPassReminders(pass);

    if (!isSupported() || !pass.id || !pass.expires || !pass.reminders?.length) {
        return { permissionGranted: false, scheduledCount: 0 };
    }

    const upcoming = pass.reminders
        .map(days => ({ days, fireDate: computeReminderFireDate(pass.expires, days, reminderTime) }))
        .filter((entry): entry is { days: number; fireDate: Date } => !!entry.fireDate && isAfter(entry.fireDate, new Date()));

    const granted = await ensureReminderPermission();
    if (granted && upcoming.length) {
        await LocalNotifications.schedule({
            notifications: upcoming.map(({ days, fireDate }) => ({
                id: notificationIdFor(pass.id!, days),
                ...reminderNotificationContent(pass, days),
                schedule: { at: fireDate, allowWhileIdle: true },
                extra: { passId: pass.id, days },
            })),
        });
    }

    return { permissionGranted: granted, scheduledCount: upcoming.length };
};

/**
 * Reschedules a fired reminder to pop up again later, in response to a "Snooze" notification
 * action. Keeps the same title/body (based on the original days-before-expiry offset) and only
 * changes the fire date, so it reads exactly like the reminder the user just dismissed.
 */
export const snoozeReminder = async (pass: Pass, originalOffsetDays: number, snoozeDays: number, reminderTime: string): Promise<ScheduleRemindersResult> => {
    if (!isSupported() || !pass.id || !pass.expires) {
        return { permissionGranted: false, scheduledCount: 0 };
    }

    const granted = await ensureReminderPermission();
    if (granted) {
        await LocalNotifications.schedule({
            notifications: [{
                id: snoozeNotificationIdFor(pass.id, snoozeDays),
                ...reminderNotificationContent(pass, originalOffsetDays),
                schedule: { at: computeSnoozeFireDate(snoozeDays, reminderTime), allowWhileIdle: true },
                extra: { passId: pass.id, days: originalOffsetDays },
            }],
        });
    }

    return { permissionGranted: granted, scheduledCount: granted ? 1 : 0 };
};
