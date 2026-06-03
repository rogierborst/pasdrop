<script setup lang="ts">
import { computed, ref, toRaw, watch } from 'vue'
import { IonModal, IonContent, alertController } from '@ionic/vue'
import PassDetailsForm from '@/components/PassDetailsForm.vue'
import { Capacitor } from '@capacitor/core'
import { Pass } from '@/stores/passes'
import { useThemeStore } from '@/stores/theme'
import BarCode from '@/components/CodeViewer/BarCode.vue'
import QRCodeVue from '@/components/CodeViewer/QR-Code.vue'
import CodeViewer from '@/components/CodeViewer/CodeViewer.vue'
import WebScanner from '@/components/WebScanner.vue'
import { format, parseISO } from 'date-fns'
import { nl } from 'date-fns/locale'

const props = defineProps<{ pass: Pass | null; isOpen: boolean }>()
const emit = defineEmits<{
  close: []
  update: [pass: Pass]
  delete: [id: string]
  rescan: []
}>()

const themeStore = useThemeStore()
const d = computed(() => themeStore.isDark)

const isNative = Capacitor.getPlatform() !== 'web'
const webScannerRef = ref<InstanceType<typeof WebScanner> | null>(null)
const isRescanning = ref(false)

const editing = ref(false)
const fullscreen = ref(false)
const draft = ref<Partial<Pass>>({ label: '', notes: '', color: '', expires: '', categoryId: undefined })
const localPass = ref<Pass | null>(null)

watch(() => props.isOpen, (open) => { if (!open) fullscreen.value = false })

watch(
  () => props.pass,
  (pass) => {
    if (pass) {
      localPass.value = structuredClone(toRaw(pass))
      draft.value = { label: pass.label, notes: pass.notes ?? '', color: pass.color, expires: pass.expires, categoryId: pass.categoryId }
      editing.value = false
    }
  },
  { immediate: true }
)

const expiryLabel = computed(() => {
  if (!localPass.value?.expires) return null
  try {
    return format(parseISO(localPass.value.expires), 'd MMMM yyyy', { locale: nl })
  } catch {
    return null
  }
})

const onSave = () => {
  if (!localPass.value) return
  const updated: Pass = { ...localPass.value, ...draft.value }
  localPass.value = updated
  emit('update', updated)
  editing.value = false
}

const onDone = () => {
  if (editing.value) onSave()
  emit('close')
}

const onDelete = async () => {
  if (!localPass.value) return
  const alert = await alertController.create({
    header: 'Pas verwijderen',
    message: `Weet je zeker dat je "${localPass.value.label}" wil verwijderen?`,
    buttons: [
      { text: 'Annuleren', role: 'cancel' },
      { text: 'Verwijderen', role: 'confirm' },
    ],
  })
  await alert.present()
  const { role } = await alert.onDidDismiss()
  if (role === 'confirm') emit('delete', localPass.value.id!)
}

const replaceCode = async () => {
  if (isNative) {
    emit('rescan')
    return
  }
  isRescanning.value = true
  try {
    const result = await webScannerRef.value?.scan()
    if (result && localPass.value) {
      localPass.value = { ...localPass.value, data: result.data, format: result.dataType }
    }
  } finally {
    isRescanning.value = false
  }
}

const fieldLabelStyle = computed(() => ({
  fontSize: '10px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.12em',
  fontWeight: '600',
  color: d.value ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
  marginBottom: '5px',
}))

const handleStyle = computed(() => ({
  width: '36px',
  height: '4px',
  background: d.value ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
  borderRadius: '2px',
  margin: '16px auto 20px',
}))

const closeBtnStyle = computed(() => ({
  position: 'absolute' as const,
  top: 'calc(16px + env(safe-area-inset-top))',
  right: '16px',
  zIndex: '1',
  width: '44px',
  height: '44px',
  borderRadius: '22px',
  background: d.value ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
}))
</script>

<template>
  <IonModal
    class="pass-detail-modal"
    :is-open="isOpen"
    :breakpoints="[0, 0.88]"
    :initial-breakpoint="0.88"
    :can-dismiss="true"
    @did-dismiss="$emit('close')"
  >
    <IonContent :style="{ '--background': 'transparent' }">

      <!-- Handle -->
      <div :style="handleStyle" />

      <!-- Header row -->
      <div class="flex justify-between items-center px-5 pb-5">
        <div class="text-[17px] font-bold tracking-[-0.02em] text-(--ion-text-color)">
          {{ localPass?.label }}
        </div>
        <button @click="editing ? onSave() : (editing = true)" class="btn-edit" :class="{ active: editing }">
          {{ editing ? 'Opslaan' : 'Bewerken' }}
        </button>
      </div>

      <!-- Barcode / QR panel — tap to expand -->
      <div
        class="flex flex-col items-center bg-white mx-5 mb-5 rounded-[18px] cursor-pointer select-none"
        :style="localPass?.format === 'QR_CODE' ? { padding: '28px 28px 20px' } : { padding: '28px 20px 20px' }"
        @click="fullscreen = true"
      >
        <div class="text-[10px] font-bold tracking-[0.14em] uppercase text-black/40 mb-3">
          {{ localPass?.format === 'QR_CODE' ? 'QR Code' : 'Barcode' }}
        </div>
        <div v-if="localPass?.format !== 'QR_CODE'" class="w-full h-[110px]">
          <BarCode :data="localPass!.data" lineColor="#111" backgroundColor="#ffffff" />
        </div>
        <div v-else class="size-[200px] mx-auto">
          <QRCodeVue :data="localPass!.data" lineColor="#111" backgroundColor="#ffffff" />
        </div>
        <div class="mt-3 text-xs tracking-[0.18em] text-black/35 font-medium text-center break-all">
          {{ localPass?.data }}
        </div>
        <div class="mt-2.5 text-[10px] tracking-[0.08em] text-black/25 font-medium">
          Tik om te vergroten
        </div>
      </div>

      <!-- View mode -->
      <div v-if="!editing" class="px-5 pb-5">
        <div class="mb-[14px]">
          <div :style="fieldLabelStyle">Naam</div>
          <div class="text-[15px] font-medium text-(--ion-text-color)">{{ localPass?.label }}</div>
        </div>
        <div class="mb-[14px]">
          <div :style="fieldLabelStyle">Notities</div>
          <div class="whitespace-pre-wrap text-[15px] font-medium text-(--ion-text-color) opacity-60">{{ localPass?.notes || '—' }}</div>
        </div>
        <div class="mb-[14px]">
          <div :style="fieldLabelStyle">Kleur</div>
          <div class="w-5 h-5 rounded-[6px]" :style="{ background: localPass!.color }" />
        </div>
        <div class="mb-[14px]">
          <div :style="fieldLabelStyle">Verloopt</div>
          <div class="text-[15px] font-medium text-(--ion-text-color)">{{ expiryLabel || '—' }}</div>
        </div>
      </div>

      <!-- Edit mode -->
      <template v-else>
        <PassDetailsForm v-model="draft" />

        <div class="px-5 pb-5">
          <WebScanner v-if="isRescanning" ref="webScannerRef" />
          <button v-else @click="replaceCode" class="btn-secondary">Opnieuw scannen</button>
        </div>
      </template>

      <!-- Actions -->
      <div class="px-5 pb-5 flex flex-col gap-2.5 mb-20">
        <button @click="onDone" class="btn-subtle">Klaar</button>
        <button @click="onDelete" class="w-full p-[13px] rounded-[14px] border border-[rgba(255,80,80,0.3)] bg-transparent text-[rgba(220,60,60,0.8)] text-sm font-medium cursor-pointer">
          Verwijderen
        </button>
      </div>
    </IonContent>
  </IonModal>

  <!-- Fullscreen code viewer -->
  <Teleport to="body">
    <div
      v-if="fullscreen && localPass"
      class="fixed inset-0 z-[10000] bg-(--fullscreen-surface) flex flex-col"
    >
      <button :style="closeBtnStyle" @click="fullscreen = false">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="d ? '#fff' : '#000'" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div class="flex-1 w-full">
        <CodeViewer :data="localPass" />
      </div>
    </div>
  </Teleport>
</template>

<style>
ion-modal.pass-detail-modal::part(content) {
  border-radius: 28px 28px 0 0;
  background: var(--sheet-surface);
}

ion-modal.pass-detail-modal::part(handle) {
  background: var(--sheet-handle);
}
</style>
