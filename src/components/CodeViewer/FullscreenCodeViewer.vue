<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from '@/stores/theme';
import CodeViewer from './CodeViewer.vue';
import type { Pass } from '@/stores/passes';

defineProps<{ pass: Pass | null; open: boolean }>();
const emit = defineEmits<{ close: [] }>();

const d = computed(() => useThemeStore().isDark);

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
}));
</script>

<template>
    <Teleport to="body">
        <div v-if="open && pass" class="fixed inset-0 z-[10000] bg-(--fullscreen-surface) flex flex-col">
            <button :style="closeBtnStyle" @click="emit('close')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="d ? '#fff' : '#000'" stroke-width="2.5" stroke-linecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
            <div class="flex-1 w-full">
                <CodeViewer :data="pass" />
            </div>
        </div>
    </Teleport>
</template>
