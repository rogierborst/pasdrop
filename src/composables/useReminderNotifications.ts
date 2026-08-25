import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { toastController } from '@ionic/vue';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LocalNotifications, type ActionPerformed } from '@capacitor/local-notifications';
import { usePassesStore } from '@/stores/passes';
import { useSettingsStore } from '@/stores/settings';
import { parseSnoozeActionId, reminderDurationLabel, setupReminderNotifications, snoozeReminder } from '@/utils/reminders';

/**
 * Wires up pass-expiry reminder notifications for the lifetime of the host component: creates
 * the Android channel and snooze actions on launch, then reacts when a notification is tapped —
 * rescheduling and confirming with a toast + haptic for a snooze action, or deep-linking to the
 * pass for a plain tap.
 */
export function useReminderNotifications() {
    const router = useRouter();
    const passesStore = usePassesStore();
    const settingsStore = useSettingsStore();

    const handleSnoozeAction = async (snoozeDays: number, passId: string, originalOffsetDays: number) => {
        await passesStore.loadPasses();
        await settingsStore.load();
        const pass = passesStore.getPassById(passId);
        if (!pass) return;

        await snoozeReminder(pass, originalOffsetDays, snoozeDays, settingsStore.reminderTime);
        router.push(`/pass/${passId}`);
        await Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});

        const toast = await toastController.create({
            message: `Herinnering uitgesteld met ${reminderDurationLabel(snoozeDays)}.`,
            duration: 3000,
            position: 'bottom',
        });
        await toast.present();
    };

    let notificationTapListener: { remove: () => void } | null = null;

    onMounted(async () => {
        if (Capacitor.getPlatform() === 'web') return;

        await setupReminderNotifications();
        notificationTapListener = await LocalNotifications.addListener(
            'localNotificationActionPerformed',
            (action: ActionPerformed) => {
                const passId = action.notification.extra?.passId;
                if (!passId) return;

                const snoozeDays = parseSnoozeActionId(action.actionId);
                if (snoozeDays) {
                    const originalOffsetDays = action.notification.extra?.days ?? snoozeDays;
                    handleSnoozeAction(snoozeDays, passId, originalOffsetDays);
                    return;
                }

                router.push(`/pass/${passId}`);
            }
        );
    });

    onUnmounted(() => {
        notificationTapListener?.remove();
    });
}
