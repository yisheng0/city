import * as Cesium from "cesium";

//加载geoserver  WMS
let layerWms;
let wmsImageryProvider;
export const loadWms = (viewer, bool) => {
    wmsImageryProvider = new Cesium.WebMapServiceImageryProvider({
        url: 'http://localhost:8081/geoserver/ne/wms',
        layers: ' ne:world',
        parameters: {
            service: 'WMS',
            transparent: true,     //是否透明
            format: ' image/png',
            srs: 'EPSG:4326',
        }
    })
    if (bool) {
        layerWms = viewer.imageryLayers.addImageryProvider(wmsImageryProvider);
    } else {
        viewer.imageryLayers.remove(layerWms)
        console.log(111)
    }
    viewer.scene.requestRender();

}


//加载geoserver  WMtS
let WMTSImageryProvider;
let layerWMTS
export const loadWmts = (viewer, wtBool) => {
    WMTSImageryProvider = new Cesium.WebMapTileServiceImageryProvider({
        url: 'http://localhost:8081/geoserver/gwc/service/wmts/rest/ne:anhuiRiver/{style}/{TileMatrixSet}/{TileMatrixSet}:{TileMatrix}/{TileRow}/{TileCol}?format=image/png',
        layer: 'ne:anhuiRiver',
        tileMatrixSetID: "EPSG:4326",
        tilingScheme: new Cesium.GeographicTilingScheme(),
        style: '',

        format: 'image/png',
        Service: 'WMTS'

    });
    if (wtBool) {
        layerWMTS = viewer.imageryLayers.addImageryProvider(WMTSImageryProvider);
    } else {
        viewer.imageryLayers.remove(layerWMTS)
        console.log(222)
    }
    viewer.scene.requestRender();
}


let tdtImgLayerProvider;
let layerTDT;
export const loadTdt = (viewer, bool) => {
    tdtImgLayerProvider = new Cesium.WebMapTileServiceImageryProvider({
        url: "http://{s}.tianditu.gov.cn/cia_c/wmts?service=wmts&request=GetTile&version=1.0.0" +
            "&LAYER=cia&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}" +
            "&style=default&format=tiles&tk=745283c8a223f1683a3249b709bc83cb",
        layer: "tdtCva",
        style: "default",
        format: "tiles",
        tileMatrixSetID: "c",
        subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
        tilingScheme: new Cesium.GeographicTilingScheme(),
        tileMatrixLabels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"],
        maximumLevel: 18
    });
    if (!bool) {
        layerTDT = viewer.imageryLayers.addImageryProvider(tdtImgLayerProvider);
    } else {
        viewer.imageryLayers.remove(layerTDT)
        console.log(222)
    }
    viewer.scene.requestRender();
}

let gdLayerProvider;
let layerGd;
export const loadGd = (viewer, bool) => {
    gdLayerProvider = new Cesium.UrlTemplateImageryProvider({
        url: "https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
        minimumLevel: 3,
        maximumLevel: 18
    })
    if (!bool) {
        layerGd = viewer.imageryLayers.addImageryProvider(gdLayerProvider);
    } else {
        viewer.imageryLayers.remove(layerGd)
        console.log(222)
    }
    viewer.scene.requestRender();
}