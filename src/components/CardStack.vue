<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Pass } from '@/stores/passes'
import PassCard from '@/components/PassCard.vue'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

const props = defineProps<{ passes: Pass[] }>()
const emit = defineEmits<{ tap: [pass: Pass]; reorder: [passes: Pass[]] }>()

const PEEK = 62

const containerRef = ref<HTMLElement | null>(null)
const cardHeight = ref(0)
const order = ref<string[]>(props.passes.map(p => p.id!))
const pressedId = ref<string | null>(null)

const onCardTap = (pass: Pass) => { emit('tap', pass) }

interface DragState {
  dragId: string
  fromIdx: number
  targetIdx: number
  cardY: number
}
const dragState = ref<DragState | null>(null)

const orderedPasses = computed(() =>
  order.value.map(id => props.passes.find(p => p.id === id)).filter(Boolean) as Pass[]
)

const n = computed(() => orderedPasses.value.length)

const totalHeight = computed(() =>
  cardHeight.value > 0 ? cardHeight.value + (n.value - 1) * PEEK : 300
)

watch(
  () => props.passes.map(p => p.id).join(','),
  () => {
    order.value = props.passes.map(p => p.id!)
    dragState.value = null
  }
)

const cardStyle = (id: string, visualIdx: number): Record<string, string> => {
  const ds = dragState.value

  if (!ds) {
    return {
      top: `${visualIdx * PEEK}px`,
      zIndex: String(visualIdx + 1),
      transform: 'scale(1)',
      transition: 'top 0.28s cubic-bezier(0.22,1,0.36,1)',
    }
  }

  if (id === ds.dragId) {
    return {
      top: `${ds.cardY}px`,
      zIndex: String(n.value + 1),
      transform: 'scale(1.04)',
      transformOrigin: 'center top',
      boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
      transition: 'transform 0.12s ease, box-shadow 0.12s ease',
      cursor: 'grabbing',
    }
  }

  let adj = visualIdx
  if (ds.fromIdx < ds.targetIdx && visualIdx > ds.fromIdx && visualIdx <= ds.targetIdx) adj = visualIdx - 1
  else if (ds.fromIdx > ds.targetIdx && visualIdx >= ds.targetIdx && visualIdx < ds.fromIdx) adj = visualIdx + 1

  return {
    top: `${adj * PEEK}px`,
    zIndex: String(adj + 1),
    transform: 'scale(1)',
    transition: 'top 0.28s cubic-bezier(0.22,1,0.36,1)',
  }
}

let cancelDrag: (() => void) | null = null

const onPointerDown = (e: PointerEvent, passId: string, stackIdx: number) => {
  e.preventDefault()
  const handleEl = e.target as HTMLElement
  handleEl.setPointerCapture(e.pointerId)

  const containerRect = containerRef.value!.getBoundingClientRect()
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
    const relCardTop = ev.clientY - containerRect.top - grabOffsetY
    const cardCenter = relCardTop + cardHeight.value / 2
    const newTargetIdx = Math.max(0, Math.min(n.value - 1, Math.round(cardCenter / PEEK)))
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
      const fi = arr.indexOf(passId)
      arr.splice(fi, 1)
      arr.splice(lastTargetIdx, 0, passId)
      order.value = arr
      const reordered = arr.map(id => props.passes.find(p => p.id === id)).filter(Boolean) as Pass[]
      emit('reorder', reordered)
    }
    dragState.value = null
  }

  cancelDrag = cleanup
  handleEl.addEventListener('pointermove', onMove, { passive: false })
  handleEl.addEventListener('pointerup', cleanup)
}

let ro: ResizeObserver | null = null

const measureCard = () => {
  if (containerRef.value) {
    cardHeight.value = Math.round(containerRef.value.offsetWidth / 1.586)
  }
}

onMounted(() => {
  measureCard()
  ro = new ResizeObserver(measureCard)
  if (containerRef.value) ro.observe(containerRef.value)
})

onUnmounted(() => {
  cancelDrag?.()
  ro?.disconnect()
})
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
    <div
      v-for="(pass, i) in orderedPasses"
      :key="pass.id"
      class="absolute left-0 right-0"
      :style="cardStyle(pass.id!, i)"
      @click="onCardTap(pass)"
      @pointerdown="pressedId = pass.id!"
      @pointerup="pressedId = null"
      @pointerleave="pressedId = null"
    >
      <PassCard :pass="pass" :pressed="pressedId === pass.id" @handle-pointer-down="onPointerDown($event, pass.id!, i)" />
    </div>
  </div>
</template>
