<script setup lang="ts">
defineProps<{ id: string }>()
</script>

<template>
  <svg
    class="absolute inset-0 w-full h-full pointer-events-none opacity-25"
    aria-hidden="true"
  >
    <filter :id="`grain-${id}`">
      <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="2" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" :filter="`url(#grain-${id})`" />
  </svg>
</template>
