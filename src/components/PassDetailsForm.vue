<script setup lang="ts">
import { IonList, IonItem, IonInput, IonTextarea, IonLabel } from '@ionic/vue';
import type { Pass } from '@/stores/passes';
import CategorySelect from '@/components/CategorySelect.vue';

const pass = defineModel<Partial<Pass>>({ required: true });
</script>

<template>
    <ion-list>
        <ion-item>
            <CategorySelect v-model="pass.categoryId" />
        </ion-item>
        <ion-item>
            <ion-input label="Naam" v-model="pass.label" />
        </ion-item>
        <ion-item>
            <!-- @TODO: use custom color picker -->
            <ion-input label="Kleur" :type="'color' as any" v-model="pass.color" />
        </ion-item>
        <ion-item>
            <ion-input label="Verloopt op" v-model="pass.expires" type="date" />
        </ion-item>
        <ion-item>
            <ion-label position="stacked">Notitie</ion-label>
            <ion-textarea v-model="pass.notes" :auto-grow="true" placeholder="Optionele notitie..." />
        </ion-item>
    </ion-list>
</template>
