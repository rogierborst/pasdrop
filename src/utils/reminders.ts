import { format, isAfter, parseISO, subDays } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import type { Pass } from '@/stores/passes';

/** Quick-pick reminder offsets, in days-before-expiry. */
export const PRESET_REMINDER_DAYS = [1, 2, 3, 7, 14, 30];

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

export const ensureReminderPermission = async (): Promise<boolean> => {
    if (!isSupported()) return false;
    const current = await LocalNotifications.checkPermissions();
    if (current.display === 'granted') return true;
    const requested = await LocalNotifications.requestPermissions();
    return requested.display === 'granted';
};

/** Cancels every currently-scheduled reminder notification for a pass. */
export const cancelPassReminders = async (pass: Pass): Promise<void> => {
    if (!isSupported() || !pass.id || !pass.reminders?.length) return;
    await LocalNotifications.cancel({
        notifications: pass.reminders.map(days => ({ id: notificationIdFor(pass.id!, days) })),
    });
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
                title: 'Pas verloopt binnenkort',
                body: `${pass.label} verloopt over ${reminderDurationLabel(days)} (${format(parseISO(pass.expires), 'd MMMM yyyy', { locale: nl })})`,
                schedule: { at: fireDate, allowWhileIdle: true },
                extra: { passId: pass.id },
            })),
        });
    }

    return { permissionGranted: granted, scheduledCount: upcoming.length };
};
