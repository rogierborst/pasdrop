<script setup lang="ts">
import { computed } from 'vue';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useThemeStore } from '@/stores/theme';
import { useSettingsStore } from '@/stores/settings';
import type { Pass } from '@/stores/passes';
import { usePassExpiry } from '@/composables/usePassExpiry';
import { computeReminderFireDate, reminderDurationLabel } from '@/utils/reminders';

const props = defineProps<{ pass: Pass }>();

const settingsStore = useSettingsStore();
settingsStore.load();

const d = computed(() => useThemeStore().isDark);
const { expiryLabel, expiryDistance } = usePassExpiry(computed(() => props.pass.expires));

const reminderRows = computed(() => {
    const offsets = props.pass.reminders;
    if (!offsets?.length || !props.pass.expires) return null;
    return offsets.map(days => {
        const fireDate = computeReminderFireDate(props.pass.expires, days, settingsStore.reminderTime);
        return {
            days,
            label: `${reminderDurationLabel(days)} van tevoren`,
            dateLabel: fireDate ? format(fireDate, 'd MMM yyyy', { locale: nl }) : '—',
        };
    });
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

const mutedDateStyle = computed(() => ({
    color: d.value ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
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
            <div v-if="expiryLabel" class="grid gap-x-3" style="grid-template-columns: auto minmax(0, 1fr)">
                <div class="text-[15px] font-medium whitespace-nowrap" :style="valueStyle">{{ expiryLabel }}</div>
                <div class="text-[15px] font-medium text-right" :style="mutedDateStyle">{{ expiryDistance }}</div>
            </div>
            <div v-else class="text-[15px] font-medium" :style="valueStyle">—</div>
        </div>
        <div v-if="reminderRows">
            <div :style="fieldLabelStyle">Herinneringen</div>
            <div class="grid gap-x-3 gap-y-1" style="grid-template-columns: auto minmax(0, 1fr)">
                <template v-for="row in reminderRows" :key="row.days">
                    <div class="text-[15px] font-medium whitespace-nowrap" :style="valueStyle">{{ row.label }}</div>
                    <div class="text-[15px] font-medium text-right" :style="mutedDateStyle">{{ row.dateLabel }}</div>
                </template>
            </div>
        </div>
    </div>
</template>
