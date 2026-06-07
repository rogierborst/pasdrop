<script setup lang="ts">
import {
    CapacitorBarcodeScanner,
    CapacitorBarcodeScannerAndroidScanningLibrary,
    CapacitorBarcodeScannerCameraDirection,
    CapacitorBarcodeScannerScanOrientation, CapacitorBarcodeScannerScanResult,
    CapacitorBarcodeScannerTypeHintALLOption
} from '@capacitor/barcode-scanner';
import { ref, useTemplateRef } from "vue";
import { Capacitor } from '@capacitor/core';
import { ScanResult } from '@/types/scan';
import { CapacitorBarcodeScannerTypeHint } from '@capacitor/barcode-scanner/dist/esm/definitions';
import WebScanner from '@/components/WebScanner.vue';
import { IonButton } from '@ionic/vue';
import { useOnPageRefresh } from '@/composables/usePageRefresh';

const scannedCode = ref<CapacitorBarcodeScannerScanResult | null>(null);
const data = ref<string | undefined>(undefined);
const dataType = ref<string | number | null>(null);

useOnPageRefresh(() => {
    data.value = undefined;
    dataType.value = null;
});

const emit = defineEmits<{capture: [ScanResult]}>();

const webScannerRef = useTemplateRef('webScannerRef');
const scanCode = async () => {
    const platform = Capacitor.getPlatform();

    if (platform === 'web') {
        const result: ScanResult | undefined = await webScannerRef.value!.scan();

        if (!result) {
            console.error('no scan result');
            return;
        }

        data.value = result.data;
        dataType.value = result.dataType;

        emit('capture', {
            data: data.value,
            dataType: dataType.value
        });

        return;
    }

    try {
        scannedCode.value = await CapacitorBarcodeScanner.scanBarcode({
            hint: CapacitorBarcodeScannerTypeHintALLOption.ALL,
            scanInstructions: 'scan a code!',
            cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
            scanOrientation: CapacitorBarcodeScannerScanOrientation.ADAPTIVE,
            android: {
                scanningLibrary: CapacitorBarcodeScannerAndroidScanningLibrary.MLKIT
            },
        });

        data.value = scannedCode.value.ScanResult;
        dataType.value = CapacitorBarcodeScannerTypeHint[scannedCode.value.format];

        emit('capture', {
            data: data.value,
            dataType: dataType.value
        });
    } catch (error) {
        console.error('🥐', error);
    }
}

defineExpose({ scan: scanCode })
</script>

<template>
    <WebScanner ref="webScannerRef" />
    <div v-if="dataType" class="px-4 py-2">
        <ion-button fill="clear" @click="scanCode">Nog een keer scannen</ion-button>
    </div>
</template>
