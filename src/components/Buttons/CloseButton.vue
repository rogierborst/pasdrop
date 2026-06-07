<script setup lang="ts">
const props = withDefaults(defineProps<{ ariaLabel?: string }>(), {
    ariaLabel: 'Close',
});

const emit = defineEmits<{ click: [] }>();
</script>

<template>
    <button type="button" class="btn-close" :aria-label="props.ariaLabel" @click="emit('click')">
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            aria-hidden="true"
        >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    </button>
</template>

