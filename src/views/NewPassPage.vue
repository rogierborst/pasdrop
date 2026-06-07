<script setup lang="ts">
import {
    IonContent, IonButtons, IonButton, IonPage, IonHeader, IonToolbar,
    IonBackButton, IonTitle,
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import { Pass, usePassesStore } from '@/stores/passes';
import { useCategoriesStore } from '@/stores/categories';
import PassDetailsForm from '@/components/PassDetailsForm.vue';
import WebScanner from '@/components/WebScanner.vue';
import BarCode from '@/components/CodeViewer/BarCode.vue';
import QRCodeVue from '@/components/CodeViewer/QR-Code.vue';
import { Capacitor } from '@capacitor/core';
import {
    CapacitorBarcodeScanner,
    CapacitorBarcodeScannerAndroidScanningLibrary,
    CapacitorBarcodeScannerCameraDirection,
    CapacitorBarcodeScannerScanOrientation,
    CapacitorBarcodeScannerTypeHintALLOption,
} from '@capacitor/barcode-scanner';
import { CapacitorBarcodeScannerTypeHint } from '@capacitor/barcode-scanner/dist/esm/definitions';
import type { ScanResult } from '@/types/scan';

const router = useRouter();
const passesStore = usePassesStore();
const categoriesStore = useCategoriesStore();
const isNative = Capacitor.getPlatform() !== 'web';

type Step = 'scanning' | 'form';
const step = ref<Step>('scanning');
const scanError = ref(false);
const passData = ref<Partial<Pass>>({});
const webScannerRef = ref<InstanceType<typeof WebScanner> | null>(null);

const isValid = computed(() => !!passData.value.label?.trim() && !!passData.value.color);

const initForm = (result: ScanResult) => {
    passData.value = {
        data: result.data,
        format: result.dataType,
        color: '#3d5248',
        categoryId: categoriesStore.selectedCategoryId ?? undefined,
        expires: '',
        notes: '',
        label: '',
    };
    step.value = 'form';
    scanError.value = false;
};

onMounted(async () => {
    // Native: scan result was passed via router state before navigating here
    const stateResult = (history.state as { scanResult?: ScanResult }).scanResult;
    if (stateResult) {
        initForm(stateResult);
        return;
    }
    // Web: start the camera scanner directly
    if (!isNative) {
        await startWebScan();
    }
});

const startWebScan = async () => {
    step.value = 'scanning';
    scanError.value = false;
    try {
        const result = await webScannerRef.value?.scan();
        if (result) initForm(result);
        else scanError.value = true;
    } catch {
        scanError.value = true;
    }
};

const rescan = async () => {
    if (isNative) {
        try {
            const result = await CapacitorBarcodeScanner.scanBarcode({
                hint: CapacitorBarcodeScannerTypeHintALLOption.ALL,
                cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
                scanOrientation: CapacitorBarcodeScannerScanOrientation.ADAPTIVE,
                android: { scanningLibrary: CapacitorBarcodeScannerAndroidScanningLibrary.MLKIT },
            });
            initForm({ data: result.ScanResult, dataType: CapacitorBarcodeScannerTypeHint[result.format] as string });
        } catch {
            // user cancelled — stay on the form
        }
        return;
    }
    await startWebScan();
};

const save = async () => {
    if (!isValid.value) return;
    await passesStore.addPass(passData.value as Pass);
    router.replace('/passes');
};
</script>

<template>
    <IonPage>
        <IonHeader :translucent="true">
            <IonToolbar>
                <IonButtons slot="start">
                    <IonBackButton default-href="/passes" />
                </IonButtons>
                <IonTitle>{{ step === 'scanning' ? 'Scan een code' : 'Nieuwe pas' }}</IonTitle>
                <IonButtons v-if="step === 'form'" slot="end">
                    <IonButton color="primary" :disabled="!isValid" @click="save">Opslaan</IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>

        <IonContent>
            <!-- Web scanner step -->
            <template v-if="step === 'scanning' && !isNative">
                <WebScanner ref="webScannerRef" />
                <div v-if="scanError" class="px-5 py-4 flex flex-col gap-2.5">
                    <p class="text-sm opacity-60 m-0 text-(--ion-text-color)">
                        Kon camera niet bereiken of kon geen code scannen.
                    </p>
                    <button @click="startWebScan" class="btn-primary">Nog een keer</button>
                </div>
            </template>

            <!-- Form step -->
            <template v-if="step === 'form'">
                <!-- Code preview -->
                <div class="mx-5 mt-5 mb-4 bg-white rounded-2xl p-4 flex flex-col items-center">
                    <div v-if="passData.format !== 'QR_CODE'" class="w-full h-20">
                        <BarCode :data="passData.data as string" lineColor="#111" backgroundColor="#ffffff" />
                    </div>
                    <div v-else class="w-36 h-36 mx-auto">
                        <QRCodeVue :data="passData.data as string" lineColor="#111" backgroundColor="#ffffff" />
                    </div>
                    <div class="mt-2 text-[11px] text-black/35 break-all text-center">{{ passData.data }}</div>
                </div>

                <PassDetailsForm v-model="passData" />

                <div class="px-5 pt-4 pb-8">
                    <button @click="rescan" class="btn-secondary w-full">Opnieuw scannen</button>
                </div>
            </template>
        </IonContent>
    </IonPage>
</template>
