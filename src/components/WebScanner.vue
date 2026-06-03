<script setup lang="ts">
/**
 * This component is used in the browser previews, to scan a bar or qr code.
 */
import { ref, useTemplateRef } from 'vue';
import { BarcodeFormat, BrowserCodeReader, BrowserMultiFormatReader } from '@zxing/browser';
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

        <div class="close-button" @click="stopScanning">×</div>
    </div>
</template>

<style scoped>
.video-container {
    position: relative;
}

.close-button {
    position: absolute;
    width: 3rem;
    height: 3rem;
    background-color: rgba(255 255 255 / 70%);
    display: flex;
    justify-content: center;
    align-items: center;
    color: black;
    top: 1rem;
    right: 1rem;
    font-size: 3rem;
    font-weight: bold;
    border-radius: 50%;
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
