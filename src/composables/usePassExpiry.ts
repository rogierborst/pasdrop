import { computed, type Ref } from 'vue';
import { format, formatDistanceToNow, parseISO, isPast } from 'date-fns';
import { nl } from 'date-fns/locale';

export function usePassExpiry(expires: Ref<string | undefined | null>) {
    const expiryDate = computed(() => {
        if (!expires.value) return null;
        try { return parseISO(expires.value); } catch { return null; }
    });

    const expiryLabel = computed(() => {
        if (!expiryDate.value) return null;
        return format(expiryDate.value, 'd MMMM yyyy', { locale: nl });
    });

    const expiryDistance = computed(() => {
        if (!expiryDate.value) return null;
        const expired = isPast(expiryDate.value);
        const distance = formatDistanceToNow(expiryDate.value, { locale: nl, addSuffix: false });
        const capitalizedDistance = distance.charAt(0).toUpperCase() + distance.slice(1);

        return expired ? `${capitalizedDistance} verlopen` : `Nog ${distance} geldig`;
    });

    const isExpired = computed(() => {
        if (!expiryDate.value) return false;
        return isPast(expiryDate.value);
    });

    return { expiryLabel, expiryDistance, isExpired };
}
