import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import { PEEK } from './constants'

/**
 * Measures card dimensions from container width and exposes the total stack height.
 *
 * Card height is derived from an ID-1-like aspect ratio used by pass cards.
 * Total height accounts for stacked overlap (`PEEK`) across `n` cards.
 */
export function useCardMeasure(containerRef: Ref<HTMLElement | null>, n: ComputedRef<number>) {
  const cardHeight = ref(0)

  /**
   * Required container height for the stack.
   * Uses a conservative fallback before first measurement to avoid layout collapse.
   */
  const totalHeight = computed(() =>
    cardHeight.value > 0 ? cardHeight.value + (n.value - 1) * PEEK : 300
  )

  /**
   * Recomputes card height from the current container width.
   */
  const measureCard = () => {
    if (containerRef.value) {
      cardHeight.value = Math.round(containerRef.value.offsetWidth / 1.586)
    }
  }

  let ro: ResizeObserver | null = null

  onMounted(() => {
    measureCard()
    ro = new ResizeObserver(measureCard)
    if (containerRef.value) ro.observe(containerRef.value)
  })

  onUnmounted(() => {
    ro?.disconnect()
  })

  return { cardHeight, totalHeight }
}
