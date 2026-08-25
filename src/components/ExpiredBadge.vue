<script setup lang="ts">
import { ref, useId } from 'vue'
import { IonPopover } from '@ionic/vue'

// Use a per-instance id (not the pass id) so gradients stay unique even when
// the same pass is rendered in multiple places at once (e.g. Ionic keeps the
// index page's card alive in the DOM while the detail page is shown).
const uid = useId()

withDefaults(defineProps<{
    /** Tailwind width/height classes, e.g. "w-9 h-9". */
    size?: string;
    /** Ring like an alarm bell every 10 seconds. */
    wiggle?: boolean;
}>(), {
    size: 'w-9 h-9',
    wiggle: false,
});

const popoverOpen = ref(false);
const popoverEvent = ref<Event>();

const presentPopover = (event: Event) => {
    event.stopPropagation();
    popoverEvent.value = event;
    popoverOpen.value = true;
};
</script>

<template>
    <svg
        aria-label="Verlopen"
        viewBox="0 0 512 512"
        class="expired-badge absolute -left-4 top-1 z-10 cursor-pointer"
        :class="[size, wiggle ? 'expired-badge--wiggle' : '-rotate-12']"
        @click="presentPopover"
    >
        <defs>
            <linearGradient :id="`expired-fill-${uid}`" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#ffcb6b" />
                <stop offset="55%" stop-color="#ff9d1f" />
                <stop offset="100%" stop-color="#d97600" />
            </linearGradient>
            <linearGradient :id="`expired-stroke-${uid}`" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#ffdba0" />
                <stop offset="100%" stop-color="#4a2200" />
            </linearGradient>
        </defs>
        <path
            d="M449.07 399.08L278.64 82.58c-12.08-22.44-44.26-22.44-56.35 0L51.87 399.08A32 32 0 0080 446.25h340.89a32 32 0 0028.18-47.17z"
            :fill="`url(#expired-fill-${uid})`"
            :stroke="`url(#expired-stroke-${uid})`"
            stroke-width="8"
            stroke-linejoin="round"
        />
        <path
            d="M250.47 397.25a20 20 0 1120-20 20 20 0 01-20 20zM272.19 196.1l-5.74 122a16 16 0 01-32 0l-5.74-121.95a21.73 21.73 0 0121.5-22.69h.21a21.74 21.74 0 0121.73 22.7z"
            fill="#1a0d00"
        />
    </svg>

    <IonPopover :is-open="popoverOpen" :event="popoverEvent" :dismiss-on-select="true" @didDismiss="popoverOpen = false">
        <div class="px-4 py-2.5 text-sm font-medium">Deze kaart is verlopen</div>
    </IonPopover>
</template>

<style scoped>
.expired-badge {
    filter: drop-shadow(2px 3px 3px rgba(0 0 0 / 50%));
}

.expired-badge--wiggle {
    transform-origin: 50% 45%;
    animation: expired-badge-ring 10s ease-in-out infinite;
}

@keyframes expired-badge-ring {
    0%, 92% { transform: rotate(-12deg); }
    93% { transform: rotate(-30deg); }
    93.75% { transform: rotate(4deg); }
    94.5% { transform: rotate(-26deg); }
    95.25% { transform: rotate(6deg); }
    96% { transform: rotate(-20deg); }
    96.75% { transform: rotate(0deg); }
    97.5% { transform: rotate(-14deg); }
    98.25% { transform: rotate(-9deg); }
    100% { transform: rotate(-12deg); }
}
</style>
