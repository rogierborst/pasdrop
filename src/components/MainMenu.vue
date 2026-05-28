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
        <ion-content>
            <ion-list id="inbox-list">
                <ion-list-header>PasDrop</ion-list-header>
                <ion-note>Al je pasjes op één plek</ion-note>

                <ion-menu-toggle :auto-hide="false" v-for="(page, i) in appPages" :key="i">
                    <ion-item
                        router-direction="root"
                        :router-link="page.url"
                        lines="none"
                        :detail="false"
                        class="hydrated"
                        :class="{ selected: selectedIndex === i }"
                    >
                        <ion-icon aria-hidden="true" slot="start" :ios="page.iosIcon" :md="page.mdIcon" />
                        <ion-label>{{ page.title }}</ion-label>
                    </ion-item>
                </ion-menu-toggle>

                <ion-item lines="none" :detail="false" button @click="handleAddPass">
                    <ion-icon aria-hidden="true" slot="start" :ios="barcodeOutline" :md="barcode" />
                    <ion-label>Pas toevoegen</ion-label>
                </ion-item>
            </ion-list>

            <ion-list v-if="categoriesStore.categories.length" id="categories-list">
                <ion-list-header>Categorieën</ion-list-header>
                <ion-menu-toggle :auto-hide="false" v-for="cat in categoriesStore.categories" :key="cat.id">
                    <ion-item
                        router-direction="root"
                        router-link="/passes"
                        lines="none"
                        :detail="false"
                        @click="selectCategory(cat.id)"
                    >
                        <ion-label>{{ cat.name }}</ion-label>
                    </ion-item>
                </ion-menu-toggle>
            </ion-list>
            <ion-list id="settings-list">
                <ion-item lines="none" :detail="false">
                    <ion-icon aria-hidden="true" slot="start" :icon="moonOutline" />
                    <ion-label>Donkere modus</ion-label>
                    <ion-toggle slot="end" :checked="themeStore.isDark" @ion-change="themeStore.toggle()" />
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-menu>
</template>

<style scoped>
ion-menu ion-content {
    --background: var(--app-surface);
}

ion-menu ion-list {
    --background: transparent;
    background: transparent;
}

ion-menu ion-item {
    --background: transparent;
    --background-hover: rgba(128, 128, 128, 0.08);
    --background-activated: rgba(128, 128, 128, 0.12);
}

ion-menu.md ion-content {
    --padding-start: 8px;
    --padding-end: 8px;
    --padding-top: 20px;
    --padding-bottom: 20px;
}

ion-menu.md ion-list {
    padding: 20px 0;
}

ion-menu.md ion-note {
    margin-bottom: 30px;
}

ion-menu.md ion-list-header,
ion-menu.md ion-note {
    padding-left: 10px;
}

ion-menu.md ion-list#inbox-list {
    border-bottom: 1px solid var(--ion-background-color-step-150, #d7d8da);
}

ion-menu.md ion-list#inbox-list ion-list-header {
    font-size: 22px;
    font-weight: 600;

    min-height: 20px;
}

ion-menu.md ion-list#labels-list ion-list-header {
    font-size: 16px;

    margin-bottom: 18px;

    color: #757575;

    min-height: 26px;
}

ion-menu.md ion-item {
    --padding-start: 10px;
    --padding-end: 10px;
    border-radius: 4px;
}

ion-menu.md ion-item.selected {
    --background: rgba(var(--ion-color-primary-rgb), 0.14);
}

ion-menu.md ion-item.selected ion-icon {
    color: var(--ion-color-primary);
}

ion-menu.md ion-item ion-icon {
    color: #616e7e;
}

ion-menu.md ion-item ion-label {
    font-weight: 500;
}

ion-menu.ios ion-content {
    --padding-bottom: 20px;
}

ion-menu.ios ion-list {
    padding: 20px 0 0 0;
}

ion-menu.ios ion-note {
    line-height: 24px;
    margin-bottom: 20px;
}

ion-menu.ios ion-item {
    --padding-start: 16px;
    --padding-end: 16px;
    --min-height: 50px;
}

ion-menu.ios ion-item.selected ion-icon {
    color: var(--ion-color-primary);
}

ion-menu.ios ion-item ion-icon {
    font-size: 24px;
    color: #73849a;
}

ion-menu.ios ion-list#labels-list ion-list-header {
    margin-bottom: 8px;
}

ion-menu.ios ion-list-header,
ion-menu.ios ion-note {
    padding-left: 16px;
    padding-right: 16px;
}

ion-menu.ios ion-note {
    margin-bottom: 8px;
}

ion-note {
    display: inline-block;
    font-size: 16px;

    color: var(--ion-color-medium-shade);
}

ion-item.selected {
    --color: var(--ion-color-primary);
}
</style>
