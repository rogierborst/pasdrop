import { ref, computed, watch } from 'vue'
import type { Pass } from '@/stores/passes'

/**
 * Maintains a stable, reorderable card ID order and exposes ordered pass data.
 *
 * `order` is the single source of truth for visual stack order.
 * When upstream pass IDs change (add/remove/replace), order is resynced and
 * `onReset` is called so drag/interaction state can be cleared.
 */
export function useCardStack(getPasses: () => Pass[], onReset?: () => void) {
  const order = ref<string[]>(getPasses().map(p => p.id!))

  /**
   * Passes projected into the current `order` sequence.
   */
  const orderedPasses = computed(() =>
    order.value.map(id => getPasses().find(p => p.id === id)).filter(Boolean) as Pass[]
  )

  /** Number of currently visible/ordered cards. */
  const n = computed(() => orderedPasses.value.length)

  watch(
    () => getPasses().map(p => p.id).join(','),
    () => {
      order.value = getPasses().map(p => p.id!)
      onReset?.()
    }
  )

  return { order, orderedPasses, n }
}
