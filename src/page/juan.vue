<template>
    <div id="slider"></div>
</template>
  
<script setup>
import { ref, onMounted } from "vue";
import * as Cesium from "cesium";

let viewer = window.viewer;
const layers = viewer.imageryLayers;


const bingMapsAerialWithLabels = Cesium.ImageryLayer.fromProviderAsync(
    Cesium.IonImageryProvider.fromAssetId(3)
);
bingMapsAerialWithLabels.splitDirection = Cesium.SplitDirection.LEFT;
layers.add(bingMapsAerialWithLabels);


const bingMapsAerial = Cesium.ImageryLayer.fromProviderAsync(
    Cesium.IonImageryProvider.fromAssetId(2)
);
bingMapsAerial.splitDirection = Cesium.SplitDirection.RIGHT;
layers.add(bingMapsAerial);

// Add high resolution Washington DC imagery to both panels.
const imageryLayer = Cesium.ImageryLayer.fromProviderAsync(
    Cesium.IonImageryProvider.fromAssetId(3827)
);
viewer.imageryLayers.add(imageryLayer);

// Add Bing Maps Labels Only to the right panel
const bingMapsLabelsOnly = Cesium.ImageryLayer.fromProviderAsync(
    Cesium.IonImageryProvider.fromAssetId(2411391)
);
bingMapsLabelsOnly.splitDirection = Cesium.SplitDirection.RIGHT; // Only show to the left of the slider.
layers.add(bingMapsLabelsOnly);

// Zoom to the Washington DC imagery
viewer.zoomTo(imageryLayer);


onMounted(() => {
    const slider = document.getElementById("slider");
    if (slider) {
        const dom = slider;
        if (dom.parentElement) {
            let handler = new Cesium.ScreenSpaceEventHandler(dom);
            viewer.scene.splitPosition =
                dom.offsetLeft / dom.parentElement.offsetWidth;
            let moveActive = false;
            function move(movement) {
                if (!moveActive) {
                    return;
                }
                const relativeOffset = movement.endPosition.x;
                if (dom.parentElement) {
                    const splitPosition =
                        (dom.offsetLeft + relativeOffset) / dom.parentElement?.offsetWidth;
                    dom.style.left = `${100.0 * splitPosition}%`;
                    viewer.scene.splitPosition = splitPosition; // 设置卷帘左右分区范围(0-1)之间
                }
            }
            handler.setInputAction(function () {
                moveActive = true;
            }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
            handler.setInputAction(function () {
                moveActive = true;
            }, Cesium.ScreenSpaceEventType.PINCH_START);

            handler.setInputAction(move, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            handler.setInputAction(move, Cesium.ScreenSpaceEventType.PINCH_MOVE);

            handler.setInputAction(function () {
                moveActive = false;
            }, Cesium.ScreenSpaceEventType.LEFT_UP);
            handler.setInputAction(function () {
                moveActive = false;
            }, Cesium.ScreenSpaceEventType.PINCH_END);
        }
    }
})



</script>
<style scoped>
#slider {
    position: absolute;
    left: 50%;
    top: 0px;
    background-color: #d3d3d3;
    width: 5px;
    height: 100%;
    z-index: 9999;
}

#slider:hover {
    cursor: ew-resize;
}
</style>