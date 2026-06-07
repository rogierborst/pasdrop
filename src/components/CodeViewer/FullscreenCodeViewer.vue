<script setup lang="ts">
import CloseButton from '@/components/Buttons/CloseButton.vue';
import CodeViewer from './CodeViewer.vue';
import type { Pass } from '@/stores/passes';

defineProps<{ pass: Pass | null; open: boolean }>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
    <Teleport to="body">
        <div v-if="open && pass" class="fixed inset-0 z-10000 flex flex-col bg-(--fullscreen-surface)">
            <CloseButton
                class="absolute right-4 top-[calc(16px+env(safe-area-inset-top))] z-10"
                aria-label="Close fullscreen code viewer"
                @click="emit('close')"
            />
            <div class="w-full flex-1">
                <CodeViewer :data="pass" />
            </div>
        </div>
    </Teleport>
</template>
