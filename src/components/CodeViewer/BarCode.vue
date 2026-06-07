<script setup lang="ts">
import JsBarcode from "jsbarcode";
import { onMounted, useTemplateRef, watch } from "vue";

const svgRef = useTemplateRef('canvas');

interface Props {
    data?: string;
    lineColor?: string;
    backgroundColor?: string;
}

const props = withDefaults(defineProps<Props>(),{
    data: '007',
    lineColor: '#000',
    backgroundColor: '#fff',
});

watch(props, () => {
    renderBarcode();
});

onMounted(() => renderBarcode());

const renderBarcode = () => {
    JsBarcode(svgRef.value, props.data, {
        background: props.backgroundColor,
        lineColor: props.lineColor,
        width: 5,
        height: 300,
        margin: 0,        // remove quiet-zone padding so bars fill edge-to-edge
        displayValue: false,
    });
    // JsBarcode sets preserveAspectRatio="xMidYMid meet" by default, which
    // scales bars to *fit* the container and leaves blank space on the sides.
    // "slice" scales to fill the full width instead, cropping excess vertically.
    if (svgRef.value) {
        svgRef.value.setAttribute('preserveAspectRatio', 'xMidYMid slice')
    }
}

</script>

<template>
<svg ref="canvas" />
</template>

<style scoped>
svg {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
}
</style>