<script setup lang="ts">
import {
    IonContent, IonButtons, IonButton, IonPage, IonHeader, IonToolbar, IonIcon,
    IonBackButton, IonTitle, onIonViewWillEnter, alertController,
} from '@ionic/vue';
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import { trashBinSharp, createOutline } from 'ionicons/icons';
import CodeViewer from '@/components/CodeViewer/CodeViewer.vue';
import BarCode from '@/components/CodeViewer/BarCode.vue';
import QRCodeVue from '@/components/CodeViewer/QR-Code.vue';
import { Pass, usePassesStore } from '@/stores/passes';
import { useThemeStore } from '@/stores/theme';
import { format, formatDistanceToNow, parseISO, isPast } from 'date-fns';
import { nl } from 'date-fns/locale';

const router = useRouter();
const route = useRoute();
const pass = ref<Pass | null>(null);
const passesStore = usePassesStore();
const themeStore = useThemeStore();
const d = computed(() => themeStore.isDark);

const fetchPass = () => {
    pass.value = passesStore.getPassById(route.params.id as string) ?? null;
};
onIonViewWillEnter(() => fetchPass());
onMounted(() => fetchPass());

const fullscreen = ref(false);

const expiryDate = computed(() => {
    if (!pass.value?.expires) return null;
    try { return parseISO(pass.value.expires); } catch { return null; }
});

const expiryLabel = computed(() => {
    if (!expiryDate.value) return null;
    return format(expiryDate.value, 'd MMMM yyyy', { locale: nl });
});

const expiryDistance = computed(() => {
    if (!expiryDate.value) return null;
    const expired = isPast(expiryDate.value);
    const distance = formatDistanceToNow(expiryDate.value, { locale: nl, addSuffix: true });
    return expired ? `Verlopen ${distance}` : `Verloopt ${distance}`;
});

const removePass = async () => {
    const alert = await alertController.create({
        header: 'Pas verwijderen',
        message: `Weet je zeker dat je "${pass.value?.label}" wilt verwijderen?`,
        buttons: [
            { text: 'Annuleren', role: 'cancel' },
            { text: 'Verwijderen', role: 'confirm' },
        ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role === 'confirm') {
        await passesStore.deletePass(route.params.id as string);
        await router.replace('/passes');
    }
};

const fieldLabelStyle = computed(() => ({
    fontSize: '10px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    fontWeight: '600',
    color: d.value ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
    marginBottom: '5px',
}));

const closeBtnStyle = computed(() => ({
    position: 'absolute' as const,
    top: 'calc(16px + env(safe-area-inset-top))',
    right: '16px',
    zIndex: '1',
    width: '44px',
    height: '44px',
    borderRadius: '22px',
    background: d.value ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
}));
</script>

<template>
    <IonPage>
        <IonHeader :translucent="true">
            <IonToolbar>
                <IonButtons slot="start">
                    <IonBackButton default-href="/passes" />
                </IonButtons>
                <IonTitle>{{ pass?.label }}</IonTitle>
                <IonButtons slot="end">
                    <IonButton fill="clear" @click="router.push(`/pass/${route.params.id}/edit`)">
                        <IonIcon :icon="createOutline" />
                    </IonButton>
                    <IonButton fill="clear" color="danger" @click="removePass">
                        <IonIcon :icon="trashBinSharp" />
                    </IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>

        <IonContent :fullscreen="true" :style="{ '--background': pass?.color ?? 'var(--ion-background-color)' }">
            <div v-if="pass" class="px-5 pt-5 pb-8 flex flex-col gap-4">

                <!-- Barcode panel — tap to open Fullscreen Viewer -->
                <div
                    class="flex flex-col items-center bg-white rounded-[18px] cursor-pointer select-none"
                    :style="pass.format === 'QR_CODE' ? { padding: '28px 28px 20px' } : { padding: '28px 20px 20px' }"
                    @click="fullscreen = true"
                >
                    <div class="text-[10px] font-bold tracking-[0.14em] uppercase text-black/40 mb-3">
                        {{ pass.format === 'QR_CODE' ? 'QR Code' : 'Barcode' }}
                    </div>
                    <div v-if="pass.format !== 'QR_CODE'" class="w-full h-[110px]">
                        <BarCode :data="pass.data" lineColor="#111" backgroundColor="#ffffff" />
                    </div>
                    <div v-else class="size-[200px] mx-auto">
                        <QRCodeVue :data="pass.data" lineColor="#111" backgroundColor="#ffffff" />
                    </div>
                    <div class="mt-3 text-xs tracking-[0.18em] text-black/35 font-medium text-center break-all">
                        {{ pass.data }}
                    </div>
                    <div class="mt-2 text-[10px] tracking-[0.08em] text-black/25 font-medium">
                        Tik om te vergroten
                    </div>
                </div>

                <!-- Expiry banner -->
                <div v-if="expiryLabel" class="flex flex-col items-center gap-0.5">
                    <span class="text-base font-semibold text-white/90">{{ expiryLabel }}</span>
                    <span class="text-sm text-white/60">{{ expiryDistance }}</span>
                </div>

                <!-- Details card -->
                <div class="rounded-[18px] px-5 py-4 flex flex-col gap-4" :style="{ background: d ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.7)' }">
                    <div>
                        <div :style="fieldLabelStyle">Naam</div>
                        <div class="text-[15px] font-medium" :style="{ color: d ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)' }">{{ pass.label }}</div>
                    </div>
                    <div v-if="pass.notes">
                        <div :style="fieldLabelStyle">Notities</div>
                        <div class="whitespace-pre-wrap text-[15px] font-medium opacity-60" :style="{ color: d ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)' }">{{ pass.notes }}</div>
                    </div>
                    <div>
                        <div :style="fieldLabelStyle">Kleur</div>
                        <div class="w-5 h-5 rounded-[6px]" :style="{ background: pass.color }" />
                    </div>
                    <div>
                        <div :style="fieldLabelStyle">Verloopt</div>
                        <div class="text-[15px] font-medium" :style="{ color: d ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)' }">{{ expiryLabel || '—' }}</div>
                    </div>
                </div>
            </div>
        </IonContent>

        <!-- Fullscreen Viewer -->
        <Teleport to="body">
            <div v-if="fullscreen && pass" class="fixed inset-0 z-[10000] bg-(--fullscreen-surface) flex flex-col">
                <button :style="closeBtnStyle" @click="fullscreen = false">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="d ? '#fff' : '#000'" stroke-width="2.5" stroke-linecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
                <div class="flex-1 w-full">
                    <CodeViewer :data="pass" />
                </div>
            </div>
        </Teleport>
    </IonPage>
</template>