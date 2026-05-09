import { ref } from 'vue'

// Module-level singleton — survives component re-renders
const pending = ref(false)

export function useAddPassFlow() {
  const requestAddPass = () => { pending.value = true }
  const consumeRequest = (): boolean => {
    const was = pending.value
    pending.value = false
    return was
  }
  return { pending, requestAddPass, consumeRequest }
}
