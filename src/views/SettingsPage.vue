<script setup lang="ts">
import {
    IonContent, IonButtons, IonBackButton, IonPage, IonHeader, IonToolbar, IonTitle,
    IonList, IonItem, IonLabel, IonDatetime, IonDatetimeButton, IonModal, onIonViewWillEnter,
} from '@ionic/vue';
import { computed } from 'vue';
import { useSettingsStore } from '@/stores/settings';

const settingsStore = useSettingsStore();
onIonViewWillEnter(() => settingsStore.load());

// ion-datetime needs a full ISO value; only the time portion is used/edited here.
const isoTime = computed(() => `1970-01-01T${settingsStore.reminderTime}:00`);

const onTimeChange = (event: CustomEvent) => {
    const value = event.detail.value as string | undefined;
    if (!value) return;
    settingsStore.setReminderTime(value.slice(11, 16));
};
</script>

<template>
    <IonPage>
        <IonHeader :translucent="true">
            <IonToolbar>
                <IonButtons slot="start">
                    <IonBackButton default-href="/passes" />
                </IonButtons>
                <IonTitle>Instellingen</IonTitle>
            </IonToolbar>
        </IonHeader>

        <IonContent>
            <ion-list>
                <ion-item>
                    <ion-label>Tijdstip herinneringen</ion-label>
                    <ion-datetime-button datetime="reminderTimePicker" slot="end" />
                </ion-item>
                <ion-item lines="none">
                    <p class="text-xs opacity-60 m-0">
                        Herinneringen voor het verlopen van passen worden om dit tijdstip verstuurd.
                    </p>
                </ion-item>
            </ion-list>

            <ion-modal :keep-contents-mounted="true">
                <ion-datetime
                    id="reminderTimePicker"
                    presentation="time"
                    locale="nl-NL"
                    hour-cycle="h23"
                    :value="isoTime"
                    @ion-change="onTimeChange"
                />
            </ion-modal>
        </IonContent>
    </IonPage>
</template>
