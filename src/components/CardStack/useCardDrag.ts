import { ref, onUnmounted } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import type { Pass } from '@/stores/passes'
import { PEEK, DRAG_SCALE } from './constants'

/**
 * Runtime drag state for the currently moved card.
 */
interface DragState {
  dragId: string
  fromIdx: number
  targetIdx: number
  cardY: number
}

/**
 * CSS classes toggled by drag state:
 * - `is-dragging`: applied to the actively dragged card.
 * - `is-displaced`: applied to cards shifted to make room.
 */
type CardDragClassName = 'is-dragging' | 'is-displaced'
type CardDragClasses = Partial<Record<CardDragClassName, boolean>>

/**
 * Provides pointer-driven drag/reorder behavior for the pass card stack.
 *
 * - Keeps visual displacement state in sync while dragging.
 * - Emits haptics when drag starts and when crossing stack boundaries.
 * - Commits reordered pass array on pointer release.
 */
export function useCardDrag(
  order: Ref<string[]>,
  n: ComputedRef<number>,
  containerRef: Ref<HTMLElement | null>,
  getPasses: () => Pass[],
  onReorder: (passes: Pass[]) => void,
) {
  const dragState = ref<DragState | null>(null)
  const pressedId = ref<string | null>(null)
  let cancelDrag: (() => void) | null = null

  /** Clears any transient drag visual state. */
  const resetDrag = () => {
    dragState.value = null
  }

  /**
   * Returns drag-related classes for the card at `visualIdx`.
   * Possible class keys: `is-dragging`, `is-displaced`.
   */
  const getCardClasses = (id: string, visualIdx: number): CardDragClasses => {
    const ds = dragState.value
    if (!ds) return {}
    if (id === ds.dragId) return { 'is-dragging': true }

    const isDisplacedDown = ds.fromIdx < ds.targetIdx && visualIdx > ds.fromIdx && visualIdx <= ds.targetIdx
    const isDisplacedUp = ds.fromIdx > ds.targetIdx && visualIdx >= ds.targetIdx && visualIdx < ds.fromIdx
    return { 'is-displaced': isDisplacedDown || isDisplacedUp }
  }

  /**
   * Computes inline top/z-index positioning for stacked card rendering.
   */
  const getCardPosition = (id: string, visualIdx: number): { top: string; zIndex: string } => {
    const ds = dragState.value

    if (!ds) {
      return { top: `${visualIdx * PEEK}px`, zIndex: String(visualIdx + 1) }
    }

    if (id === ds.dragId) {
      return { top: `${ds.cardY}px`, zIndex: '100' }
    }

    let adj = visualIdx
    if (ds.fromIdx < ds.targetIdx && visualIdx > ds.fromIdx && visualIdx <= ds.targetIdx) adj = visualIdx - 1
    else if (ds.fromIdx > ds.targetIdx && visualIdx >= ds.targetIdx && visualIdx < ds.fromIdx) adj = visualIdx + 1

    return { top: `${adj * PEEK}px`, zIndex: String(adj + 1) }
  }

  /**
   * Starts drag tracking from the handle pointer-down event.
   */
  const onPointerDown = (e: PointerEvent, passId: string, stackIdx: number) => {
    e.preventDefault()
    const handleEl = e.target as HTMLElement
    handleEl.setPointerCapture(e.pointerId)

    const containerRect = containerRef.value!.getBoundingClientRect()
    // Keep card anchored under the finger at the initial grab point.
    const grabOffsetY = e.clientY - containerRect.top - stackIdx * PEEK
    const startY = e.clientY
    let isDrag = false
    let lastTargetIdx = stackIdx

    const onMove = (ev: PointerEvent) => {
      ev.preventDefault()
      if (!isDrag && Math.abs(ev.clientY - startY) > 7) {
        isDrag = true
        Haptics.impact({ style: ImpactStyle.Medium })
      }
      if (!isDrag) return
      const relCardTop = ev.clientY - containerRect.top - grabOffsetY * DRAG_SCALE
      const newTargetIdx = Math.max(0, Math.min(n.value - 1, Math.round((ev.clientY - containerRect.top) / PEEK)))
      if (newTargetIdx !== lastTargetIdx) {
        Haptics.impact({ style: ImpactStyle.Light })
      }
      lastTargetIdx = newTargetIdx
      dragState.value = { dragId: passId, fromIdx: stackIdx, targetIdx: lastTargetIdx, cardY: relCardTop }
    }

    const cleanup = () => {
      handleEl.removeEventListener('pointermove', onMove)
      handleEl.removeEventListener('pointerup', cleanup)
      handleEl.releasePointerCapture(e.pointerId)
      pressedId.value = null
      cancelDrag = null

      if (isDrag && lastTargetIdx !== stackIdx) {
        const arr = [...order.value]
        const foundIdx = arr.indexOf(passId)
        arr.splice(foundIdx, 1)
        arr.splice(lastTargetIdx, 0, passId)
        order.value = arr

        // Map ID order back to full pass objects for persistence/state update.
        const reordered = arr.map(id => getPasses().find(p => p.id === id)).filter(Boolean) as Pass[]
        onReorder(reordered)
      }
      dragState.value = null
    }

    cancelDrag = cleanup
    handleEl.addEventListener('pointermove', onMove, { passive: false })
    handleEl.addEventListener('pointerup', cleanup)
  }

  onUnmounted(() => {
    cancelDrag?.()
  })

  return { dragState, pressedId, onPointerDown, getCardClasses, getCardPosition, resetDrag }
}
