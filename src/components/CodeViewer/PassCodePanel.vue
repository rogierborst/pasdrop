<script setup lang="ts">
import BarCode from './BarCode.vue';
import QRCodeVue from './QR-Code.vue';

withDefaults(defineProps<{
    data: string;
    format: string;
    /** Shows a tap hint and makes the card clickable. Emits `tap` on click. */
    interactive?: boolean;
    /** Smaller barcode/QR dimensions — for use in forms and previews. */
    compact?: boolean;
}>(), {
    interactive: false,
    compact: false,
});

const emit = defineEmits<{ tap: [] }>();
</script>

<template>
    <div
        class="flex flex-col items-center bg-white rounded-[18px] select-none"
        :class="interactive ? 'cursor-pointer' : ''"
        :style="format === 'QR_CODE' ? { padding: '28px 28px 20px' } : { padding: compact ? '16px 16px 12px' : '28px 20px 20px' }"
        @click="interactive && emit('tap')"
    >
        <div class="text-[10px] font-bold tracking-[0.14em] uppercase text-black/40 mb-3">
            {{ format === 'QR_CODE' ? 'QR Code' : 'Barcode' }}
        </div>
        <div v-if="format !== 'QR_CODE'" :class="compact ? 'w-full h-20' : 'w-full h-[110px]'">
            <BarCode :data="data" lineColor="#111" backgroundColor="#ffffff" />
        </div>
        <div v-else :class="compact ? 'w-36 h-36 mx-auto' : 'size-[200px] mx-auto'">
            <QRCodeVue :data="data" lineColor="#111" backgroundColor="#ffffff" />
        </div>
        <div class="mt-2 text-xs tracking-[0.12em] text-black/35 font-medium text-center break-all">
            {{ data }}
        </div>
        <div v-if="interactive" class="mt-2 text-[10px] tracking-[0.08em] text-black/25 font-medium">
            Tik om te vergroten
        </div>
    </div>
</template>
