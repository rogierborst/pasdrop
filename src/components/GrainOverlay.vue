<script setup lang="ts">
defineProps<{ id: string }>()
</script>

<template>
  <svg
    class="absolute inset-0 w-full h-full pointer-events-none"
    style="opacity: 0.15"
    aria-hidden="true"
  >
    <filter :id="`grain-${id}`">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" :filter="`url(#grain-${id})`" />
  </svg>
</template>
