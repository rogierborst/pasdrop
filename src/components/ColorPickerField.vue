<script setup lang="ts">
import { ref } from 'vue'
import { IonItem, IonLabel } from '@ionic/vue'
import { ChromePicker } from 'vue-color'

const color = defineModel<string>({ required: true })
const open = ref(false)
</script>

<template>
    <ion-item class="app-transparent-item" button :detail="false" @click="open = !open">
        <ion-label>Kleur</ion-label>
        <div
            slot="end"
            class="w-6 h-6 rounded-full border border-black/10"
            :style="{ background: color }"
        />
    </ion-item>
    <div v-if="open" class="px-4 py-3 flex flex-col gap-3">
        <ChromePicker v-model="color" :disable-alpha="true" :disable-fields="true" class="color-picker" />
        <button
            class="w-full py-2.5 rounded-xl text-sm font-semibold bg-(--ion-color-primary) text-white"
            @click="open = false"
        >Klaar</button>
    </div>
</template>

<style scoped>
:deep(.vc-chrome-picker) {
    width: 100%;
    box-sizing: border-box;
}
</style>
