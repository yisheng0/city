<template>
    <div id="eye">
    </div>
</template>

<script setup>
import { onMounted,ref } from 'vue';
import * as Cesium from "cesium";

const eyeViewer = ref(null);
const viewer = window.viewer;
onMounted(() => {
  eyeViewer.value =  initViewer();
//   setViewer(eyeViewer.value)
eyeViewer.value.scene.preRender.addEventListener(syncViewer2);
window.viewer.scene.preRender.addEventListener(syncViewer); 

});
const initViewer = () => {
//设置Token
Cesium.Ion.defaultAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlNTg1ZmQzYi1lNzAwLTRiMGQtODE1Mi0yNmUwNDk3ZGUwMjYiLCJpZCI6MTMwOTM2LCJpYXQiOjE3MDE5Mzc5ODJ9.kSCxGJaaVPzOHCgEabB6qUT7LrNmCbecw4y_dsmjEgs'
//设置cesium默认视角

Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
  //西 南 东 北
  89.5,
  20.4,
  110.4,
  61.2
);
const viewer = new Cesium.Viewer("eye", {
  infoBox: false,
  geocoder: false,
  homeButton: false,
  sceneModePicker: false,
  baseLayerPicker: false,
  navigationHelpButton: false,
  timeline: false,
  fullscreenButton: false,
  animation: false,
});
viewer.cesiumWidget.creditContainer.style.display = "none";
let position = Cesium.Cartesian3.fromDegrees(144.9667, -37.8333, 2000);
viewer.camera.flyTo({
  destination: position,
  orientation: {
    //朝向
    heading: Cesium.Math.toRadians(0),
    //俯仰角
    pitch: Cesium.Math.toRadians(-60),
    //翻滚角
    roll: 0,
  },
});
return viewer;
}
//禁用鹰眼地图的操作
const setViewer = (viewer) => {
    let control = viewer.scene.screenSpaceCameraController;
    control.enableRotate = false;
    control.enableTranslate = false;
    control.enableZoom = false;
    control.enableTilt = false;
    control.enableLook = false;
}
//鹰眼地图与主地图同步
const syncViewer = () =>{
    eyeViewer.value.camera.flyTo({
        destination: viewer.camera.position,
        orientation: {
            heading: viewer.camera.heading,
            pitch: viewer.camera.pitch,
            roll: viewer.camera.roll
        },
        duration: 0.0
    });
};
const syncViewer2 = () =>{
    viewer.camera.flyTo({
        destination: eyeViewer.value.camera.position,
        orientation: {
            heading: eyeViewer.value.camera.heading,
            pitch: eyeViewer.value.camera.pitch,
            roll: eyeViewer.value.camera.roll
        },
        duration: 0.0
    });
};

</script>

<style>
#eye{
    position: absolute;
    right: 0;
    bottom: 10%;
    width:300px;
    height:300px;
    z-index: 999;
}

</style>