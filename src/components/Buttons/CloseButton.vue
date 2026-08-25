<script setup lang="ts">
import CloseIcon from '@/components/icons/CloseIcon.vue'

const props = withDefaults(defineProps<{ ariaLabel?: string }>(), {
    ariaLabel: 'Close',
});

const emit = defineEmits<{ click: [] }>();
</script>

<template>
    <button type="button" class="btn-close" :aria-label="props.ariaLabel" @click="emit('click')">
        <CloseIcon aria-hidden="true" />
    </button>
</template>

