<script setup lang="ts">
import { IonApp, IonRouterOutlet, useIonRouter } from '@ionic/vue';
import { onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications, type ActionPerformed } from '@capacitor/local-notifications';
import MainMenu from '@/components/MainMenu.vue';
import { useThemeStore } from '@/stores/theme';

const ionRouter = useIonRouter();
const route = useRoute();
const router = useRouter();

const themeStore = useThemeStore();

let backButtonListener: { remove: () => void } | null = null;
let notificationTapListener: { remove: () => void } | null = null;
onMounted(async () => {
    themeStore.load();
    backButtonListener = await App.addListener('backButton', () => {
        if (ionRouter.canGoBack()) {
            ionRouter.back();
        } else if (route.path !== '/passes') {
            router.replace('/passes');
        } else {
            App.exitApp();
        }
    });

    if (Capacitor.getPlatform() !== 'web') {
        notificationTapListener = await LocalNotifications.addListener(
            'localNotificationActionPerformed',
            (action: ActionPerformed) => {
                const passId = action.notification.extra?.passId;
                if (passId) router.push(`/pass/${passId}`);
            }
        );
    }
});
onUnmounted(() => {
    backButtonListener?.remove();
    notificationTapListener?.remove();
});
</script>

<template>
    <ion-app>
        <ion-split-pane content-id="main-content">
            <MainMenu />
            <ion-router-outlet id="main-content" />
        </ion-split-pane>
    </ion-app>
</template>


