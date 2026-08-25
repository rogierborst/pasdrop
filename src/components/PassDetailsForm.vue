<script setup lang="ts">
import { IonList, IonItem, IonInput, IonTextarea, IonLabel, IonIcon } from '@ionic/vue';
import { closeCircle } from 'ionicons/icons';
import { computed, ref } from 'vue';
import type { Pass } from '@/stores/passes';
import CategorySelect from '@/components/CategorySelect.vue';
import ColorPickerField from '@/components/ColorPickerField.vue';
import CustomReminderModal from '@/components/CustomReminderModal.vue';
import { isReminderPastDue, PRESET_REMINDER_DAYS, reminderDurationLabel } from '@/utils/reminders';
import { useSettingsStore } from '@/stores/settings';

const pass = defineModel<Partial<Pass>>({ required: true });
const settingsStore = useSettingsStore();
settingsStore.load();

const reminders = computed(() => pass.value.reminders ?? []);

const toggleReminder = (days: number) => {
    const current = reminders.value;
    pass.value.reminders = current.includes(days)
        ? current.filter(d => d !== days)
        : [...current, days].sort((a, b) => a - b);
};

const isSelected = (days: number) => reminders.value.includes(days);

const isPastDue = (days: number) => {
    if (!pass.value.expires) return false;
    return isReminderPastDue(pass.value.expires, days, settingsStore.reminderTime);
};

const allOffsets = computed(() => {
    const merged = new Set([...PRESET_REMINDER_DAYS, ...reminders.value]);
    return [...merged].sort((a, b) => a - b);
});

const isCustomModalOpen = ref(false);
const addCustomReminder = (days: number) => {
    if (!reminders.value.includes(days)) {
        pass.value.reminders = [...reminders.value, days].sort((a, b) => a - b);
    }
};
</script>

<template>
    <ion-list class="app-transparent-list">
        <ion-item class="app-transparent-item">
            <CategorySelect v-model="pass.categoryId" />
        </ion-item>
        <ion-item class="app-transparent-item">
            <ion-input label="Naam" v-model="pass.label" />
        </ion-item>
        <ColorPickerField v-model="pass.color as string" />
        <ion-item class="app-transparent-item">
            <ion-input label="Verloopt op" v-model="pass.expires" type="date" />
        </ion-item>

        <template v-if="pass.expires">
            <ion-item lines="none" class="app-transparent-item">
                <ion-label position="stacked">Herinneringen</ion-label>
            </ion-item>
            <ion-item lines="none" class="app-transparent-item">
                <div class="flex flex-wrap gap-2 py-1">
                    <button
                        v-for="days in allOffsets"
                        :key="days"
                        type="button"
                        class="reminder-chip"
                        :class="{ selected: isSelected(days), 'past-due': isSelected(days) && isPastDue(days) }"
                        @click="toggleReminder(days)"
                    >
                        {{ reminderDurationLabel(days) }}
                        <ion-icon v-if="isSelected(days)" :icon="closeCircle" class="ml-1" />
                    </button>
                    <button type="button" class="reminder-chip" @click="isCustomModalOpen = true">
                        Aangepast&hellip;
                    </button>
                </div>
            </ion-item>
            <ion-item v-if="reminders.some(isPastDue)" lines="none" class="app-transparent-item">
                <p class="text-xs opacity-60 m-0">
                    Een of meer herinneringen liggen al in het verleden en worden niet ingepland.
                </p>
            </ion-item>
        </template>

        <ion-item class="app-transparent-item">
            <ion-label position="stacked">Notitie</ion-label>
            <ion-textarea v-model="pass.notes" :auto-grow="true" placeholder="Optionele notitie..." />
        </ion-item>
    </ion-list>

    <CustomReminderModal
        v-model="isCustomModalOpen"
        :expires="pass.expires ?? ''"
        :reminder-time="settingsStore.reminderTime"
        @add="addCustomReminder"
    />
</template>

<style scoped>
.reminder-chip {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 500;
    border: 1px solid var(--ion-color-medium-shade, #a0a0a0);
    background: transparent;
    color: var(--ion-text-color);
}

.reminder-chip.selected {
    background: var(--ion-color-primary, #3d5248);
    border-color: var(--ion-color-primary, #3d5248);
    color: var(--ion-color-primary-contrast, #fff);
}

.reminder-chip.past-due {
    opacity: 0.6;
}
</style>

