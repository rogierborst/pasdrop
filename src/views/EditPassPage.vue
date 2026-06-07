<script setup lang="ts">
import {
    IonContent, IonButtons, IonButton, IonPage, IonHeader, IonToolbar,
    IonBackButton, IonTitle, onIonViewWillEnter,
} from '@ionic/vue';
import { useRoute, useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import { Pass, usePassesStore } from '@/stores/passes';
import PassDetailsForm from '@/components/PassDetailsForm.vue';
import WebScanner from '@/components/WebScanner.vue';
import { Capacitor } from '@capacitor/core';
import {
    CapacitorBarcodeScanner,
    CapacitorBarcodeScannerAndroidScanningLibrary,
    CapacitorBarcodeScannerCameraDirection,
    CapacitorBarcodeScannerScanOrientation,
    CapacitorBarcodeScannerTypeHintALLOption,
} from '@capacitor/barcode-scanner';
import { CapacitorBarcodeScannerTypeHint } from '@capacitor/barcode-scanner/dist/esm/definitions';

const route = useRoute();
const router = useRouter();
const passesStore = usePassesStore();
const isNative = Capacitor.getPlatform() !== 'web';

const pass = ref<Pass | null>(null);
const draft = ref<Partial<Pass>>({});
const webScannerRef = ref<InstanceType<typeof WebScanner> | null>(null);
const isRescanning = ref(false);

const loadPass = () => {
    const found = passesStore.getPassById(route.params.id as string);
    if (!found) return;
    pass.value = found;
    draft.value = {
        label: found.label,
        notes: found.notes ?? '',
        color: found.color,
        expires: found.expires,
        categoryId: found.categoryId,
        data: found.data,
        format: found.format,
    };
};
onMounted(() => loadPass());
onIonViewWillEnter(() => loadPass());

const save = async () => {
    if (!pass.value?.id) return;
    await passesStore.updatePass(pass.value.id, draft.value);
    router.back();
};

const replaceCode = async () => {
    if (isNative) {
        try {
            const result = await CapacitorBarcodeScanner.scanBarcode({
                hint: CapacitorBarcodeScannerTypeHintALLOption.ALL,
                cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
                scanOrientation: CapacitorBarcodeScannerScanOrientation.ADAPTIVE,
                android: { scanningLibrary: CapacitorBarcodeScannerAndroidScanningLibrary.MLKIT },
            });
            draft.value = {
                ...draft.value,
                data: result.ScanResult,
                format: CapacitorBarcodeScannerTypeHint[result.format] as string,
            };
        } catch {
            // user cancelled
        }
        return;
    }
    isRescanning.value = true;
    try {
        const result = await webScannerRef.value?.scan();
        if (result) draft.value = { ...draft.value, data: result.data, format: result.dataType };
    } finally {
        isRescanning.value = false;
    }
};
</script>

<template>
    <IonPage>
        <IonHeader :translucent="true">
            <IonToolbar>
                <IonButtons slot="start">
                    <IonBackButton :default-href="`/pass/${route.params.id}`" />
                </IonButtons>
                <IonTitle>Bewerken</IonTitle>
                <IonButtons slot="end">
                    <IonButton color="primary" @click="save">Opslaan</IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>

        <IonContent>
            <PassDetailsForm v-model="draft" />

            <div class="px-5 pt-4 pb-8">
                <WebScanner v-if="isRescanning" ref="webScannerRef" />
                <button v-else @click="replaceCode" class="btn-secondary w-full">Opnieuw scannen</button>
            </div>
        </IonContent>
    </IonPage>
</template>
