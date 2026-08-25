<script setup lang="ts">
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonItem, IonInput, IonRadioGroup, IonRadio } from '@ionic/vue';
import { computed, ref, watch } from 'vue';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { computeReminderFireDate } from '@/utils/reminders';

const props = defineProps<{ expires: string; reminderTime: string }>();
const isOpen = defineModel<boolean>({ required: true });
const emit = defineEmits<{ add: [days: number] }>();

const amount = ref<number | null>(null);
const unit = ref<'days' | 'weeks'>('days');

// Reset the form each time the modal is (re-)opened.
watch(isOpen, open => {
    if (open) {
        amount.value = null;
        unit.value = 'days';
    }
});

const isSingular = computed(() => amount.value === 1);
const daysLabel = computed(() => isSingular.value ? 'dag' : 'dagen');
const weeksLabel = computed(() => isSingular.value ? 'week' : 'weken');

const canAdd = computed(() => !!amount.value && amount.value > 0);

const offsetDays = computed(() => {
    if (!amount.value || amount.value <= 0) return null;
    return unit.value === 'weeks' ? amount.value * 7 : amount.value;
});

// Preview date is always shown in Dutch, matching the rest of the app (not the device locale).
const previewLabel = computed(() => {
    if (!offsetDays.value) return null;
    const fireDate = computeReminderFireDate(props.expires, offsetDays.value, props.reminderTime);
    if (!fireDate) return null;
    const label = format(fireDate, 'EEEE d MMMM yyyy', { locale: nl });
    return label.charAt(0).toUpperCase() + label.slice(1);
});

const confirm = () => {
    if (!canAdd.value || !offsetDays.value) return;
    emit('add', offsetDays.value);
    isOpen.value = false;
};
</script>

<template>
    <ion-modal :is-open="isOpen" @did-dismiss="isOpen = false">
        <ion-header>
            <ion-toolbar>
                <ion-title>Aangepaste herinnering</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="isOpen = false">Annuleren</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-item>
                <ion-input label="Aantal" type="number" min="1" v-model.number="amount" placeholder="Bijv. 5" />
            </ion-item>
            <ion-radio-group v-model="unit">
                <ion-item lines="none">
                    <ion-radio value="days">{{ daysLabel }}</ion-radio>
                </ion-item>
                <ion-item lines="none">
                    <ion-radio value="weeks">{{ weeksLabel }}</ion-radio>
                </ion-item>
            </ion-radio-group>
            <ion-button expand="block" class="mt-4" :disabled="!canAdd" @click="confirm">Toevoegen</ion-button>
            <p v-if="previewLabel" class="text-xs opacity-60 text-center mt-2 mb-0">
                Deze herinnering gaat af op {{ previewLabel }}
            </p>
        </ion-content>
    </ion-modal>
</template>
