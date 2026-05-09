<script setup lang="ts">
import { computed, ref, toRaw, watch } from 'vue'
import { IonModal, alertController } from '@ionic/vue'
import { Pass } from '@/stores/passes'
import { useThemeStore } from '@/stores/theme'
import BarCode from '@/components/CodeViewer/BarCode.vue'
import QRCodeVue from '@/components/CodeViewer/QR-Code.vue'
import CodeViewer from '@/components/CodeViewer/CodeViewer.vue'
import { format, parseISO } from 'date-fns'
import { nl } from 'date-fns/locale'

const props = defineProps<{ pass: Pass | null; isOpen: boolean }>()
const emit = defineEmits<{
  close: []
  update: [pass: Pass]
  delete: [id: string]
}>()

const themeStore = useThemeStore()
const d = computed(() => themeStore.isDark)

const editing = ref(false)
const fullscreen = ref(false)
const draft = ref({ label: '', notes: '', color: '', expires: '' })
const localPass = ref<Pass | null>(null)

watch(() => props.isOpen, (open) => { if (!open) fullscreen.value = false })

watch(
  () => props.pass,
  (pass) => {
    if (pass) {
      localPass.value = structuredClone(toRaw(pass))
      draft.value = { label: pass.label, notes: pass.notes ?? '', color: pass.color, expires: pass.expires }
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

const onDelete = async () => {
  if (!localPass.value) return
  const alert = await alertController.create({
    header: 'Remove pass',
    message: `Are you sure you want to remove "${localPass.value.label}"?`,
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Remove', role: 'confirm' },
    ],
  })
  await alert.present()
  const { role } = await alert.onDidDismiss()
  if (role === 'confirm') emit('delete', localPass.value.id!)
}

const editBtnStyle = computed(() => ({
  padding: '7px 14px',
  borderRadius: '10px',
  border: 'none',
  background: editing.value
    ? (d.value ? '#fff' : '#1c1c1e')
    : (d.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'),
  color: editing.value
    ? (d.value ? '#000' : '#fff')
    : (d.value ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'),
  fontSize: '12px',
  fontWeight: '600',
  fontFamily: 'inherit',
  cursor: 'pointer',
}))

const inputStyle = computed(() => ({
  width: '100%',
  padding: '10px 12px',
  borderRadius: '10px',
  border: `1px solid ${d.value ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
  background: d.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
  color: d.value ? '#ffffff' : '#000000',
  fontSize: '15px',
  fontWeight: '500',
  fontFamily: 'inherit',
  outline: 'none',
}))

const fieldLabelStyle = computed(() => ({
  fontSize: '10px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.12em',
  fontWeight: '600',
  color: d.value ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
  marginBottom: '5px',
}))

const doneBtnStyle = computed(() => ({
  width: '100%',
  padding: '14px',
  borderRadius: '14px',
  border: 'none',
  background: d.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
  color: d.value ? '#fff' : '#000',
  fontSize: '15px',
  fontWeight: '600',
  fontFamily: 'inherit',
  cursor: 'pointer',
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
    <div class="h-full overflow-y-auto" style="padding-bottom: calc(20px + env(safe-area-inset-bottom))">

      <!-- Handle -->
      <div :style="handleStyle" />

      <!-- Header row -->
      <div class="flex justify-between items-center" style="padding: 0 20px 20px">
        <div style="font-size: 17px; font-weight: 700; letter-spacing: -0.02em; color: var(--ion-text-color)">
          {{ localPass?.label }}
        </div>
        <button @click="editing ? onSave() : (editing = true)" :style="editBtnStyle">
          {{ editing ? 'Save' : 'Edit' }}
        </button>
      </div>

      <!-- Barcode / QR panel — tap to expand -->
      <div
        class="flex flex-col items-center bg-white"
        style="margin: 0 20px 20px; border-radius: 18px; cursor: pointer; user-select: none"
        :style="localPass?.format === 'QR_CODE' ? { padding: '28px 28px 20px' } : { padding: '28px 20px 20px' }"
        @click="fullscreen = true"
      >
        <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(0,0,0,0.4); margin-bottom: 12px">
          {{ localPass?.format === 'QR_CODE' ? 'QR Code' : 'Barcode' }}
        </div>
        <div v-if="localPass?.format !== 'QR_CODE'" style="width: 100%; height: 110px">
          <BarCode :data="localPass!.data" lineColor="#111" backgroundColor="#ffffff" />
        </div>
        <div v-else style="width: 200px; height: 200px; margin: 0 auto">
          <QRCodeVue :data="localPass!.data" lineColor="#111" backgroundColor="#ffffff" />
        </div>
        <div style="margin-top: 12px; font-size: 12px; letter-spacing: 0.18em; color: rgba(0,0,0,0.35); font-weight: 500; text-align: center; word-break: break-all">
          {{ localPass?.data }}
        </div>
        <div style="margin-top: 10px; font-size: 10px; letter-spacing: 0.08em; color: rgba(0,0,0,0.25); font-weight: 500">
          Tap to expand
        </div>
      </div>

      <!-- Editable fields -->
      <div style="padding: 0 20px 20px">
        <div style="margin-bottom: 14px">
          <div :style="fieldLabelStyle">Naam</div>
          <input v-if="editing" v-model="draft.label" :style="inputStyle" />
          <div v-else style="font-size: 15px; font-weight: 500; color: var(--ion-text-color)">{{ localPass?.label }}</div>
        </div>

        <div style="margin-bottom: 14px">
          <div :style="fieldLabelStyle">Notities</div>
          <textarea
            v-if="editing"
            v-model="draft.notes"
            rows="2"
            :style="{ ...inputStyle, resize: 'none', overflowY: 'hidden', display: 'block' }"
            @input="(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px' }"
          />
          <div v-else style="font-size: 15px; font-weight: 500; color: var(--ion-text-color); opacity: 0.6">{{ localPass?.notes || '—' }}</div>
        </div>


        <!-- Color -->
        <div style="margin-bottom: 14px">
          <div :style="fieldLabelStyle">Kleur</div>
          <div v-if="editing" style="display: flex; align-items: center; gap: 10px">
            <input
              type="color"
              v-model="draft.color"
              style="width: 40px; height: 40px; border-radius: 10px; border: none; padding: 2px; cursor: pointer; background: none"
            />
          </div>
          <div v-else style="display: flex; align-items: center; gap: 8px">
            <div :style="{ width: '20px', height: '20px', borderRadius: '6px', background: localPass!.color, flexShrink: '0' }" />
          </div>
        </div>

        <!-- Expiry date -->
        <div style="margin-bottom: 14px">
          <div :style="fieldLabelStyle">Verloopt</div>
          <input
            v-if="editing"
            type="date"
            v-model="draft.expires"
            :style="inputStyle"
          />
          <div v-else style="font-size: 15px; font-weight: 500; color: var(--ion-text-color)">
            {{ expiryLabel || '—' }}
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div style="padding: 0 20px; display: flex; flex-direction: column; gap: 10px">
        <button @click="$emit('close')" :style="doneBtnStyle">Done</button>
        <button
          @click="onDelete"
          style="width: 100%; padding: 13px; border-radius: 14px; border: 1px solid rgba(255,80,80,0.3); background: transparent; color: rgba(220,60,60,0.8); font-size: 14px; font-weight: 500; font-family: inherit; cursor: pointer"
        >
          Remove Pass
        </button>
      </div>
    </div>
  </IonModal>

  <!-- Fullscreen code viewer -->
  <Teleport to="body">
    <div
      v-if="fullscreen && localPass"
      style="position: fixed; inset: 0; z-index: 10000; background: var(--fullscreen-surface); display: flex; flex-direction: column"
    >
      <button :style="closeBtnStyle" @click="fullscreen = false">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="d ? '#fff' : '#000'" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div style="flex: 1; width: 100%">
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
