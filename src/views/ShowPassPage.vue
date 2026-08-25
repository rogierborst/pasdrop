<script setup lang="ts">
import {
    IonContent, IonButtons, IonButton, IonPage, IonHeader, IonToolbar, IonIcon,
    IonBackButton, IonTitle, onIonViewWillEnter, alertController,
} from '@ionic/vue';
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import { trashBinSharp, createOutline } from 'ionicons/icons';
import { Pass, usePassesStore } from '@/stores/passes';
import { usePassExpiry } from '@/composables/usePassExpiry';
import PassCodePanel from '@/components/CodeViewer/PassCodePanel.vue';
import FullscreenCodeViewer from '@/components/CodeViewer/FullscreenCodeViewer.vue';
import PassDetailsCard from '@/components/PassDetailsCard.vue';
import ExpiredBadge from '@/components/ExpiredBadge.vue';

const router = useRouter();
const route = useRoute();
const pass = ref<Pass | null>(null);
const passesStore = usePassesStore();

const fetchPass = () => {
    pass.value = passesStore.getPassById(route.params.id as string) ?? null;
};
onIonViewWillEnter(() => fetchPass());
onMounted(() => fetchPass());

const fullscreen = ref(false);

const { expiryLabel, expiryDistance, isExpired } = usePassExpiry(computed(() => pass.value?.expires));

const removePass = async () => {
    const alert = await alertController.create({
        header: 'Pas verwijderen',
        message: `Weet je zeker dat je "${pass.value?.label}" wilt verwijderen?`,
        buttons: [
            { text: 'Annuleren', role: 'cancel' },
            { text: 'Verwijderen', role: 'confirm' },
        ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role === 'confirm') {
        await passesStore.deletePass(route.params.id as string);
        await router.replace('/passes');
    }
};
</script>

<template>
    <IonPage>
        <IonHeader :translucent="true">
            <IonToolbar>
                <IonButtons slot="start">
                    <IonBackButton default-href="/passes" />
                </IonButtons>
                <IonTitle>{{ pass?.label }}</IonTitle>
                <IonButtons slot="end">
                    <IonButton fill="clear" @click="router.push(`/pass/${route.params.id}/edit`)">
                        <IonIcon :icon="createOutline" />
                    </IonButton>
                    <IonButton fill="clear" color="danger" @click="removePass">
                        <IonIcon :icon="trashBinSharp" />
                    </IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>

        <IonContent :fullscreen="true" :style="{ '--background': pass?.color ?? 'var(--ion-background-color)' }">
            <div v-if="pass" class="px-5 pt-5 pb-8 flex flex-col gap-4">
                <div class="relative">
                    <ExpiredBadge v-if="isExpired" size="w-14 h-14" wiggle />
                    <PassCodePanel
                        :data="pass.data"
                        :format="pass.format"
                        :interactive="true"
                        @tap="fullscreen = true"
                    />
                </div>
                <div v-if="expiryLabel" class="flex flex-col items-center gap-0.5">
                    <span class="text-base font-semibold text-white/90">{{ expiryLabel }}</span>
                    <span class="text-sm text-white/60">{{ expiryDistance }}</span>
                </div>
                <PassDetailsCard :pass="pass" />
            </div>
        </IonContent>

        <FullscreenCodeViewer :pass="pass" :open="fullscreen" @close="fullscreen = false" />
    </IonPage>
</template>