<script setup lang="ts">
import { ref } from 'vue'
import type { Pass } from '@/stores/passes'
import PassCard from '@/components/PassCard.vue'
import { useCardStack } from './useCardStack'
import { useCardMeasure } from './useCardMeasure'
import { useCardDrag } from './useCardDrag'
import { PEEK } from './constants'

const props = defineProps<{ passes: Pass[] }>()
const emit = defineEmits<{ tap: [pass: Pass]; reorder: [passes: Pass[]] }>()

const containerRef = ref<HTMLElement | null>(null)

const { order, orderedPasses, n } = useCardStack(
  () => props.passes,
  () => resetDrag(),
)

const { cardHeight, totalHeight } = useCardMeasure(containerRef, n)

const { dragState, pressedId, onPointerDown, getCardClasses, getCardPosition, resetDrag } = useCardDrag(
  order,
  n,
  containerRef,
  () => props.passes,
  (reordered) => emit('reorder', reordered),
)

const onCardTap = (pass: Pass) => { emit('tap', pass) }
</script>

<template>
  <!-- Empty state -->
  <div
    v-if="passes.length === 0"
    class="flex flex-col items-center justify-center gap-3 min-h-[180px] opacity-30"
  >
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round">
      <rect x="2" y="5" width="20" height="14" rx="3" /><path d="M2 10h20" />
    </svg>
    <div class="text-white text-sm">Nog geen passen toegevoegd</div>
  </div>

  <!-- Stack -->
  <div
    v-else
    ref="containerRef"
    class="relative w-full"
    :style="{ height: `${totalHeight}px` }"
  >
    <!-- Ghost placeholder -->
    <div
      v-if="dragState"
      class="absolute left-0 right-0 rounded-[20px] border-2 border-dashed pointer-events-none"
      :style="{
        top: `${dragState.targetIdx * PEEK}px`,
        height: `${cardHeight}px`,
        zIndex: '99',
        borderColor: 'rgba(255,255,255,0.3)',
        transition: 'top 0.28s cubic-bezier(0.22,1,0.36,1)',
      }"
    />

    <div
      v-for="(pass, i) in orderedPasses"
      :key="pass.id"
      class="card-slot absolute left-0 right-0"
      :class="getCardClasses(pass.id!, i)"
      :style="getCardPosition(pass.id!, i)"
      @click="onCardTap(pass)"
      @pointerdown="pressedId = pass.id!"
      @pointerup="pressedId = null"
      @pointerleave="pressedId = null"
    >
      <PassCard :pass="pass" :pressed="pressedId === pass.id" @handle-pointer-down="onPointerDown($event, pass.id!, i)" />
    </div>
  </div>
</template>

<style scoped>
.card-slot {
  transition: top 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.is-dragging {
  transform: scale(0.6);
  transform-origin: center top;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  cursor: grabbing;
  opacity: 0.9;
}
</style>
