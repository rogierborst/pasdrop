<script setup lang="ts">
import {
    IonContent,
    IonButtons,
    IonButton,
    IonModal,
    IonMenuButton,
    IonTitle,
    IonToolbar,
    IonPage,
    IonHeader,
    IonIcon, onIonViewDidEnter, alertController,
} from '@ionic/vue';
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import { trashBinSharp, createOutline, documentTextOutline } from 'ionicons/icons';
import CodeViewer from '@/components/CodeViewer/CodeViewer.vue';
import { Pass, usePassesStore } from '@/stores/passes';
import EditPassSheet from '@/components/EditPassSheet.vue';
import NotesViewer from '@/components/NotesViewer.vue';
import { format, formatDistanceToNow, parseISO, isPast } from 'date-fns';
import { nl } from 'date-fns/locale';
import { textColorForBackground } from '@/utils/color';

const router = useRouter();
const route = useRoute();
const pass = ref<Pass>();
const passesStore = usePassesStore();

const fetchPass = () => {
    pass.value = passesStore.getPassById(route.params.id as string);
}
onIonViewDidEnter(() => fetchPass());
onMounted(() => fetchPass());

const editing = ref<boolean>(false);
const viewingNotes = ref<boolean>(false);

const expiryDate = computed(() => {
    if (!pass.value?.expires) return null;
    return parseISO(pass.value.expires);
});

const expiryLabel = computed(() => {
    if (!expiryDate.value) return null;
    return format(expiryDate.value, 'd MMMM yyyy', { locale: nl });
});

const expiryDistance = computed(() => {
    if (!expiryDate.value) return null;
    const expired = isPast(expiryDate.value);
    const distance = formatDistanceToNow(expiryDate.value, { locale: nl, addSuffix: true });
    return expired ? `Verlopen ${distance}` : `Verloopt ${distance}`;
});

const removePass = async () => {
    const alert = await alertController.create({
        header: 'Kaart verwijderen',
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
        await router.push('/passes');
    }
}
</script>

<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="primary" />
                </ion-buttons>
                <ion-title>{{ pass?.label }}</ion-title>
                <ion-buttons slot="end">
                    <ion-button fill="clear" @click="viewingNotes = !viewingNotes">
                        <ion-icon :icon="documentTextOutline" />
                    </ion-button>
                    <ion-button fill="clear" @click="editing = true">
                        <ion-icon :icon="createOutline" />
                    </ion-button>
                    <ion-button color="danger" @click="removePass">
                        <ion-icon :icon="trashBinSharp" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-modal ref="editor" :is-open="editing" @willDismiss="editing = false">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Kaart bewerken</ion-title>
                </ion-toolbar>
            </ion-header>
            <ion-content>
                <EditPassSheet v-model="pass" @save="editing = false" @cancel="editing=false" />
            </ion-content>
        </ion-modal>

        <ion-content :fullscreen="true" :style="{ '--pass-color': pass?.color }">
            <div class="swipeable-container">
                <ion-header collapse="condense">
                    <ion-toolbar>
                        <ion-title size="large">{{ pass?.label }}</ion-title>
                    </ion-toolbar>
                </ion-header>

                <div v-if="expiryLabel && pass" class="expiry-banner" :style="{ color: textColorForBackground(pass.color) }">
                    <span class="expiry-date">{{ expiryLabel }}</span>
                    <span class="expiry-distance">{{ expiryDistance }}</span>
                </div>

                <div class="container">
                    <div class="main" v-if="pass">
                        <CodeViewer :data="pass" />
                    </div>
                    <h1 v-else>GEEN PASS</h1>
                </div>

                <Transition name="notes">
                    <div v-if="viewingNotes && pass" class="notes-section">
                        <NotesViewer v-model="pass" />
                    </div>
                </Transition>
            </div>
        </ion-content>
    </ion-page>
</template>

<style scoped>
ion-content {
    --background: var(--pass-color);
}

.swipeable-container {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
}

.container {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    box-sizing: border-box;
}

.main {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.notes-section {
    margin: 0 16px 16px;
    border-radius: 12px;
    background: rgba(var(--ion-background-color-rgb), 0.85);
}

.expiry-banner {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 16px 4px;
    gap: 2px;
}

.expiry-date {
    font-size: 1rem;
    font-weight: 600;
}

.expiry-distance {
    font-size: 0.8rem;
    opacity: 0.7;
}
</style>
