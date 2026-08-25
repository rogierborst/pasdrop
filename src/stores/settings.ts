import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Preferences } from '@capacitor/preferences';

const STORAGE_KEY = 'settings.reminderTime';
const DEFAULT_REMINDER_TIME = '00:00';

export const useSettingsStore = defineStore('settings', () => {
    /** Time of day (HH:mm, 24h) at which pass expiry reminders fire. */
    const reminderTime = ref(DEFAULT_REMINDER_TIME);
    const isLoaded = ref(false);

    const load = async () => {
        if (isLoaded.value) return;
        const { value } = await Preferences.get({ key: STORAGE_KEY });
        reminderTime.value = value ?? DEFAULT_REMINDER_TIME;
        isLoaded.value = true;
    };

    const setReminderTime = async (time: string) => {
        reminderTime.value = time;
        await Preferences.set({ key: STORAGE_KEY, value: time });
    };

    return { reminderTime, load, setReminderTime };
});
