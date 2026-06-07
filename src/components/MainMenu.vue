<script setup lang="ts">
import {
    barcode,
    barcodeOutline,
    cardOutline,
    cardSharp,
    moonOutline,
    pricetagOutline,
    pricetagSharp
} from 'ionicons/icons';
import {
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonMenu,
    IonMenuToggle,
    IonNote,
    IonToggle
} from '@ionic/vue';
import { useCategoriesStore } from '@/stores/categories';
import { useThemeStore } from '@/stores/theme';
import { useAddPassFlow } from '@/composables/useAddPassFlow';
import { onBeforeMount, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { menuController } from '@ionic/vue';

const categoriesStore = useCategoriesStore();
const themeStore = useThemeStore();
const router = useRouter();
const { requestAddPass } = useAddPassFlow();

const handleAddPass = async () => {
    await menuController.close();
    if (route.path !== '/passes') await router.replace('/passes');
    requestAddPass(); // set AFTER menu is closed so PassesPage watcher fires cleanly
};

onBeforeMount(() => {
    categoriesStore.loadCategories();
    themeStore.load();
});

const selectCategory = (categoryId: string | null) => {
    categoriesStore.selectedCategoryId = categoryId;
};

const route = useRoute();
const appPages = [
    {
        title: 'Passen',
        url: '/passes',
        iosIcon: cardOutline,
        mdIcon: cardSharp
    },
    {
        title: 'Categorieën',
        url: '/categories',
        iosIcon: pricetagOutline,
        mdIcon: pricetagSharp
    },
];
const selectedIndex = computed(() =>
    appPages.findIndex(page => page.url.toLowerCase() === route.path.toLowerCase())
);
</script>

<template>
    <ion-menu content-id="main-content" type="overlay">
        <ion-content class="app-surface">
            <ion-list id="inbox-list" class="app-transparent-list border-b border-(--ion-background-color-step-150,#d7d8da)">
                <ion-list-header class="min-h-5 text-[22px] font-semibold">PasD'rop</ion-list-header>
                <ion-note class="inline-block text-base text-(--ion-color-medium-shade)">Al je pasjes op één plek</ion-note>

                <ion-menu-toggle :auto-hide="false" v-for="(page, i) in appPages" :key="i">
                    <ion-item
                        router-direction="root"
                        :router-link="page.url"
                        lines="none"
                        :detail="false"
                        class="app-transparent-item hydrated"
                        :class="{ selected: selectedIndex === i }"
                    >
                        <ion-icon aria-hidden="true" slot="start" :ios="page.iosIcon" :md="page.mdIcon" />
                        <ion-label class="font-medium">{{ page.title }}</ion-label>
                    </ion-item>
                </ion-menu-toggle>

                <ion-item lines="none" :detail="false" button class="app-transparent-item" @click="handleAddPass">
                    <ion-icon aria-hidden="true" slot="start" :ios="barcodeOutline" :md="barcode" />
                    <ion-label class="font-medium">Pas toevoegen</ion-label>
                </ion-item>
            </ion-list>

            <ion-list v-if="categoriesStore.categories.length" id="categories-list" class="app-transparent-list">
                <ion-list-header>Categorieën</ion-list-header>
                <ion-menu-toggle :auto-hide="false" v-for="cat in categoriesStore.categories" :key="cat.id">
                    <ion-item
                        router-direction="root"
                        router-link="/passes"
                        lines="none"
                        :detail="false"
                        class="app-transparent-item"
                        @click="selectCategory(cat.id)"
                    >
                        <ion-label class="font-medium">{{ cat.name }}</ion-label>
                    </ion-item>
                </ion-menu-toggle>
            </ion-list>
            <ion-list id="settings-list" class="app-transparent-list">
                <ion-item lines="none" :detail="false" class="app-transparent-item">
                    <ion-icon aria-hidden="true" slot="start" :icon="moonOutline" />
                    <ion-label class="font-medium">Donkere modus</ion-label>
                    <ion-toggle slot="end" :checked="themeStore.isDark" @ion-change="themeStore.toggle()" />
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-menu>
</template>

<style scoped>
@import './MainMenu.css';
</style>
