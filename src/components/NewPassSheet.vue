<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { IonModal, IonContent } from '@ionic/vue'
import { Capacitor } from '@capacitor/core'
import { useThemeStore } from '@/stores/theme'
import { Pass, usePassesStore } from '@/stores/passes'
import { useCategoriesStore } from '@/stores/categories'
import PassDetailsForm from '@/components/PassDetailsForm.vue'
import WebScanner from '@/components/WebScanner.vue'
import type { ScanResult } from '@/types/scan'

const props = defineProps<{ isOpen: boolean; scanResult: ScanResult | null }>()
const emit = defineEmits<{ close: [], saved: [] }>()

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
    label: '',
  }
  step.value = 'form'
  scanError.value = false
}

// When a native scan result is passed in, go straight to the form
watch(() => props.isOpen, (open) => {
  if (!open) { step.value = 'scanning'; scanError.value = false; return }
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
  borderRadius: '2px', margin: '16px auto 20px',
}))

const saveBtnStyle = computed(() => ({
  width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
  background: isValid.value
    ? (d.value ? '#fff' : '#1c1c1e')
    : (d.value ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'),
  color: isValid.value
    ? (d.value ? '#000' : '#fff')
    : (d.value ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)'),
  fontSize: '15px', fontWeight: '600', fontFamily: 'inherit',
  cursor: isValid.value ? 'pointer' : 'default',
}))

const cancelBtnStyle = computed(() => ({
  width: '100%', padding: '13px', borderRadius: '14px',
  border: `1px solid ${d.value ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
  background: 'transparent',
  color: d.value ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
  fontSize: '14px', fontWeight: '500', fontFamily: 'inherit', cursor: 'pointer',
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
        <div style="padding: 0 20px 16px; font-size: 17px; font-weight: 700; letter-spacing: -0.02em; color: var(--ion-text-color)">
          Scan a code
        </div>
        <WebScanner ref="webScannerRef" />
        <div v-if="scanError" style="padding: 16px 20px; display: flex; flex-direction: column; gap: 10px">
          <p style="font-size: 14px; color: var(--ion-text-color); opacity: 0.6; margin: 0">
            Could not access camera or no code detected.
          </p>
          <button @click="startWebScan" :style="saveBtnStyle">Try again</button>
          <button @click="$emit('close')" :style="cancelBtnStyle">Cancel</button>
        </div>
      </template>

      <!-- Form step -->
      <template v-if="step === 'form'">
        <div style="padding: 0 20px 20px; font-size: 17px; font-weight: 700; letter-spacing: -0.02em; color: var(--ion-text-color)">
          New pass
        </div>

        <PassDetailsForm v-model="passData" />

        <div style="padding: 16px 20px 0; display: flex; flex-direction: column; gap: 10px">
          <button @click="save" :style="saveBtnStyle" :disabled="!isValid">Save</button>
          <button @click="$emit('close')" :style="cancelBtnStyle">Cancel</button>
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
