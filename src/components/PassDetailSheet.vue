<script setup lang="ts">
import { computed, ref, toRaw, watch } from 'vue'
import { IonModal, alertController } from '@ionic/vue'
import { Pass } from '@/stores/passes'
import BarCode from '@/components/CodeViewer/BarCode.vue'
import QRCodeVue from '@/components/CodeViewer/QR-Code.vue'
import { format, parseISO } from 'date-fns'
import { nl } from 'date-fns/locale'

const props = defineProps<{ pass: Pass | null; isOpen: boolean }>()
const emit = defineEmits<{
  close: []
  update: [pass: Pass]
  delete: [id: string]
}>()

const editing = ref(false)
const draft = ref({ label: '', notes: '' })
const localPass = ref<Pass | null>(null)

watch(
  () => props.pass,
  (pass) => {
    if (pass) {
      localPass.value = structuredClone(toRaw(pass))
      draft.value = { label: pass.label, notes: pass.notes ?? '' }
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
  background: editing.value ? '#fff' : 'rgba(255,255,255,0.08)',
  color: editing.value ? '#000' : 'rgba(255,255,255,0.6)',
  fontSize: '12px',
  fontWeight: '600',
  fontFamily: 'inherit',
  cursor: 'pointer',
}))

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.08)',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '500',
  fontFamily: 'inherit',
  outline: 'none',
}
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
      <div style="width: 36px; height: 4px; background: rgba(255,255,255,0.12); border-radius: 2px; margin: 16px auto 20px" />

      <!-- Header row -->
      <div class="flex justify-between items-center" style="padding: 0 20px 20px">
        <div class="text-white font-bold" style="font-size: 17px; letter-spacing: -0.02em">
          {{ localPass?.label }}
        </div>
        <button @click="editing ? onSave() : (editing = true)" :style="editBtnStyle">
          {{ editing ? 'Save' : 'Edit' }}
        </button>
      </div>

      <!-- Barcode / QR panel -->
      <div
        class="flex flex-col items-center bg-white"
        style="margin: 0 20px 20px; border-radius: 18px;"
        :style="localPass?.format === 'QR_CODE' ? { padding: '28px 28px 20px' } : { padding: '28px 20px 20px' }"
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
      </div>

      <!-- Editable fields -->
      <div style="padding: 0 20px 20px">
        <div style="margin-bottom: 14px">
          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 600; color: rgba(255,255,255,0.4); margin-bottom: 5px">
            Card name
          </div>
          <input v-if="editing" v-model="draft.label" :style="inputStyle" />
          <div v-else class="text-white font-medium" style="font-size: 15px">{{ localPass?.label }}</div>
        </div>

        <div style="margin-bottom: 14px">
          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 600; color: rgba(255,255,255,0.4); margin-bottom: 5px">
            Notes
          </div>
          <input v-if="editing" v-model="draft.notes" :style="inputStyle" />
          <div v-else style="font-size: 15px; font-weight: 500; color: rgba(255,255,255,0.6)">{{ localPass?.notes || '—' }}</div>
        </div>

        <div v-if="expiryLabel" style="margin-bottom: 14px">
          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 600; color: rgba(255,255,255,0.4); margin-bottom: 5px">
            Expires
          </div>
          <div class="text-white font-medium" style="font-size: 15px">{{ expiryLabel }}</div>
        </div>
      </div>

      <!-- Actions -->
      <div style="padding: 0 20px; display: flex; flex-direction: column; gap: 10px">
        <button
          @click="$emit('close')"
          style="width: 100%; padding: 14px; border-radius: 14px; border: none; background: rgba(255,255,255,0.08); color: #fff; font-size: 15px; font-weight: 600; font-family: inherit; cursor: pointer"
        >
          Done
        </button>
        <button
          @click="onDelete"
          style="width: 100%; padding: 13px; border-radius: 14px; border: 1px solid rgba(255,80,80,0.25); background: transparent; color: rgba(255,100,100,0.7); font-size: 14px; font-weight: 500; font-family: inherit; cursor: pointer"
        >
          Remove Pass
        </button>
      </div>
    </div>
  </IonModal>
</template>

<style>
ion-modal.pass-detail-modal::part(content) {
  border-radius: 28px 28px 0 0;
  background: oklch(13% 0.01 250);
}

ion-modal.pass-detail-modal::part(handle) {
  background: rgba(255, 255, 255, 0.15);
}
</style>
