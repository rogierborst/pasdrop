<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { IonPage, IonContent, onIonViewWillEnter, menuController } from '@ionic/vue'
import { Capacitor } from '@capacitor/core'
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerAndroidScanningLibrary,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerScanOrientation,
  CapacitorBarcodeScannerTypeHintALLOption,
} from '@capacitor/barcode-scanner'
import { CapacitorBarcodeScannerTypeHint } from '@capacitor/barcode-scanner/dist/esm/definitions'
import { usePassesStore, Pass } from '@/stores/passes'
import { useCategoriesStore } from '@/stores/categories'
import { useThemeStore } from '@/stores/theme'
import type { ScanResult } from '@/types/scan'
import { useAddPassFlow } from '@/composables/useAddPassFlow'
import CardStack from '@/components/CardStack.vue'
import PassDetailSheet from '@/components/PassDetailSheet.vue'
import NewPassSheet from '@/components/NewPassSheet.vue'

const passesStore = usePassesStore()
const categoriesStore = useCategoriesStore()
const themeStore = useThemeStore()

const { pending: addPassPending, consumeRequest } = useAddPassFlow()

onIonViewWillEnter(() => {
  categoriesStore.loadCategories()
  passesStore.loadPasses()
})

watch(addPassPending, (value) => {
  if (value) { consumeRequest(); startAddPass() }
})

const selectedPass = ref<Pass | null>(null)
const showNewPassSheet = ref(false)
const pendingScanResult = ref<ScanResult | null>(null)

const startAddPass = async () => {
  if (Capacitor.getPlatform() === 'web') {
    pendingScanResult.value = null
    showNewPassSheet.value = true
    return
  }
  try {
    const result = await CapacitorBarcodeScanner.scanBarcode({
      hint: CapacitorBarcodeScannerTypeHintALLOption.ALL,
      cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
      scanOrientation: CapacitorBarcodeScannerScanOrientation.ADAPTIVE,
      android: { scanningLibrary: CapacitorBarcodeScannerAndroidScanningLibrary.MLKIT },
    })
    pendingScanResult.value = {
      data: result.ScanResult,
      dataType: CapacitorBarcodeScannerTypeHint[result.format],
    }
    showNewPassSheet.value = true
  } catch {
    // user cancelled the scanner
  }
}

const openDetail = (pass: Pass) => { selectedPass.value = pass }
const closeDetail = () => { selectedPass.value = null }

const handleUpdate = (updated: Pass) => {
  passesStore.updatePass(updated.id!, { label: updated.label, notes: updated.notes, color: updated.color, expires: updated.expires, data: updated.data, format: updated.format })
  if (selectedPass.value?.id === updated.id) {
    selectedPass.value = { ...selectedPass.value, ...updated }
  }
}

const handleDelete = (id: string) => {
  passesStore.deletePass(id)
  closeDetail()
}

const handleNewPassRescan = async () => {
  showNewPassSheet.value = false
  await nextTick()
  await startAddPass()
}

const handleDetailRescan = async () => {
  const pass = selectedPass.value
  if (!pass) return
  selectedPass.value = null
  await nextTick()
  try {
    const result = await CapacitorBarcodeScanner.scanBarcode({
      hint: CapacitorBarcodeScannerTypeHintALLOption.ALL,
      cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
      scanOrientation: CapacitorBarcodeScannerScanOrientation.ADAPTIVE,
      android: { scanningLibrary: CapacitorBarcodeScannerAndroidScanningLibrary.MLKIT },
    })
    const newData = result.ScanResult
    const newFormat = CapacitorBarcodeScannerTypeHint[result.format] as string
    await passesStore.updatePass(pass.id!, { data: newData, format: newFormat })
    selectedPass.value = { ...pass, data: newData, format: newFormat }
  } catch {
    selectedPass.value = pass
  }
}

const d = computed(() => themeStore.isDark)

const tabStyle = (active: boolean): Record<string, string> => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 14px',
  borderRadius: '9999px',
  border: 'none',
  flexShrink: '0',
  background: active ? (d.value ? '#fff' : '#1c1c1e') : (d.value ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'),
  color:      active ? (d.value ? '#0a0a0c' : '#ffffff') : (d.value ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'),
  fontWeight: active ? '600' : '400',
  fontSize: '13px',
  letterSpacing: '-0.01em',
  fontFamily: 'inherit',
  cursor: 'pointer',
  transition: 'background 0.2s, color 0.2s',
})

const badgeStyle = (active: boolean): Record<string, string> => ({
  padding: '1px 6px',
  borderRadius: '8px',
  fontSize: '11px',
  fontWeight: '600',
  background: active
    ? (d.value ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.15)')
    : (d.value ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
  color: active
    ? (d.value ? '#000' : '#fff')
    : (d.value ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'),
})

const headerMutedStyle = computed(() => ({
  fontSize: '11px',
  fontWeight: '500',
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: d.value ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
  marginBottom: '2px',
}))

const dividerStyle = computed(() => ({
  height: '1px',
  background: d.value ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)',
  marginTop: '16px',
  flexShrink: '0',
}))

const fabLabelStyle = computed(() => ({
  background: d.value ? 'oklch(14% 0.01 250)' : 'rgba(0,0,0,0.05)',
  border: `1px solid ${d.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
  borderRadius: '16px',
  padding: '10px 16px',
  color: d.value ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
  fontSize: '12px',
  fontWeight: '500',
  letterSpacing: '0.02em',
}))

const iconBtnStyle = computed(() => ({
  width: '40px',
  height: '40px',
  borderRadius: '13px',
  border: 'none',
  background: d.value ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: '0',
}))
</script>

<template>
  <IonPage>
    <IonContent
      :fullscreen="true"
      :scroll-y="false"
      :style="{ '--background': 'var(--app-surface)' }"
    >
      <div class="relative flex flex-col h-full pt-[env(safe-area-inset-top)]">
        <!-- Header -->
        <div class="pt-5 px-6 pb-6 shrink-0 flex items-center gap-3">
          <button :style="iconBtnStyle" @click="menuController.open()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="d ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'" stroke-width="2" stroke-linecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div>
            <div :style="headerMutedStyle">Jouw passen</div>
            <div class="text-[26px] font-bold tracking-[-0.04em] text-(--ion-text-color) leading-none">
              PasDrop
            </div>
          </div>
        </div>

        <!-- Category tabs -->
        <div class="flex overflow-x-auto scrollbar-hide px-6 pb-1 gap-1.5 shrink-0">
          <button :style="tabStyle(!categoriesStore.selectedCategoryId)" @click="categoriesStore.selectedCategoryId = null">
            Alle
            <span :style="badgeStyle(!categoriesStore.selectedCategoryId)">{{ passesStore.passes.length }}</span>
          </button>
          <button
            v-for="cat in categoriesStore.categories"
            :key="cat.id"
            :style="tabStyle(categoriesStore.selectedCategoryId === cat.id)"
            @click="categoriesStore.selectedCategoryId = cat.id"
          >
            {{ cat.name }}
            <span :style="badgeStyle(categoriesStore.selectedCategoryId === cat.id)">
              {{ passesStore.passes.filter(p => p.categoryId === cat.id).length }}
            </span>
          </button>
        </div>

        <!-- Divider -->
        <div :style="dividerStyle" />

        <!-- Card stack -->
        <div class="flex-1 overflow-y-auto p-5 pb-[100px]">
          <CardStack :passes="passesStore.filteredPasses" @tap="openDetail" @reorder="passesStore.reorderPasses" />
        </div>

        <!-- FAB -->
        <div class="absolute right-5 flex items-center pointer-events-none gap-2.5 bottom-[calc(24px+env(safe-area-inset-bottom))]">
          <div class="pointer-events-auto" :style="fabLabelStyle">Pas toevoegen</div>
          <button
            class="pointer-events-auto flex items-center justify-center w-14 h-14 rounded-[18px] bg-[#1c1c1e] border-none shadow-[0_8px_24px_rgba(0,0,0,0.25)] cursor-pointer"
            @click="startAddPass"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round">
              <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
              <rect x="8" y="8" width="8" height="8" rx="1" />
            </svg>
          </button>
        </div>
      </div>

      <PassDetailSheet
        :pass="selectedPass"
        :is-open="!!selectedPass"
        @close="closeDetail"
        @update="handleUpdate"
        @delete="handleDelete"
        @rescan="handleDetailRescan"
      />

      <NewPassSheet
        :is-open="showNewPassSheet"
        :scan-result="pendingScanResult"
        @close="showNewPassSheet = false"
        @saved="showNewPassSheet = false"
        @rescan="handleNewPassRescan"
      />
    </IonContent>
  </IonPage>
</template>
