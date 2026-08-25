import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

const STORAGE_KEY = 'theme.isDark';

const isNative = () => Capacitor.getPlatform() !== 'web';

export const useThemeStore = defineStore('theme', () => {
    const isDark = ref(false);

    const applyTheme = (dark: boolean) => {
        document.body.classList.toggle('dark', dark);

        if (isNative()) {
            // Style.Dark renders light (white) status bar icons, which is what we want on a dark
            // background, and vice versa — the naming refers to icon style, not the app theme.
            StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light }).catch(() => {});
        }
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
