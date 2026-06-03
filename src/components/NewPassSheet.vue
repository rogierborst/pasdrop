<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { IonModal, IonContent } from '@ionic/vue'
import { Capacitor } from '@capacitor/core'
import { useThemeStore } from '@/stores/theme'
import { Pass, usePassesStore } from '@/stores/passes'
import { useCategoriesStore } from '@/stores/categories'
import PassDetailsForm from '@/components/PassDetailsForm.vue'
import WebScanner from '@/components/WebScanner.vue'
import BarCode from '@/components/CodeViewer/BarCode.vue'
import QRCodeVue from '@/components/CodeViewer/QR-Code.vue'
import type { ScanResult } from '@/types/scan'

const props = defineProps<{ isOpen: boolean; scanResult: ScanResult | null }>()
const emit = defineEmits<{ close: [], saved: [], rescan: [] }>()

const passesStore = usePassesStore()
const categoriesStore = useCategoriesStore()
const themeStore = useThemeStore()
const d = computed(() => themeStore.isDark)

const isNative = Capacitor.getPlatform() !== 'web'
const webScannerRef = ref<InstanceType<typeof WebScanner> | null>(null)
const step = ref<'scanning' | 'form'>('scanning')
const passData = ref<Partial<Pass>>({})
const scanError = ref(false)

const initForm = (result: ScanResult) => {
    passData.value = {
        data: result.data,
        format: result.dataType,
        color: '#3d5248',
        categoryId: categoriesStore.selectedCategoryId ?? undefined,
        expires: '',
        notes: '',
        label: ''
    }
    step.value = 'form'
    scanError.value = false
}

// When a native scan result is passed in, go straight to the form
watch(() => props.isOpen, (open) => {
    if (!open) {
        step.value = 'scanning';
        scanError.value = false;
        return
    }
    if (props.scanResult) initForm(props.scanResult)
})

// Triggered by @did-present — guarantees webScannerRef is mounted
const onModalPresented = async () => {
    if (!isNative && !props.scanResult) {
        await startWebScan()
    }
}

const startWebScan = async () => {
    step.value = 'scanning'
    scanError.value = false
    try {
        const result = await webScannerRef.value?.scan()
        if (result) initForm(result)
        else scanError.value = true
    } catch {
        scanError.value = true
    }
}

const isValid = computed(() => !!passData.value.label?.trim() && !!passData.value.color)

const save = async () => {
    if (!isValid.value) return
    await passesStore.addPass(passData.value as Pass)
    emit('saved')
}

const handleStyle = computed(() => ({
    width: '36px', height: '4px',
    background: d.value ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
    borderRadius: '2px', margin: '16px auto 20px'
}))

</script>

<template>
    <IonModal
        class="new-pass-modal"
        :is-open="isOpen"
        :breakpoints="[0, 0.92]"
        :initial-breakpoint="0.92"
        :can-dismiss="true"
        @did-dismiss="$emit('close')"
        @did-present="onModalPresented"
    >
        <IonContent :style="{ '--background': 'transparent', '--padding-bottom': '20px' }">
            <div :style="handleStyle" />

            <!-- Web scanner step -->
            <template v-if="step === 'scanning' && !isNative">
                <div class="px-5 pb-4 text-[17px] font-bold tracking-[-0.02em] text-(--ion-text-color)">
                    Scan een code
                </div>
                <WebScanner ref="webScannerRef" />
                <div v-if="scanError" class="px-5 py-4 flex flex-col gap-2.5">
                    <p class="text-sm opacity-60 m-0 text-(--ion-text-color)">
                        Kon camera niet bereiken of kon geen code scannen.
                    </p>
                    <button @click="startWebScan" class="btn-primary">Nog een keer</button>
                    <button @click="$emit('close')" class="btn-secondary">Annuleren</button>
                </div>
            </template>

            <!-- Form step -->
            <template v-if="step === 'form'">
                <div class="px-5 pb-5 text-[17px] font-bold tracking-[-0.02em] text-(--ion-text-color)">
                    Nieuwe pas
                </div>

                <!-- Code preview -->
                <div class="mx-5 mb-4 bg-white rounded-2xl p-4 flex flex-col items-center">
                    <div v-if="passData.format !== 'QR_CODE'" class="w-full h-20">
                        <BarCode :data="passData.data as string" lineColor="#111" backgroundColor="#ffffff" />
                    </div>
                    <div v-else class="w-36 h-36 mx-auto">
                        <QRCodeVue :data="passData.data as string" lineColor="#111" backgroundColor="#ffffff" />
                    </div>
                    <div class="mt-2 text-[11px] text-black/35 break-all text-center">
                        {{ passData.data }}
                    </div>
                </div>

                <PassDetailsForm v-model="passData" />

                <div class="px-5 pt-4 flex flex-col gap-2.5">
                    <button @click="save" class="btn-primary" :disabled="!isValid">Opslaan</button>
                    <button @click="isNative ? $emit('rescan') : startWebScan()" class="btn-secondary">Opnieuw scannen</button>
                    <button @click="$emit('close')" class="btn-secondary">Annuleren</button>
                </div>
            </template>
        </IonContent>
    </IonModal>
</template>

<style>
ion-modal.new-pass-modal::part(content) {
    border-radius: 28px 28px 0 0;
    background: var(--sheet-surface);
}

ion-modal.new-pass-modal::part(handle) {
    background: var(--sheet-handle);
}
</style>
