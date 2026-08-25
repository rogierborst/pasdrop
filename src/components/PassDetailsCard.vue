<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from '@/stores/theme';
import type { Pass } from '@/stores/passes';
import { usePassExpiry } from '@/composables/usePassExpiry';
import { reminderDurationLabel } from '@/utils/reminders';

const props = defineProps<{ pass: Pass }>();

const d = computed(() => useThemeStore().isDark);
const { expiryLabel } = usePassExpiry(computed(() => props.pass.expires));

const reminderSummary = computed(() => {
    const offsets = props.pass.reminders;
    if (!offsets?.length) return null;
    return `${offsets.map(reminderDurationLabel).join(', ')} van tevoren`;
});

const fieldLabelStyle = computed(() => ({
    fontSize: '10px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    fontWeight: '600',
    color: d.value ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
    marginBottom: '5px',
}));

const valueStyle = computed(() => ({
    color: d.value ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)',
}));
</script>

<template>
    <div class="rounded-[18px] px-5 py-4 flex flex-col gap-4" :style="{ background: d ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.7)' }">
        <div>
            <div :style="fieldLabelStyle">Naam</div>
            <div class="text-[15px] font-medium" :style="valueStyle">{{ pass.label }}</div>
        </div>
        <div v-if="pass.notes">
            <div :style="fieldLabelStyle">Notities</div>
            <div class="whitespace-pre-wrap text-[15px] font-medium opacity-60" :style="valueStyle">{{ pass.notes }}</div>
        </div>
        <div>
            <div :style="fieldLabelStyle">Kleur</div>
            <div class="w-5 h-5 rounded-[6px]" :style="{ background: pass.color }" />
        </div>
        <div>
            <div :style="fieldLabelStyle">Verloopt</div>
            <div class="text-[15px] font-medium" :style="valueStyle">{{ expiryLabel || '—' }}</div>
        </div>
        <div v-if="reminderSummary">
            <div :style="fieldLabelStyle">Herinneringen</div>
            <div class="text-[15px] font-medium" :style="valueStyle">{{ reminderSummary }}</div>
        </div>
    </div>
</template>
