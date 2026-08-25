// stores/passes.ts
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { Preferences } from '@capacitor/preferences';
import { useCategoriesStore } from '@/stores/categories';
import { useSettingsStore } from '@/stores/settings';
import { cancelPassReminders, scheduleReminders, type ScheduleRemindersResult } from '@/utils/reminders';

export interface Pass {
    format: string;
    data: string;
    label: string;
    color: string;
    id?: string;
    timestamp?: number;
    expires: string;
    categoryId?: string;
    notes?: string;
    /** Days-before-expiry offsets for reminder notifications, e.g. [1, 7]. */
    reminders?: number[];
}

const STORAGE_KEY = 'passes';

const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const usePassesStore = defineStore('passes', () => {
    const passes = ref<Pass[]>([]);
    const isLoaded = ref(false);
    const isLoading = ref(false);

    // Private helper methods
    const saveToStorage = async (passesToSave: Pass[]) => {
        await Preferences.set({
            key: STORAGE_KEY,
            value: JSON.stringify(passesToSave),
        });
    };

    const loadFromStorage = async (): Promise<Pass[]> => {
        const { value } = await Preferences.get({ key: STORAGE_KEY });
        return value ? JSON.parse(value) : [];
    };

    const rescheduleReminders = async (pass: Pass): Promise<ScheduleRemindersResult> => {
        const settingsStore = useSettingsStore();
        await settingsStore.load();
        return scheduleReminders(pass, settingsStore.reminderTime);
    };

    // Public actions
    const loadPasses = async (forceRefresh = false) => {
        if (isLoading.value) return;

        if (!isLoaded.value || forceRefresh) {
            isLoading.value = true;
            try {
                passes.value = await loadFromStorage();
                isLoaded.value = true;
            } finally {
                isLoading.value = false;
            }
        }
    };

    const addPass = async (pass: Omit<Pass, 'id' | 'timestamp'>) => {
        const newPass: Pass = {
            ...pass,
            id: generateId(),
            timestamp: Date.now(),
        };

        passes.value.push(newPass);
        await saveToStorage(passes.value);
        const reminderResult = await rescheduleReminders(newPass);
        return { pass: newPass, reminderResult };
    };

    const updatePass = async (id: string, updates: Partial<Pass>) => {
        const index = passes.value.findIndex(p => p.id === id);
        if (index === -1) return { pass: undefined, reminderResult: undefined };

        const merged = { ...passes.value[index], ...updates };
        // Clearing the expiry date silently drops any reminders — there's nothing left to count down to.
        if (!merged.expires) merged.reminders = [];

        passes.value[index] = merged;
        await saveToStorage(passes.value);
        const reminderResult = await rescheduleReminders(merged);
        return { pass: merged, reminderResult };
    };

    const deletePass = async (id: string) => {
        const existing = passes.value.find(p => p.id === id);
        if (existing) await cancelPassReminders(existing);
        passes.value = passes.value.filter(p => p.id !== id);
        await saveToStorage(passes.value);
    };

    const getPassById = (id: string) => {
        return passes.value.find(p => p.id === id);
    };

    const clearCategory = async (categoryId: string) => {
        passes.value = passes.value.map(pass =>
            pass.categoryId === categoryId ? { ...pass, categoryId: undefined } : pass
        );
        await saveToStorage(passes.value);
    };

    const reorderPasses = async (reorderedSubset: Pass[]) => {
        const subsetIds = new Set(reorderedSubset.map(p => p.id!))
        const positions = passes.value
            .map((p, i) => ({ id: p.id!, idx: i }))
            .filter(x => subsetIds.has(x.id))
            .map(x => x.idx)
        const result = [...passes.value]
        positions.forEach((globalIdx, i) => { result[globalIdx] = reorderedSubset[i] })
        passes.value = result
        await saveToStorage(passes.value)
    }

    const clearAll = async () => {
        await Promise.all(passes.value.map(cancelPassReminders));
        await Preferences.remove({ key: STORAGE_KEY });
        passes.value = [];
        isLoaded.value = false;
    };

    const filteredPasses = computed(() => {
        const categoriesStore = useCategoriesStore();
        if (!categoriesStore.selectedCategoryId) return passes.value;
        return passes.value.filter(p => p.categoryId === categoriesStore.selectedCategoryId);
    });

    return {
        // State
        passes,
        filteredPasses,
        isLoading,
        isLoaded,

        // Actions
        loadPasses,
        addPass,
        updatePass,
        deletePass,
        reorderPasses,
        getPassById,
        clearCategory,
        clearAll,
    };
});