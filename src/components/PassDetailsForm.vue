<script setup lang="ts">
import { IonList, IonItem, IonInput, IonTextarea, IonLabel } from '@ionic/vue';
import type { Pass } from '@/stores/passes';
import CategorySelect from '@/components/CategorySelect.vue';
import ColorPickerField from '@/components/ColorPickerField.vue';

const pass = defineModel<Partial<Pass>>({ required: true });
</script>

<template>
    <ion-list class="app-transparent-list">
        <ion-item class="app-transparent-item">
            <CategorySelect v-model="pass.categoryId" />
        </ion-item>
        <ion-item class="app-transparent-item">
            <ion-input label="Naam" v-model="pass.label" />
        </ion-item>
        <ColorPickerField v-model="pass.color as string" />
        <ion-item class="app-transparent-item">
            <ion-input label="Verloopt op" v-model="pass.expires" type="date" />
        </ion-item>
        <ion-item class="app-transparent-item">
            <ion-label position="stacked">Notitie</ion-label>
            <ion-textarea v-model="pass.notes" :auto-grow="true" placeholder="Optionele notitie..." />
        </ion-item>
    </ion-list>
</template>
