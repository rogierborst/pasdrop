import { toastController } from '@ionic/vue';
import type { ScheduleRemindersResult } from '@/utils/reminders';

/**
 * Shows a warning toast when reminders were configured but notification permission
 * isn't granted, so the user knows why nothing will pop up yet.
 */
export function useReminderWarningToast() {
    const warnIfPermissionMissing = async (reminderResult?: ScheduleRemindersResult, hasReminders = false) => {
        if (!hasReminders || !reminderResult || reminderResult.permissionGranted) return;

        const toast = await toastController.create({
            message: 'Meldingen staan uit — herinneringen worden pas verstuurd zodra je ze toestaat.',
            duration: 4000,
            position: 'bottom',
            color: 'warning',
        });
        await toast.present();
    };

    return { warnIfPermissionMissing };
}
