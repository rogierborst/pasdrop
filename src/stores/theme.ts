import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Preferences } from '@capacitor/preferences';

const STORAGE_KEY = 'theme.isDark';

export const useThemeStore = defineStore('theme', () => {
    const isDark = ref(false);

    const applyTheme = (dark: boolean) => {
        document.body.classList.toggle('dark', dark);
    };

    const load = async () => {
        const { value } = await Preferences.get({ key: STORAGE_KEY });
        const dark = value !== null
            ? value === 'true'
            : window.matchMedia('(prefers-color-scheme: dark)').matches;
        isDark.value = dark;
        applyTheme(dark);
    };

    const toggle = async () => {
        isDark.value = !isDark.value;
        applyTheme(isDark.value);
        await Preferences.set({ key: STORAGE_KEY, value: String(isDark.value) });
    };

    return { isDark, load, toggle };
});
