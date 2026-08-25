<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ variant: 'no-passes' | 'empty-category' }>()
const emit = defineEmits<{ addPass: []; showAll: [] }>()

const content = computed(() => props.variant === 'no-passes'
  ? {
      title: 'Nog geen passen',
      subtitle: 'Voeg je eerste pas toe om \'m hier terug te zien.',
      primaryLabel: 'Eerste pas toevoegen',
    }
  : {
      title: 'Niets in deze categorie',
      subtitle: 'Voeg hier een pas toe, of bekijk al je passen.',
      primaryLabel: 'Pas toevoegen',
    })
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="text-black/25 dark:text-white/25">
      <rect x="2" y="5" width="20" height="14" rx="3" /><path d="M2 10h20" />
    </svg>
    <div class="text-base font-semibold text-(--ion-text-color)">{{ content.title }}</div>
    <div class="max-w-[240px] text-sm text-black/45 dark:text-white/50">{{ content.subtitle }}</div>
    <button
      class="mt-2 cursor-pointer rounded-full border-none bg-[#1c1c1e] px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-[#0a0a0c]"
      @click="emit('addPass')"
    >
      {{ content.primaryLabel }}
    </button>
    <button
      v-if="variant === 'empty-category'"
      class="cursor-pointer border-none bg-transparent text-sm font-medium text-black/45 underline underline-offset-2 dark:text-white/50"
      @click="emit('showAll')"
    >
      Alle passen tonen
    </button>
  </div>
</template>
