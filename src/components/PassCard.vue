<script setup lang="ts">
import { computed } from 'vue'
import { format, parseISO } from 'date-fns'
import { nl } from 'date-fns/locale'
import { Pass } from '@/stores/passes'
import { textColorForBackground } from '@/utils/color'
import GrainOverlay from '@/components/GrainOverlay.vue'
import BarCode from '@/components/CodeViewer/BarCode.vue'
import QRCodePreview from '@/components/CodeViewer/QR-Code.vue'

const props = defineProps<{ pass: Pass; pressed?: boolean }>()
const emit = defineEmits<{ handlePointerDown: [e: PointerEvent] }>()

const textColor = computed(() => textColorForBackground(props.pass.color))

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
        class="relative overflow-hidden w-full select-none rounded-[20px] pt-5 px-[22px] pb-[18px] aspect-[1.586] shadow-[0_10px_36px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(0,0,0,0.4)] [transition:transform_0.14s_ease] flex flex-col justify-between"
        :style="{ background: pass.color, transform: pressed ? 'scale(0.978)' : 'scale(1)' }"
    >
        <GrainOverlay :id="pass.id!" />

        <!-- Drag handle -->
        <div
            class="absolute top-4 right-4 z-10 p-1.5 opacity-40 cursor-grab active:cursor-grabbing"
            style="touch-action: none"
            @pointerdown.stop="emit('handlePointerDown', $event)"
            @click.stop
        >
            <svg width="14" height="14" viewBox="0 0 14 14" :fill="textColor" xmlns="http://www.w3.org/2000/svg">
                <circle cx="4" cy="2.5" r="1.4" />
                <circle cx="10" cy="2.5" r="1.4" />
                <circle cx="4" cy="7" r="1.4" />
                <circle cx="10" cy="7" r="1.4" />
                <circle cx="4" cy="11.5" r="1.4" />
                <circle cx="10" cy="11.5" r="1.4" />
            </svg>
        </div>

        <!-- Name + expiry -->
        <div class="relative">
            <div
                class="font-bold leading-tight text-[22px] tracking-[-0.025em] mb-[5px]"
                :style="{ color: textColor }"
            >
                {{ pass.label }}
            </div>
            <div
                v-if="expiryLabel"
                class="text-xs font-medium opacity-65"
                :style="{ color: textColor }"
            >
                {{ expiryLabel }}
            </div>
        </div>

        <div class="flex-1" />

        <!-- Barcode strip -->
        <div class="relative flex items-center gap-2.5 h-[34px]">
            <div v-if="pass.format !== 'QR_CODE'" class="overflow-hidden shrink-0 h-[34px] w-[44%] opacity-[0.38]">
                <BarCode :data="pass.data" :lineColor="textColor" backgroundColor="transparent" />
            </div>
            <div v-else class="overflow-hidden shrink-0 h-[34px] w-[34px] opacity-[0.38]">
                <QRCodePreview :data="pass.data" :lineColor="textColor" backgroundColor="#00000000" />
            </div>
            <div class="opacity-40 text-[9px] tracking-[0.1em] uppercase" :style="{ color: textColor }">
                {{ pass.data }}
            </div>
        </div>
    </div>
</template>
