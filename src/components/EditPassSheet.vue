<script setup lang="ts">
import PassDetailsForm from '@/components/PassDetailsForm.vue';
import { IonButton } from '@ionic/vue';
import { Pass, usePassesStore } from '@/stores/passes';
import { ref, toRaw, watch } from 'vue';

const emit = defineEmits(['save', 'cancel']);

const pass = defineModel<Pass>();
const localPass = ref<Pass>();

// clone when model changes
watch(
    () => pass.value,
    (updatedPass: Pass | undefined) => {
        localPass.value = updatedPass ? structuredClone(toRaw(updatedPass)) : undefined;
    },
    { immediate: true }
);

const save = () => {
    if (!pass.value?.id || !localPass.value) return;

    usePassesStore().updatePass(pass.value!.id, localPass.value);
    pass.value = structuredClone(toRaw(localPass.value));

    emit('save');
}
</script>

<template>
    <div>
        <PassDetailsForm v-model="localPass!" />

        <div class="px-5 pt-4 flex flex-col gap-2.5">
            <ion-button @click="save">Opslaan</ion-button>
            <ion-button @click="emit('cancel')">Annuleren</ion-button>
        </div>
    </div>
</template>
