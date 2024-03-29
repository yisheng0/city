<template>
  <div class="header">
    <span>智慧管理平台</span>
    <div class="list">
      <el-button type="primary" class="point_event" @click="transition">
        数据展示
      </el-button>
      <el-dropdown>
        <el-button type="primary" class="point_event">
          地图服务<el-icon class="el-icon--right"><arrow-down /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <el-checkbox v-model="checked1" label="WMS" @click="loadWms(viewer, checked1)" />
            </el-dropdown-item>
            <el-dropdown-item>
              <el-checkbox v-model="checked2" label="WMTS" @click="loadWmts(viewer, checked2)" />
            </el-dropdown-item>
            <el-dropdown-item>
              <el-checkbox v-model="checked3" label="天地图注解" @click="loadTdt(viewer, checked3)" />
            </el-dropdown-item>
            <el-dropdown-item>
              <el-checkbox v-model="checked4" label="高德影像" @click="loadGd(viewer, checked4)" />
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-dropdown>
        <el-button type="primary" class="point_event">
          测量<el-icon class="el-icon--right"><arrow-down /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="measureLine(viewer)">导线测量</el-dropdown-item>
            <el-dropdown-item @click="measureArea(viewer)">面积测量</el-dropdown-item>
            <el-dropdown-item @click="removeGeometrys(viewer)">点击清除</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-dropdown>
        <el-button type="primary" class="point_event">
          三维分析<el-icon class="el-icon--right"><arrow-down /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="analysisVisible(viewer)">通视分析</el-dropdown-item>
            <el-dropdown-item @click="profile(viewer)">剖面分析</el-dropdown-item>
            <el-dropdown-item @click="submerge(viewer)">淹没分析</el-dropdown-item>
            <el-dropdown-item @click="toolbar = !toolbar">高程分析</el-dropdown-item>
            <el-dropdown-item @click="clip(viewer)">地形开挖</el-dropdown-item>
            <el-dropdown-item @click="single(viewer)">单体化</el-dropdown-item>
            <el-dropdown-item @click="removeGeometrys(viewer)">点击清除</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-dropdown>
        <el-button type="primary" class="point_event">
          组件复用<el-icon class="el-icon--right"><arrow-down /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="pop(viewer)">弹窗</el-dropdown-item>
            <el-dropdown-item @click="renderjuan">卷帘</el-dropdown-item>
            <el-dropdown-item @click="renderyingyang">鹰眼</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

  </div>
  <div class="main" v-if="data" ref="main">
    <div class="left">
      <HorizontalBar :data="data.regionData" />
      <RadarBar :data="data.riskData" />
    </div>
    <div class="middle"></div>
    <div class="right">
      <VerticalBar :data="data.serverData" />
      <Relation :data="data.relationData" />
    </div>
  </div>
  <heightToolbar v-if="viewer && toolbar" />

  <div id="cesiumContainer" ref="cesiumContainer"></div>
</template>

<script setup>
import * as Cesium from "cesium";
import { onMounted, ref, h, render, watch } from "vue";

import HorizontalBar from "./components/HorizontalBar.vue"
import RadarBar from "./components/RadarBar.vue"
import Relation from "./components/Relation.vue"
import VerticalBar from "./components/VerticalBar.vue"
import heightToolbar from "./components/heightToolbar.vue"

import { ArrowDown } from '@element-plus/icons-vue'

import { measureArea, measureLine, removeGeometrys } from "./cesium/measure"
import { modifyBulid, modifyMap } from "./cesium/modify"
import { clip, profile, analysisVisible, submerge } from "./cesium/analysis"
import { loadWms, loadWmts, loadGd, loadTdt } from "./cesium/layerService"
import { single } from "./cesium/single"


import { options } from "./cesium/navigation"
import mousePosition from "./cesium/mousePosition"
import CesiumNavigation from "cesium-navigation-es6";


import pop from "./page/tool/pop"
import juan from "./page/juan.vue"
import yingyang from "./page/yingyang.vue"

const data = ref(null)
const sse = new EventSource('http://localhost:3000/sse');
sse.addEventListener('message', handleSSEMessage);
function handleSSEMessage(event) {
  data.value = JSON.parse(event.data)
}

let toolbar = ref(false)
let show = ref(false);
let main = ref()
function transition() {
  setTimeout(() => {
    if (!show.value) {
    main.value.classList.add("show")
  } else {
    main.value.classList.remove("show")
  }
  show.value = !show.value;
  if (show.value) {
    sse.addEventListener('message', handleSSEMessage);
  } else {
    sse.removeEventListener('message', handleSSEMessage);
  }
  }, 300);

}


const checked1 = ref(false)
const checked2 = ref(false)
const checked3 = ref(false)
const checked4 = ref(false)

let viewer = ref(null)
let bool = ref(false)
onMounted(() => {
  viewer = initViewer();
  window.viewer = viewer;
  bool.value = true;
  addWorldTerrainAsync(viewer);
  addOsmBuildingsAsync(viewer);
  modifyMap(viewer);
  new CesiumNavigation(viewer, options);
  new mousePosition(viewer);

});

const cesiumContainer = ref(null)
const renderjuan = () => {
  if (bool.value) render(h(juan), cesiumContainer.value);
}
const renderyingyang = () => {
  if (bool.value) render(h(yingyang), cesiumContainer.value);
}

const addWorldTerrainAsync = async (viewer) => {
  try {
    const terrainProvider = await Cesium.createWorldTerrainAsync({
      requestVertexNormals: true,
      requestWaterMask: true,
    });
    viewer.terrainProvider = terrainProvider;
  } catch (error) {
    console.log(`Failed to add world imagery: ${error}`);
  }
};
const addOsmBuildingsAsync = async (viewer) => {
  try {
    // const osmBuildings = await Cesium.createOsmBuildingsAsync();
    // viewer.scene.primitives.add(osmBuildings);

    const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(69380);
    viewer.scene.primitives.add(tileset);
  } catch (error) {
    console.log(`Failed to add OSM buildings: ${error}`);
  }
};
import nzUrl from './assets/nx.png'
import nyUrl from './assets/ny.png'
import nxUrl from './assets/nx.png'
import pzUrl from './assets/pz.png'
import pxUrl from './assets/px.png'
import pyUrl from './assets/py.png'
const initViewer = () => {

  const nz = nzUrl;
  const ny = nyUrl;
  const nx = nxUrl;
  const py = pyUrl;
  const px = pxUrl;
  const pz = pzUrl;
  // Cesium.CESIUM_BASE_URL = '/'
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
  const viewer = new Cesium.Viewer("cesiumContainer", {
    //地形
    // terrainProvider: Cesium.createWorldTerrain({
    //   requestVertexNormals: true,
    //   requestWaterMask: true,
    // }),

    //删除提示框
    infoBox: false,
    //搜索框
    // geocoder: false,
    //home
    homeButton: true,
    //查看器的显示模式
    sceneModePicker: false,
    //图层的选择
    baseLayerPicker: false,
    //帮助按钮
    navigationHelpButton: false,
    // 底部时间
    timeline: false,
    //全屏按钮
    fullscreenButton: false,
    animation: false,
  });
  viewer.scene.skyBox = new Cesium.SkyBox({
    sources: {
      positiveX: px,
      negativeX: nx,
      positiveY: pz,
      negativeY: nz,
      positiveZ: py,
      negativeZ: ny,
    }
  })
  //隐藏logo
  viewer.cesiumWidget.creditContainer.style.display = "none";
  //天安门
  // let position1 = Cesium.Cartesian3.fromDegrees(116.397428, 39.90923, 1000);
  //广州塔
  // let position2 = Cesium.Cartesian3.fromDegrees(113.3191, 23.109, 2000);
  //墨尔本
  let position = Cesium.Cartesian3.fromDegrees(144.9667, -37.8333, 2000);
  //fly to,让相机飞到某个地方
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
  //添加3D建筑
  // const omsBuilding = viewer.scene.primitives.add(
  //   new Cesium.createOsmBuildings()
  // );
  return viewer;
}
</script>
<style scoped lang="less">
* {
  margin: 0;
  padding: 0%;
}

#cesiumContainer {
  width: 100vw;
  height: 100vh;
  z-index: -1;
  position: fixed;
}

.header {
  width: 100vw;
  height: 8vh;
  background-image: url(./assets/head.png);
  background-size: 100% 100%;
  background-position: center;
  pointer-events: none;
  z-index: 1;
  position: fixed;

  span {
    text-align: center;
    line-height: 8vh;
    font-size: 35px;
    margin-left: 8vw;
    color: rgb(6, 38, 56);
  }

  .list {
    position: absolute;
    top: 1vh;
    left: 40vw;
  }

  .point_event {
    pointer-events: auto;
    height: 6vh;
    background-color: rgb(57, 115, 205);
  }
}

.main {
  z-index: 1;
  height: 80vh;
  width: 100vw;
  display: flex;
  position: absolute;
  top: 8vh;
  pointer-events: none;
  margin-top: 4vh;
  visibility: hidden;
  opacity: 0;
  transition: 1.2s;
  transform: translateY(100px);

  .left {
    flex: 1 1 0%;
    margin-right: 0.5rem;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    // background-color: rgba(255, 255, 255, 0.5);
  }

  .middle {
    width: 50%;
    background-color: rgba(255, 255, 255, 0);
  }

  .right {
    flex: 1 1 0%;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    // background-color: rgba(255, 255, 255, 0.5);
  }
}

.example-showcase .el-dropdown+.el-dropdown {
  margin-left: 15px;
}

.example-showcase .el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}

.show {
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
}

#toolbar {
  position: fixed;
  top: 40vh;
}
</style>
