<script setup lang="ts">
import { computed, watch } from 'vue'
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
import { useAddPassFlow } from '@/composables/useAddPassFlow'
import { useRouter } from 'vue-router'
import CardStack from '@/components/CardStack/CardStack.vue'
import PassesEmptyState from '@/components/PassesEmptyState.vue'

const router = useRouter()
const passesStore = usePassesStore()
const categoriesStore = useCategoriesStore()

const { pending: addPassPending, consumeRequest } = useAddPassFlow()

onIonViewWillEnter(() => {
  categoriesStore.loadCategories()
  passesStore.loadPasses()
})

watch(addPassPending, (value) => {
  if (value) { consumeRequest(); startAddPass() }
})

const startAddPass = async () => {
  if (Capacitor.getPlatform() === 'web') {
    router.push('/passes/new')
    return
  }
  try {
    const result = await CapacitorBarcodeScanner.scanBarcode({
      hint: CapacitorBarcodeScannerTypeHintALLOption.ALL,
      cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
      scanOrientation: CapacitorBarcodeScannerScanOrientation.ADAPTIVE,
      android: { scanningLibrary: CapacitorBarcodeScannerAndroidScanningLibrary.MLKIT },
    })
    router.push({
      path: '/passes/new',
      state: {
        scanResult: {
          data: result.ScanResult,
          dataType: CapacitorBarcodeScannerTypeHint[result.format],
        },
      },
    })
  } catch {
    // user cancelled the scanner
  }
}

const openDetail = (pass: Pass) => { router.push(`/pass/${pass.id}`) }

const tabClass = (isActive: boolean) => [
  'inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border-none px-3.5 py-2 text-[13px] tracking-[-0.01em] transition-colors',
  isActive
    ? 'bg-[#1c1c1e] font-semibold text-white dark:bg-white dark:text-[#0a0a0c]'
    : 'bg-black/6 font-normal text-black/45 dark:bg-white/[0.07] dark:text-white/50',
]

const badgeClass = (isActive: boolean) => [
  'rounded-lg px-1.5 py-px text-[11px] font-semibold',
  isActive
    ? 'bg-white/15 text-white dark:bg-black/15 dark:text-black'
    : 'bg-black/[0.08] text-black/40 dark:bg-white/10 dark:text-white/40',
]

const allCategoriesSelected = computed(() => categoriesStore.selectedCategoryId === null)

const hasNoPassesAtAll = computed(() => passesStore.passes.length === 0)
const hasEmptyCategory = computed(() => !hasNoPassesAtAll.value && passesStore.filteredPasses.length === 0)

const showAllPasses = () => { categoriesStore.selectedCategoryId = null }

</script>

<template>
  <IonPage>
    <IonContent class="app-surface" :fullscreen="true" :scroll-y="false">
      <div class="relative flex flex-col h-full pt-[env(safe-area-inset-top)]">
        <!-- Header -->
        <div class="pt-5 px-6 pb-6 shrink-0 flex items-center gap-3">
          <button class="h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[13px] border-none bg-black/6 text-black/50 flex dark:bg-white/6 dark:text-white/60" @click="menuController.open()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div>
            <div class="mb-0.5 text-[11px] font-medium uppercase tracking-[0.18em] text-black/35 dark:text-white/35">Jouw passen</div>
            <div class="text-[26px] font-bold tracking-[-0.04em] text-(--ion-text-color) leading-none">
              PasDrop
            </div>
          </div>
        </div>

        <!-- Category tabs -->
        <div class="flex overflow-x-auto scrollbar-hide px-6 pb-1 gap-1.5 shrink-0">
          <button :class="tabClass(allCategoriesSelected)" @click="categoriesStore.selectedCategoryId = null">
            Alle
            <span :class="badgeClass(allCategoriesSelected)">{{ passesStore.passes.length }}</span>
          </button>
          <button
            v-for="cat in categoriesStore.categories"
            :key="cat.id"
            :class="tabClass(categoriesStore.selectedCategoryId === cat.id)"
            @click="categoriesStore.selectedCategoryId = cat.id"
          >
            {{ cat.name }}
            <span :class="badgeClass(categoriesStore.selectedCategoryId === cat.id)">
              {{ passesStore.passes.filter(p => p.categoryId === cat.id).length }}
            </span>
          </button>
        </div>

        <!-- Divider -->
        <div class="mt-4 h-px shrink-0 bg-black/7 dark:bg-white/5" />

        <!-- Card stack -->
        <div class="flex-1 overflow-y-auto p-5 pb-25">
          <PassesEmptyState v-if="hasNoPassesAtAll" variant="no-passes" @add-pass="startAddPass" />
          <PassesEmptyState v-else-if="hasEmptyCategory" variant="empty-category" @add-pass="startAddPass" @show-all="showAllPasses" />
          <CardStack v-else :passes="passesStore.filteredPasses" @tap="openDetail" @reorder="passesStore.reorderPasses" />
        </div>

        <!-- FAB -->
        <div class="absolute right-5 flex items-center pointer-events-none gap-2.5 bottom-[calc(24px+env(safe-area-inset-bottom))]">
          <div class="pointer-events-auto rounded-2xl border border-black/8 bg-black/5 px-4 py-2.5 text-[12px] font-medium tracking-[0.02em] text-black/45 dark:border-white/8 dark:bg-white/6 dark:text-white/50">
              Pas toevoegen
          </div>
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
    </IonContent>
  </IonPage>
</template>
