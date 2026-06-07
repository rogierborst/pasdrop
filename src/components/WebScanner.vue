<script setup lang="ts">
/**
 * This component is used in the browser previews, to scan a bar or qr code.
 */
import { ref, useTemplateRef } from 'vue';
import { BarcodeFormat, BrowserCodeReader, BrowserMultiFormatReader } from '@zxing/browser';
import CloseButton from '@/components/Buttons/CloseButton.vue';
import { ScanResult } from '@/types/scan';

const isActive = ref<boolean>(false);
const videoRef = useTemplateRef<HTMLVideoElement>('videoRef');

const emit = defineEmits<{
    capture: [ScanResult]
}>();

const codeReader: BrowserMultiFormatReader = new BrowserMultiFormatReader();

const scan = async () => {
    isActive.value = true;

    try {
        const videoInputDevices = await BrowserCodeReader.listVideoInputDevices();
        const selectedDevice = videoInputDevices[0].deviceId;

        const result = await codeReader.decodeOnceFromVideoDevice(selectedDevice, videoRef.value!);
        console.log(result, BarcodeFormat[result.getBarcodeFormat()]);

        const returnData: ScanResult = {
            data: result.getText(),
            dataType: BarcodeFormat[result.getBarcodeFormat()]
        }
        emit('capture', returnData);

        return returnData;
    } catch (error) {
        console.error(error);
    } finally {
        // Clear video element
        await stopScanning();
    }
}
defineExpose({ scan });

const stopScanning = async() => {
    if (videoRef.value && videoRef.value.srcObject) {
        const stream = videoRef.value.srcObject as MediaStream;
        const tracks = stream.getTracks();

        tracks.forEach((track) => {
            track.stop();
            track.enabled = false;
        })
        videoRef.value.srcObject = null;
    }

    await new Promise(resolve => setTimeout(resolve, 100));
    isActive.value = false;
}
</script>

<template>
    <div class="video-container">
        <video
            ref="videoRef"
            class="bg-[rgba(215,202,181,0.7)]"
            :class="{ active: isActive }"
        />

        <CloseButton class="absolute right-4 top-4" aria-label="Stop scanning" @click="stopScanning" />
    </div>
</template>

<style scoped>
.video-container {
    position: relative;
}

video.active {
    display: block;
    width: 100%;
    height: 60dvh;
}

video {
    display: none;
}
</style>
