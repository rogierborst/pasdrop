<script setup lang="ts">
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonMenuButton, IonPage, IonTitle, IonToolbar, onIonViewWillEnter, onIonViewDidEnter } from '@ionic/vue';
import { closeOutline } from 'ionicons/icons';
import NativeScanner from '@/components/NativeScanner.vue';
import { ScanResult } from '@/types/scan';
import { computed, ref, useTemplateRef } from 'vue';
import PassDetailsForm from '@/components/PassDetailsForm.vue';
import { useRouter } from 'vue-router';
import CodeViewer from '@/components/CodeViewer/CodeViewer.vue';
import { Pass, usePassesStore } from '@/stores/passes';
import { providePageRefresh } from '@/composables/usePageRefresh';
import { useCategoriesStore } from '@/stores/categories';

const passesStore = usePassesStore();
const categoriesStore = useCategoriesStore();
const router = useRouter();

const scannedCard = ref<ScanResult>();
const passData = ref<Partial<Pass>>({
    color: '#145920',
    categoryId: categoriesStore.selectedCategoryId ?? undefined,
});


const nativeScannerRef = useTemplateRef<InstanceType<typeof NativeScanner>>('nativeScanner');

providePageRefresh();
const resetData = () => {
    scannedCard.value = undefined;
    passData.value = {
        color: '#145920',
        categoryId: categoriesStore.selectedCategoryId ?? undefined,
    };
};
onIonViewWillEnter(() => resetData());
onIonViewDidEnter(() => nativeScannerRef.value?.scan());

const handleCapture = (result: ScanResult) => {
    scannedCard.value = result;
    passData.value.data = result.data;
    passData.value.format = result.dataType;
}

const savePass = async () => {
    if (!dataIsValid.value) return;

    await passesStore.addPass(passData.value as Pass);
    await router.replace('/passes');
}

const dataIsValid = computed(() => {
    return scannedCard.value && passData.value.label && passData.value.color;
});
</script>

<template>
    <ion-page>
        <span id="reader" />
        <ion-header :translucent="true">
            <ion-toolbar style="--background: var(--app-surface)">
                <ion-buttons slot="start">
                    <ion-menu-button color="primary"></ion-menu-button>
                </ion-buttons>
                <ion-title>Pas toevoegen</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="router.replace('/passes')">
                        <ion-icon slot="icon-only" :icon="closeOutline" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true" style="--background: var(--app-surface)">
            <div class="swipeable-container">
                <ion-header collapse="condense">
                    <ion-toolbar style="--background: var(--app-surface)">
                        <ion-title size="large">Toevoegen</ion-title>
                    </ion-toolbar>
                </ion-header>

                <div id="container">
                    <NativeScanner ref="nativeScanner" @capture="handleCapture" />
                    <template v-if="scannedCard">
                        <CodeViewer v-if="scannedCard" :data="scannedCard" />
                        <form @submit.prevent="savePass">
                            <PassDetailsForm v-if="scannedCard" v-model="passData" />
                            <ion-button type="submit" color="success" :disabled="!dataIsValid">Opslaan</ion-button>
                        </form>
                    </template>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<style scoped>
#container strong {
    font-size: 20px;
    line-height: 26px;
}

#container p {
    font-size: 16px;
    line-height: 22px;
    color: #8c8c8c;
    margin: 0;
}

#container a {
    text-decoration: none;
}

.swipeable-container {
    min-height: 100%;
    width: 100%;
}
</style>
