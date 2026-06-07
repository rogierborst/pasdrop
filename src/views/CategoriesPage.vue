<script setup lang="ts">
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonMenuButton, IonList, IonItem, IonLabel,
    IonButton, IonIcon, IonNote, alertController, onIonViewWillEnter,
} from '@ionic/vue';
import { add, createOutline, trashBinOutline } from 'ionicons/icons';
import { useCategoriesStore, type Category } from '@/stores/categories';
import { usePassesStore } from '@/stores/passes';
import { useRouter } from 'vue-router';
import { VueDraggable } from 'vue-draggable-plus';

const categoriesStore = useCategoriesStore();
const passesStore = usePassesStore();
const router = useRouter();

const navigateToCategory = (id: string) => {
    categoriesStore.selectedCategoryId = id;
    router.push('/passes');
};

onIonViewWillEnter(() => {
    categoriesStore.loadCategories();
    passesStore.loadPasses();
});

const promptAdd = async () => {
    const alert = await alertController.create({
        header: 'Nieuwe categorie',
        inputs: [{ name: 'name', type: 'text', placeholder: 'Naam' }],
        buttons: [
            { text: 'Annuleren', role: 'cancel' },
            { text: 'Toevoegen', role: 'confirm' },
        ],
    });
    await alert.present();
    const { data, role } = await alert.onDidDismiss();
    if (role === 'confirm' && data?.values?.name?.trim()) {
        await categoriesStore.addCategory(data.values.name.trim());
    }
};

const promptDelete = async (id: string, name: string) => {
    const count = passesStore.passes.filter(pass => pass.categoryId === id).length;
    const message = count > 0
        ? count === 1
            ? `"${name}" verwijderen? 1 pas raakt zijn categorie kwijt.`
            : `"${name}" verwijderen? ${count} passen raken hun categorie kwijt.`
        : `"${name}" verwijderen?`;
    const alert = await alertController.create({
        header: 'Categorie verwijderen',
        message,
        buttons: [
            { text: 'Annuleren', role: 'cancel' },
            { text: 'Verwijderen', role: 'confirm' },
        ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role === 'confirm') {
        await passesStore.clearCategory(id);
        await categoriesStore.deleteCategory(id);
    }
};

const onReorder = (newOrder: Category[]) => {
    categoriesStore.reorderCategories(newOrder);
};

const promptRename = async (id: string, currentName: string) => {
    const alert = await alertController.create({
        header: 'Categorie hernoemen',
        inputs: [{ name: 'name', type: 'text', value: currentName }],
        buttons: [
            { text: 'Annuleren', role: 'cancel' },
            { text: 'Opslaan', role: 'confirm' },
        ],
    });
    await alert.present();
    const { data, role } = await alert.onDidDismiss();
    if (role === 'confirm' && data?.values?.name?.trim()) {
        await categoriesStore.updateCategory(id, data.values.name.trim());
    }
};
</script>

<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar class="app-surface">
                <ion-buttons slot="start">
                    <ion-menu-button color="primary" />
                </ion-buttons>
                <ion-title>Categorieën</ion-title>
                <ion-buttons slot="end">
                    <ion-button color="primary" @click="promptAdd">
                        <ion-icon :icon="add" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="app-surface" :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar class="app-surface">
                    <ion-title size="large">Categorieën</ion-title>
                </ion-toolbar>
            </ion-header>

            <ion-list v-if="categoriesStore.categories.length" class="app-transparent-list">
                <VueDraggable
                    :model-value="categoriesStore.categories"
                    @update:model-value="onReorder"
                    :animation="150"
                    item-key="id"
                    :delay="300"
                    :delay-on-touch-only="true"
                >
                    <ion-item v-for="category in categoriesStore.categories" :key="category.id" class="app-transparent-item" button @click="navigateToCategory(category.id)">
                        <ion-label>{{ category.name }}</ion-label>
                        <ion-note slot="end">{{ passesStore.passes.filter(pass => pass.categoryId === category.id).length }}</ion-note>
                        <ion-button fill="clear" slot="end" @click.stop="promptRename(category.id, category.name)">
                            <ion-icon :icon="createOutline" />
                        </ion-button>
                        <ion-button fill="clear" color="danger" slot="end" @click.stop="promptDelete(category.id, category.name)">
                            <ion-icon :icon="trashBinOutline" />
                        </ion-button>
                    </ion-item>
                </VueDraggable>
            </ion-list>

            <div v-else class="empty-state">
                <p>Nog geen categorieën.</p>
                <ion-button @click="promptAdd">Categorie toevoegen</ion-button>
            </div>
        </ion-content>
    </ion-page>
</template>

<style scoped>
.empty-state {
    text-align: center;
    padding: 2rem;
    color: var(--ion-color-medium);
}
</style>
