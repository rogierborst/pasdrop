<script setup lang="ts">
import { computed } from 'vue'
import { format, parseISO } from 'date-fns'
import { nl } from 'date-fns/locale'
import { Pass } from '@/stores/passes'
import GrainOverlay from '@/components/GrainOverlay.vue'
import BarCode from '@/components/CodeViewer/BarCode.vue'
import QRCodePreview from '@/components/CodeViewer/QR-Code.vue'

const props = defineProps<{ pass: Pass; pressed?: boolean }>()

const expiryLabel = computed(() => {
  if (!props.pass.expires) return null
  try {
    return format(parseISO(props.pass.expires), 'd MMM yyyy', { locale: nl })
  } catch {
    return null
  }
})
</script>

<template>
  <div
    class="relative overflow-hidden w-full select-none"
    :style="{
      background: pass.color,
      borderRadius: '20px',
      padding: '20px 22px 18px',
      aspectRatio: '1.586',
      boxShadow: '0 10px 36px rgba(0,0,0,0.55)',
      transform: pressed ? 'scale(0.978)' : 'scale(1)',
      transition: 'transform 0.14s ease',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }"
  >
    <GrainOverlay :id="pass.id!" />

    <!-- Name + expiry -->
    <div class="relative">
      <div
        class="text-white font-bold leading-tight"
        style="font-size: 22px; letter-spacing: -0.025em; margin-bottom: 5px"
      >
        {{ pass.label }}
      </div>
      <div
        v-if="expiryLabel"
        style="color: rgba(255,255,255,0.65); font-size: 12px; font-weight: 500"
      >
        {{ expiryLabel }}
      </div>
    </div>

    <div class="flex-1" />

    <!-- Barcode strip -->
    <div class="relative flex items-center gap-2.5" style="height: 34px">
      <template v-if="pass.format !== 'QR_CODE'">
        <div class="overflow-hidden flex-1" style="height: 34px; opacity: 0.38">
          <BarCode :data="pass.data" lineColor="#fff" backgroundColor="transparent" />
        </div>
      </template>
      <template v-else>
        <div class="overflow-hidden flex-shrink-0" style="height: 34px; width: 34px; opacity: 0.38">
          <QRCodePreview :data="pass.data" lineColor="#ffffff" backgroundColor="#00000000" />
        </div>
        <span style="color: rgba(255,255,255,0.25); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase">
          Tap to scan
        </span>
      </template>
    </div>
  </div>
</template>
